import { papaPromisified } from "./utils";
import $ from "jquery";
window.jQuery = $;
window.$ = $;

$(document).ready(function() {
  $("#hapyCreateProj").click(e => handleCreateProject(e));
  $("#hapyDeleteProj").click(e => handleDeleteProject(e));
  $("#hapyCreateAnno").click(e => handleCreateAnno(e));
  $("#hapyDeleteAnno").click(e => handleDeleteAnno(e));
  $("#annotationsImportForm").submit(e => handleAnnotationsImport(e));
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
    ajax: "/listProjects",
    columns: [
      { data: "_id" },
      { data: "id" },
      { data: "title" },
      { data: "video" },
      { data: "brightcoveId" },
      { data: "track" },
      { data: "created" }
    ],
    columnDefs: [
      {
        targets: [0],
        visible: false,
        searchable: true
      }
    ],
    pageLength: 25
  });

  const pathName = window.location.pathname;
  const pathNameSplit = pathName.split("/");
  const slug = pathNameSplit[pathNameSplit.length - 1];

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
    ajax: `/listAnnotations/${slug}`,
    columns: [
      { data: "startTime" },
      { data: "id" },
      { data: "projectId" },
      { data: "type" },
      { data: "created" }
    ],
    columnDefs: [
      {
        targets: [0],
        visible: true,
        searchable: true
      }
    ],
    pageLength: 25
  });

  function handleCreateProject(e) {
    console.log("Project Created!");

    const videoId = $("#bcVideoId").val();

    $.ajax({
      url: `/createProject`,
      type: "POST",
      data: {
        video_source_id: videoId
      }
    })
      .done(res => {
        console.log(res);
      })
      .fail(err => {
        console.log(err);
      });

    projectList.ajax.reload();
  }

  function handleDeleteProject(e) {
    console.log("Project Deleted!");

    const projects = projectList.rows(".selected").data();
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
            data: JSON.stringify({ toBeDeleted: projects[i].id })
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

    const url = `/projects/${projectId}`;

    console.log(url);
    window.location.href = `/getProjectTool/${projectId}`;
  }

  function handleCreateAnno(e) {
    console.log("Create Annotation");

    const pathName = window.location.pathname.split("/");
    const projectId = pathName[pathName.length - 1];

    console.log(projectId);

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
    console.log("Anno Deleted!");

    const annotations = projectDetailsList.rows(".selected").data();
    console.log(annotations);

    const msg = `Are you sure you want to delete ${
      annotations.length
    } projects?`;

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
              annotationId: annotations[i].id
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

    let completed = 0;
    let fail = 0;
    let total = 0;

    const file = document.getElementById("selectCSV").files[0];
    if (!file) return;

    let results = await papaPromisified(file);
    let videos = results.data;
    videos.shift();

    console.log(videos);
  }
});
