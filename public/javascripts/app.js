$(document).ready(function() {

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
      { data: "file_type"}
    ],
    columnDefs: [
      {
        targets: [0],
        visible: false,
        searchable: false
      },
      {
        targets: [1],
        visible: false,
        searchable: false
      }
    ],
    pageLength: 25
  });

  $("#datatables").on("click", "tr", function() {
    $(this).toggleClass("selected");
  });

  $("#test").click(function() {
    console.table(table.rows(".selected").data());
    alert(table.rows(".selected").data().length + " row(s) selected");
  });

  $("#delete").click(function() {
    const recordings = table.rows(".selected").data();
      let toBeDeleted = [];
      for(let i=0; i < recordings.length; i++){
        let rec = {
          id: recordings[i].id,
          meetingId: recordings[i].meeting_id
        }
        toBeDeleted.push(rec);
      }

      $.ajax({
        url: '/deleteRecordings',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(toBeDeleted)
      });


      console.log(JSON.stringify(toBeDeleted));
      location.reload();
  });


});
