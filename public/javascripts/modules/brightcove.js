import $ from 'jquery';
window.jQuery = $;
window.$ = $;

$(document).ready(function () {

    $('#videoRenditions').click((e) => handleVideoRenditions(e));
    $('#batchRetranscode').click((e) => handleBatchRetranscode(e));
    $("#imageUploadForm").submit((e) => handleImageUploadForm(e));
    $('#thumbnailUpdateForm').submit((e) => handleThumbnailUpdateForm(e));
    $('#refIdUpdateSingleForm').submit((e) => handleRefIdUpdateSingleForm(e));
    $('#refIdUpdateBatchForm').submit((e) => handleRefIdUpdateBatchForm(e));
    $('#mediaShareSingleForm').submit((e) => handleMediaShareSingleForm(e));
    $('#mediaShareBatchForm').submit((e) => handleMediaShareBatchForm(e));

});

function handleVideoRenditions(e) {
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


}

function handleBatchRetranscode(e) {
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
}

function handleImageUploadForm(e) {
    $("span#status").removeClass();
    $("span#status").text("");
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");
    e.preventDefault();

    let fileSelect = $("#selectThumbnail");
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
}

function handleThumbnailUpdateForm(e) {
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
}


function handleRefIdUpdateSingleForm(e) {
    e.preventDefault();
    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    let completed = 0
    let fail = 0;
    let total = 1
    
    const accountId = $('#bcAccount').val();
    const oldId = $('#oldId').val().trim();
    const idType = $('input[name=idType]:checked').val();
    const newRefId = $('#newRefId').val().trim();

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
}

function handleRefIdUpdateBatchForm(e) {
    $("span#status").removeClass();
    $("span#status").text("");
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");
    e.preventDefault();

    const accountId = $('#bcAccountBatch').val();
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
}

function handleMediaShareSingleForm(e) {
    e.preventDefault();
    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    let completed = 0
    let fail = 0;
    let total = 1
    
    const accountIdSource = $('#bcAccountSource').val();
    const accountIdDest = $('#bcAccountDest').val();
    const refId = $('#refId').val().trim();
    const idType = $('input[name=idType]:checked').val();

    $.ajax({
      url: `/mediaShare`,
      type: "POST",
      data: {
        accountIdSource,
        accountIdDest,
        refId,
        idType
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>Moved ${refId} from ${accountIdSource} to ${accountIdSource} - Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      
      console.log(`Moving ${refId} from ${accountIdSource} to ${accountIdSource} - Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>Moving ${refId} from ${accountIdSource} to ${accountIdDest} - Failed: ${err.responseText}</li>`);

    })
}


function handleMediaShareBatchForm(e) {
    $("span#status").removeClass();
    $("span#status").text("");
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");
    e.preventDefault();

    const accountIdSource = $('#bcAccountSourceBatch').val();
    const accountIdDest = $('#bcAccountDestBatch').val();
    const idType = $('input[name=idTypeBatch]:checked').val();

    const fileSelect = document.getElementById('selectCSVBatch');
    console.log(fileSelect);

    const files = fileSelect.files;
    let form = new FormData();
    form.append('csv', files[0], files[0].name);
    
    $.ajax({
      url: '/mediaShareBatch',
      data: form,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        const dataArr = JSON.parse(data);

        $("span#status").removeClass();
        $("span#status").addClass('text-success');
        $("span#status").text("  Upload Completed!");

        var completed = 0
        var fail = 0;
        var total = dataArr.length;


        console.log(dataArr);
        dataArr.forEach(item => {
          let refId = item;
     
          $('#resultsCard').removeClass('hidden');
          $('ul#success').html(""); 
          $('ul#fail').html(""); 

          $.ajax({
            url: `/mediaShare`,
            type: "POST",
            data: {
              accountIdSource,
              accountIdDest,
              idType,
              refId: item
            }
          })
          .done(res => {
            completed++;
            $('.progress-bar').css("width", `${(completed/total)*100}%`);
            $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
            $('ul#success').append(`<li>Moved ${refId} from ${accountIdSource} to ${accountIdDest} - Sucessfully processsed.</li>`);
          })
          .fail(err => {
            completed++;
            fail++;
            
            console.log(`Moving ${refId} from ${accountIdSource} to ${accountIdDest} - Failed: ${err.responseText}`, err);
            $('.progress-bar').css("width", `${(completed/total)*100}%`);
            $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
            $('ul#fail').append(`<li>Moving ${refId} from ${accountIdSource} to ${accountIdDest} - Failed: ${err.responseText}</li>`);
          })
        });
      }
    });
}

