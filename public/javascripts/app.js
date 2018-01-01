$(document).ready(function () {
  // Datatable init
  const table = $("#datatables").DataTable({
    ajax: "/getRecordings",
    columns: [
      { data: "id" },
      { data: "meeting_id" },
      { data: "user" },
      { data: "topic" },
      { data: "recording_start" },
      { data: "recording_end" },
      { data: "file_size" },
      { data: "file_type" }
    ],
    columnDefs: [
      {
        targets: [0, 1],
        visible: false,
        searchable: true
      }
    ],
    pageLength: 25
  });

  $("#datatables").on("click", "tr", function () {
    $(this).toggleClass("selected");
  });

  $("#delete").click(function () {
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


  $("#addCoHosts").click((e) => {
    e.preventDefault();

    const emails = $("textarea")
      .val()
      .trim()
      .split(/[\r\n,]+/);
    console.log(emails);

    emails.forEach(email => {
      $.ajax({
        url: `/zoomAltHost/${email}`,
        type: "POST"
      });
    });
  });


  // Video Renditions
  $('#datepicker').datetimepicker({
    format: 'YYYY-MM-DD'
  });

  $('.selectpicker').selectpicker({
    style: 'btn-info',
    size: 8
  });

  $('#videoRenditions').click((e) => {
    e.preventDefault();
    const accountId = $('#acccount').val();
    const update = $('#datepicker').val();
    let renditionsTable = $("#renditionsTable");
    $('#renditionsTable').removeClass('hidden');

    if (!$.fn.DataTable.isDataTable('#renditionsTable')) {
      renditionsTable.DataTable({
        ajax: `/bc/getRenditions/${accountId}/${update}`,
        columns: [
          { data: "videoId" },
          { data: "accountId" },
          { data: "refId" },
          { data: "videoName" },
          { data: "description" },
          { data: "state" },
          { data: "createdAt" },
          { data: "updatedAt" },
          { data: "publishedAt" },
          { data: "duration" },
          { data: "folderId" },
          { data: "digitalMasterId" },
          { data: "tags" },
          { data: "textTrackId" },
          { data: "textTrackSrc" },
          { data: "textTrackLang" },
          { data: "textTrackLabel" },
          { data: "textTrackKind" },
          { data: "renditions" },
          { data: "renditionCount" },
        ],
        columnDefs: [
          {
            targets: [0, 1, 5, 6, 8, 10, 11, 13, 14, 15, 17, 18],
            visible: false,
            searchable: true
          }
        ],
        pageLength: 25,
        processing: true
      });
    } else {
      renditionsTable = new $.fn.dataTable.Api("#renditionsTable");
      renditionsTable.ajax.url(`/bc/getRenditions/${accountId}/${update}`).load();
    }
  })


}); // doc.ready
