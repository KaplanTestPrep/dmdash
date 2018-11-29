import $ from "jquery";
window.jQuery = $;
window.$ = $;

$(document).ready(function() {
  // Datatable init
  const table = $("#zoomRecordings").DataTable({
    dom: "lfrtBip",
    buttons: [
      {
        extend: "csvHtml5",
        text: "Download CSV",
        className: "btn btn-default",
        filename: "Tutor-recordings-report"
      }
    ],
    ajax: "/getTutorRecordings",
    columns: [
      { data: "user" },
      { data: "topic" },
      { data: "recording_start" },
      { data: "file_type" },
      { data: "download_url" }
    ],
    columnDefs: [
      {
        targets: [3],
        visible: false,
        searchable: true
      }
    ],
    pageLength: 25
  });

  $("#zoomRecordings").on("click", "tr", function() {
    $(this).toggleClass("selected");
  });

  $("#delete").click(function() {
    const recordings = table.rows(".selected").data();
    const msg = `Are you sure you want to delete ${
      recordings.length
    } recordings?`;

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
        let toBeDeleted = [];
        for (let i = 0; i < recordings.length; i++) {
          let rec = {
            id: recordings[i].id,
            meetingId: recordings[i].meeting_id
          };
          toBeDeleted.push(rec);
        }

        $.ajax({
          url: "/deleteRecordings",
          dataType: "json",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(toBeDeleted)
        });

        swal({
          position: "top",
          type: "success",
          title: "Recording(s) deleted!",
          showConfirmButton: false,
          timer: 800,
          buttonsStyling: false
        }).then(result => {
          table
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
  });

  $("#addCoHosts").click(e => {
    e.preventDefault();
    const emails = $("textarea")
      .val()
      .trim()
      .split(/[\r\n,]+/);

    let percentDone = 0;
    let completed = 0;
    let fail = 0;
    let total = emails.length;

    $("#resultsCard").removeClass("hidden");
    $("ul#success").html("");
    $("ul#fail").html("");

    emails.forEach(email => {
      $.ajax({
        url: `/setAlternateHosts/${email}`,
        type: "POST"
      })
        .done(res => {
          console.log(res);
          completed++;
          $(".progress-bar").css("width", `${(completed / total) * 100}%`);
          $("#percentage").text(
            `Progress: ${Math.round((completed / total) * 100)}%`
          );
          $("ul#success").append(`<li>${email} Sucessfully processsed.</li>`);
        })
        .fail(err => {
          completed++;
          fail++;

          console.log(`${email} Failed: ${err.responseText}`, err);
          $(".progress-bar").css("width", `${(completed / total) * 100}%`);
          $("#percentage").text(
            `Progress: ${Math.round((completed / total) * 100)}%`
          );
          $("ul#fail").append(`<li>${email} Failed: ${err.responseText}</li>`);
        });
    });
  });
});
