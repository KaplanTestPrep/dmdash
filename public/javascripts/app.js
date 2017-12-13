// import "../sass/style.scss";

// import { $, $$ } from "./modules/bling";

  
// Datatable init
$(document).ready(function() {
    const  table = $('#datatables').DataTable( {
        "ajax": "/zoomRecordingsData",
        "columns": [
            { "data": "uuid" },
            { "data": "id" },
            { "data": "account_id" },
            { "data": "host_id" },
            { "data": "topic" },
            { "data": "start_time" },
            { "data": "timezone" },
            { "data": "duration" },
            { "data": "total_size" },
            { "data": "recording_count" },
            { "data": "recording_files" },

        ],
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 2 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 10 ],
                "visible": false,
                "searchable": false
            }
        ],
        "pageLength": 20
    });

    $('#datatables').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
    } );
 
    $('#test').click( function () {
        console.table(table.rows('.selected').data());
        alert( table.rows('.selected').data().length +' row(s) selected' );
    } );
});
