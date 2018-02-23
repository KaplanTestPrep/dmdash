import $ from 'jquery';
window.jQuery = $;
window.$ = $;

/*  OR webpack

new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery'
})

*/



$(document).ready(function () {
  // Datatable init
  const table = $("#datatables").DataTable({
    // dom: 'lfrtBip',
    // buttons: [
    //   {
    //     extend: 'csvHtml5',
    //     text: 'Download CSV',
    //     className: 'btn btn-default'
    //    }
    // ],
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
    const emails = $("textarea").val().trim().split(/[\r\n,]+/);

    let percentDone = 0;
    let completed = 0
    let fail = 0;
    let total = emails.length;

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    

    emails.forEach(email => {
      $.ajax({
        url: `/setAlternateHosts/${email}`,
        type: "POST"
      })
      .done(res => {
        console.log(res);
        completed++;
        $('.progress-bar').css("width", `${(completed/total)*100}%`);
        $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
        $('ul#success').append(`<li>${email} Sucessfully processsed.</li>`);
      })
      .fail(err => {
          completed++;
          fail++;
          
          console.log(`${email} Failed: ${err.responseText}`, err);
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#fail').append(`<li>${email} Failed: ${err.responseText}</li>`);
      });
    });
  });


  // Video Renditions
  $('#datepicker').datetimepicker({
    format: 'YYYY-MM-DD'
  });

  $('.selectpicker').selectpicker({
    style: 'btn-default',
    size: 8
  });

  $('#videoRenditions').click((e) => {
    e.preventDefault();
    const accountId = $('#acccount').val();
    const update = $('#datepicker').val();
    let renditionsTable = $("#renditionsTable");

    $('#resultsCard').removeClass('hidden');

    if (!$.fn.DataTable.isDataTable('#renditionsTable')) {
      renditionsTable.DataTable({
        dom: 'lfrtBip',
        buttons: [
          {
            extend: 'csvHtml5',
            text: 'Download CSV',
            className: 'btn btn-default'
          }
        ],
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
  });


  $('#batchRetranscode').click((e) => {
    e.preventDefault();
    const accountId = $('#bcAcccount').val();
    const videos = $('#vidoesToTranscode').val().trim().split(/[\r\n\s,]+/);
    const idType = $('input[name=idType]:checked').val();
    const renditionProfile = $('#bcRenditionProfile').val();
    let percentDone = 0;
    let completed = 0
    let fail = 0;
    let total = videos.length; 


    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 


    videos.forEach(video => {
      $.ajax({
        url: `/bcRetranscode`,
        type: "POST",
        data: {
          accountId,
          videoId: video,
          idType,
          renditionProfile
        }
      })
      .done(res => {
          console.log(res);
          completed++;
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#success').append(`<li>${video} Sucessfully processsed.</li>`);
      })
      .fail(err => {
          completed++;
          fail++;
          
          console.log(`${video} Failed: ${err.responseText}`, err);
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#fail').append(`<li>${video} Failed: ${err.responseText}</li>`);

      })
    });
  });


  $("#imageUploadForm").submit( (e) => {
    $("span#status").removeClass();
    $("span#status").text("");
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");
    e.preventDefault();

    let fileSelect = $("#selectThumbnail");
    console.log(fileSelect);
    let filename = fileSelect.val().split('\\').pop();
    $("#uploadedImage").val(filename);

    let files = fileSelect[0].files;
    let form = new FormData();

    form.append('thumbnail', files[0], files[0].name);
    
    $.ajax({
      url: '/bcThumbnailUpload',
      data: form,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        $("span#status").removeClass();
        $("span#status").addClass('text-success');
        $("span#status").text("  Upload Completed!");
      }
    });

  });


  $('#thumbnailUpdateForm').submit((e) => {
    e.preventDefault();
    const accountId = $('#bcAcccount').val();
    const videos = $('#vidoesToUpdate').val().trim().split(/[\r\n\s,]+/);
    const idType = $('input[name=idType]:checked').val();
    const thumbnailFileName = $('#uploadedImage').val();
    let completed = 0
    let fail = 0;
    let total = videos.length; 

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    videos.forEach( video => {
      $.ajax({
        url: `/bcThumbnailUpdate`,
        type: "POST",
        data: {
          accountId,
          videoId: video,
          idType,
          thumbnailFileName
        }
      })
      .done(res => {
          console.log(res);
          completed++;
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#success').append(`<li>${video} Sucessfully processsed.</li>`);
      })
      .fail(err => {
          completed++;
          fail++;
          
          console.log(`${video} Failed: ${err.responseText}`, err);
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#fail').append(`<li>${video} Failed: ${err.responseText}</li>`);

      })
    });
  });


  // function updateSingleRefId (accountId, oldId, idType, newRefId) {
  //   $('#resultsCard').removeClass('hidden');
  //   $('ul#success').html(""); 
  //   $('ul#fail').html(""); 

  //   $.ajax({
  //     url: `/refIdUpdateTool`,
  //     type: "POST",
  //     data: {
  //       accountId,
  //       oldId,
  //       idType,
  //       newRefId
  //     }
  //   })
  //   .done(res => {
  //       console.log(res);
  //       completed++;
  //       $('.progress-bar').css("width", `${(completed/total)*100}%`);
  //       $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
  //       $('ul#success').append(`<li>${oldId} --> ${newRefId} Sucessfully processsed.</li>`);
  //   })
  //   .fail(err => {
  //       completed++;
  //       fail++;
        
  //       console.log(`${oldId} --> ${newRefId} Failed: ${err.responseText}`, err);
  //       $('.progress-bar').css("width", `${(completed/total)*100}%`);
  //       $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
  //       $('ul#fail').append(`<li>${oldId} > ${newRefId} Failed: ${err.responseText}</li>`);

  //   })
  // }



  $('#refIdUpdateSingleForm').submit((e) => {
    e.preventDefault();

    let completed = 0
    let fail = 0;
    let total = 1
    
    const accountId = $('#bcAcccount').val();
    const oldId = $('#oldId').val().trim();
    const idType = $('input[name=idType]:checked').val();
    const newRefId = $('#newRefId').val().trim();

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    $.ajax({
      url: `/refIdUpdateTool`,
      type: "POST",
      data: {
        accountId,
        oldId,
        idType,
        newRefId
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>${oldId} --> ${newRefId} Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      
      console.log(`${oldId} --> ${newRefId} Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>${oldId} > ${newRefId} Failed: ${err.responseText}</li>`);

    })
  });

  $('#refIdUpdateBatchForm').submit((e) => {
    $("span#status").removeClass();
    $("span#status").text("");
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");
    e.preventDefault();


    const accountId = $('#bcAcccountBatch').val();
    const idType = $('input[name=idTypeBatch]:checked').val();

    const fileSelect = document.getElementById('selectCSV');
    console.log(fileSelect);

    const files = fileSelect.files;
    let form = new FormData();
    form.append('csv', files[0], files[0].name);
    
    $.ajax({
      url: '/refIdUpdateBatch',
      data: form,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        const dataArr = JSON.parse(data);

        console.log("Upload complete:", dataArr);
        $("span#status").removeClass();
        $("span#status").addClass('text-success');
        $("span#status").text("  Upload Completed!");

        var completed = 0
        var fail = 0;
        var total = dataArr,length;

        dataArr.forEach(item => {
          let [oldId, newRefId] = item.split(",");
          // updateSingleRefId(accountId, oldId, idType, newRefId);

          let completed = 0
          let fail = 0;
          let total = 1
     
          $('#resultsCard').removeClass('hidden');
          $('ul#success').html(""); 
          $('ul#fail').html(""); 

          $.ajax({
            url: `/refIdUpdateTool`,
            type: "POST",
            data: {
              accountId,
              oldId,
              idType,
              newRefId
            }
          })
          .done(res => {
            console.log(res);
            completed++;
            $('.progress-bar').css("width", `${(completed/total)*100}%`);
            $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
            $('ul#success').append(`<li>${oldId} --> ${newRefId} Sucessfully processsed.</li>`);
          })
          .fail(err => {
            completed++;
            fail++;
            
            console.log(`${oldId} --> ${newRefId} Failed: ${err.responseText}`, err);
            $('.progress-bar').css("width", `${(completed/total)*100}%`);
            $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
            $('ul#fail').append(`<li>${oldId} > ${newRefId} Failed: ${err.responseText}</li>`);

          })
        });
      }
    });
  });


}); // doc.ready
