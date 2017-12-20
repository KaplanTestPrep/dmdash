// import "../sass/style.scss";

// import { $, $$ } from "./modules/bling";

// Datatable init
$(document).ready(function() {
  const table = $("#datatables").DataTable({
    ajax: "/getRecordings",
    columns: [
      { data: "id" },
      { data: "meeting_id" },
      { data: "user" },
      { data: "topic" },
      { data: "recording_start" },
      { data: "recording_end" },
      { data: "file_size" }
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
    pageLength: 20
  });

  $("#datatables").on("click", "tr", function() {
    $(this).toggleClass("selected");
  });

  $("#test").click(function() {
    console.table(table.rows(".selected").data());
    alert(table.rows(".selected").data().length + " row(s) selected");
  });
});
