import $ from "jquery";
window.jQuery = $;
window.$ = $;

$(document).ready(function() {
  $("#hapyCreateProj").click(e => handleCreateProject(e));
  $("#hapyDeleteProj").click(e => handleDeleteProject(e));

  let handleCreateProject = e => {
    console.log("Project Created!");

    $.ajax({
      url: `/createProject`,
      type: "POST",
      data: {
        say: "Hello"
      }
    })
      .done(res => {
        console.log(res);
      })
      .fail(err => {
        console.log(err);
      });
  };

  let handleDeleteProject = e => {
    console.log("Project Deleted!");

    $.ajax({
      url: `/deleteProject`,
      type: "DELETE",
      data: {
        say: "Hello"
      }
    })
      .done(res => {
        console.log(res);
      })
      .fail(err => {
        console.log(err);
      });
  };
});
