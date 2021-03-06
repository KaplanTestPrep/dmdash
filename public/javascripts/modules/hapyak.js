import { papaPromisified } from "../config/utils";
import $ from "jquery";
window.jQuery = $;
window.$ = $;

$(document).ready(function() {
  $("#hapyCreateProj").click(e => handleCreateProject(e));
  $("#hapyDeleteProj").click(e => handleDeleteProject(e));
  $("#hapyCreateAnno").click(e => handleCreateAnno(e));
  $("#hapyDeleteAnno").click(e => handleDeleteAnno(e));
  $("#annotationsImportForm").submit(e => handleAnnotationsImport(e));
  $("#env").change(e => handleLoadNewEnv(e));
  $("#hapyakProjects").on("click", "tr", function() {
    $(this).toggleClass("selected");
  });
  $("#hapyakProjectDetails").on("click", "tr", function() {
    $(this).toggleClass("selected");
  });

  $("#hapyakProjects").on("dblclick", "tr", e => handleProjectDetails(e));

  const projectList = $("#hapyakProjects").DataTable({
    dom: "lfrtBip",
    buttons: [
      {
        extend: "csvHtml5",
        text: "Download CSV",
        className: "btn btn-default",
        filename: "Hapyak_Projects"
      }
    ],
    ajax: {
      url: "/listProjects",
      dataSrc: "",
      data: function(d) {
        d.env = document.getElementById("env").value;
      }
    },
    columns: [
      { data: "id" },
      { data: "title" },
      { data: "video_id" },
      { data: "video_source_id" },
      { data: "track_id" },
      { data: "tags" }
    ],
    columnDefs: [
      // {
      //   targets: [0],
      //   visible: false,
      //   searchable: true
      // },
      { width: 60, targets: [0] },
      { width: 300, targets: [1] },
      { width: 60, targets: [2] },
      { width: 400, targets: [3] },
      { width: 60, targets: [4] }
    ],
    autoWidth: true,
    pageLength: 25
  });

  // const pathName = window.location.pathname;
  const pathNameSplit = window.location.pathname.split("/");
  const slug = pathNameSplit[pathNameSplit.length - 1];
  const envSplit = window.location.href.split("env=");
  const env = envSplit[1];

  const projectDetailsList = $("#hapyakProjectDetails").DataTable({
    dom: "lfrtBip",
    buttons: [
      {
        extend: "csvHtml5",
        text: "Download CSV",
        className: "btn btn-default",
        filename: "ProjectAnnotations"
      }
    ],
    ajax: {
      url: `/listAnnotations/${slug}`,
      dataSrc: "",
      data: function(d) {
        d.env = env;
      }
    },
    columns: [
      { data: "id" },
      { data: "start" },
      { data: "end" },
      { data: "type" },
      { data: "class" }
    ],
    // columnDefs: [
    //   {
    //     targets: [0],
    //     visible: true,
    //     searchable: true
    //   }
    // ],
    pageLength: 25
  });

  async function handleCreateProject(e) {
    console.log("Project Created!");
    const videoId = $("#bcVideoId").val();

    //Create Project
    try {
      await createHapyProject(videoId);
      projectList.ajax.reload();
    } catch (err) {
      console.log(err);
    }
  }

  function handleLoadNewEnv(e) {
    e.preventDefault();
    projectList.ajax.reload();
  }

  function handleDeleteProject(e) {
    const projects = projectList.rows(".selected").data();
    const env = document.getElementById("env").value;
    if (projects.length === 0) {
      swal({
        position: "top",
        type: "warning",
        title: "Nothing selected",
        showConfirmButton: false,
        timer: 800
      });
      return;
    }

    const msg = `Are you sure you want to delete ${projects.length} projects?`;

    swal({
      title: "Are you sure?",
      text: msg,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        for (let i = 0; i < projects.length; i++) {
          $.ajax({
            url: "/deleteProject",
            dataType: "json",
            type: "DELETE",
            contentType: "application/json",
            data: JSON.stringify({ toBeDeleted: projects[i].id, env })
          });
        }

        swal({
          position: "top",
          type: "success",
          title: "Recording(s) deleted!",
          showConfirmButton: false,
          timer: 800,
          buttonsStyling: false
        }).then(result => {
          projectList
            .rows(".selected")
            .remove()
            .draw(false);
        });
        // result.dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
      } else if (result.dismiss) {
        swal({
          position: "top",
          type: "error",
          title: "Canceled!",
          showConfirmButton: false,
          timer: 800,
          buttonsStyling: false
        });
      }
    });
  }

  function handleProjectDetails(e) {
    console.log("Project Details!");
    const projectId = e.currentTarget.children[0].innerText;
    const env = document.getElementById("env").value;

    window.location.href = `/getProjectTool/${projectId}?env=${env}`;
  }

  function handleCreateAnno(e) {
    console.log("Create Annotation");
    const pathName = window.location.pathname.split("/");
    const projectId = pathName[pathName.length - 1];

    $.ajax({
      url: `/createAnnotation`,
      type: "POST",
      data: {
        projectId
      }
    })
      .done(res => {
        console.log(res);
      })
      .fail(err => {
        console.log(err);
      });
  }

  function handleDeleteAnno(e) {
    const annotations = projectDetailsList.rows(".selected").data();
    const env = document.getElementById("env").value;
    if (annotations.length === 0) {
      swal({
        position: "top",
        type: "warning",
        title: "Nothing selected",
        showConfirmButton: false,
        timer: 1000
      });
      return;
    }

    const msg = `Are you sure you want to delete ${
      annotations.length
    } annotation(s)?`;

    swal({
      title: "Are you sure?",
      text: msg,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false
    }).then(result => {
      if (result.value) {
        for (let i = 0; i < annotations.length; i++) {
          $.ajax({
            url: "/deleteAnnotation",
            dataType: "json",
            type: "DELETE",
            contentType: "application/json",
            data: JSON.stringify({
              projectId: annotations[i].projectId,
              annotationId: annotations[i].id,
              env
            })
          });
        }

        swal({
          position: "top",
          type: "success",
          title: "Recording(s) deleted!",
          showConfirmButton: false,
          timer: 800,
          buttonsStyling: false
        }).then(result => {
          projectDetailsList
            .rows(".selected")
            .remove()
            .draw(false);
        });
        // result.dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
      } else if (result.dismiss) {
        swal({
          position: "top",
          type: "error",
          title: "Canceled!",
          showConfirmButton: false,
          timer: 800,
          buttonsStyling: false
        });
      }
    });
  }

  async function handleAnnotationsImport(e) {
    e.preventDefault();
    const env = document.getElementById("env").value;
    const file = document.getElementById("selectCSV").files[0];
    if (!file) return;

    let completed = 0;
    let fail = 0;
    let total = 0;

    $("#resultsCard").removeClass("hidden");
    $("ul#success").html("");
    $("ul#fail").html("");

    let results = await papaPromisified(file, true);
    let dataRows = results.data;
    total = 0;

    let videoIdKey;
    const projectAnnoList = [];

    dataRows.forEach(row => {
      if (row.videoId !== "") {
        videoIdKey = row.videoId;
        projectAnnoList[videoIdKey] = [];
        total++;
      } else {
        let cleanRow = cleanObjectBlanks(row);
        if (!isEmpty(cleanRow)) {
          projectAnnoList[videoIdKey].push(row);
          total++;
        }
      }
    });

    for (let videoId in projectAnnoList) {
      if (!projectAnnoList.hasOwnProperty(videoId)) continue;

      let projectId = null;
      let annotationsArray = projectAnnoList[videoId];

      //Create Project
      try {
        let result = await createHapyProject(env, videoId);
        projectId = result.project.id;

        completed++;
        $(".progress-bar").css("width", `${(completed / total) * 100}%`);
        $("#percentage").text(
          `Progress: ${Math.round((completed / total) * 100)}%`
        );
        $("ul#success").append(
          `<li>${videoId} - Project successfully created.</li>`
        );
      } catch (err) {
        completed += annotationsArray.length + 1;
        fail++;
        $(".progress-bar").css("width", `${(completed / total) * 100}%`);
        $("#percentage").text(
          `Progress: ${Math.round((completed / total) * 100)}%`
        );
        console.log(`${videoId} Failed:`, err);
        $("ul#fail").append(`<li>${videoId} Failed: ${err.responseText}</li>`);
        continue;
      }

      let skipped = annotationsArray.length;
      //Create Annotation
      for (const annotation of annotationsArray) {
        try {
          await createHapyAnnotation(env, annotation, projectId);
          completed++;
          skipped--;

          $(".progress-bar").css("width", `${(completed / total) * 100}%`);
          $("#percentage").text(
            `Progress: ${Math.round((completed / total) * 100)}%`
          );
          $("ul#success").append(
            `<li>${videoId} - Annotation ${
              annotation.type
            } successfully created.</li>`
          );
        } catch (err) {
          completed += skipped;
          fail++;
          $(".progress-bar").css("width", `${(completed / total) * 100}%`);
          $("#percentage").text(
            `Progress: ${Math.round((completed / total) * 100)}%`
          );
          console.log(
            `${videoId} - ${annotation.type} Failed - Project Deleted): `,
            err
          );
          $("ul#fail").append(
            `<li>${videoId} - ${annotation.type} Failed - Project Deleted: ${
              err.responseText
            }</li>`
          );
          deleteHapyProject(projectId);
          // $("ul#fail").append(`<li>Project for video ${videoId} Deleted!</li>`);
          break;
        }
      }
    }
  }

  function createHapyProject(env, videoId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/createProject`,
        type: "POST",
        data: {
          refId: videoId,
          env
        }
      })
        .done(res => {
          return resolve(res);
        })
        .fail(err => {
          return reject(err);
        });
    });
  }

  function createHapyAnnotation(env, annotation, projectId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/createAnnotation`,
        type: "POST",
        data: {
          env,
          projectId,
          annotation
        }
      })
        .done(res => {
          return resolve(res);
        })
        .fail(err => {
          return reject(err);
        });
    });
  }

  function deleteHapyProject(projectId) {
    $.ajax({
      url: "/deleteProject",
      dataType: "json",
      type: "DELETE",
      contentType: "application/json",
      data: JSON.stringify({ toBeDeleted: projectId })
    });
  }

  function cleanObjectBlanks(obj) {
    for (var propName in obj) {
      if (obj[propName] === "") {
        delete obj[propName];
      }
    }
    return obj;
  }

  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
});
