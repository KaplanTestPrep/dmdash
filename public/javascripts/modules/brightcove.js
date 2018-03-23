import $ from 'jquery';
window.jQuery = $;
window.$ = $;

$(document).ready(function () {

    $('#videoRenditions').click((e) => handleVideoRenditions(e));
    $('#batchRetranscodeForm').submit((e) => handleBatchRetranscode(e));
    $("#thumbnailUploadForm").submit((e) => handleThumbnailUploadForm(e));
    $('#thumbnailUpdateForm').submit((e) => handleThumbnailUpdateForm(e));
    $('#refIdUpdateForm').submit((e) => handleRefIdUpdateForm(e));
    $('#mediaShareForm').submit((e) => handleMediaShareForm(e));
    $('#metadataUpdateForm').submit((e) => handleMetadataCSV(e));
    $('#removeTextTrackForm').submit((e) => handleRemoveTextTrack(e));


});

function handleRemoveTextTrack(e) {
  e.preventDefault();
  $('#resultsCard').removeClass('hidden');

  const accountId = $('#bcAccount').val();
  const refType =$('input[name=refType]:checked').val();
  const videosArr = $('#vidoesToUpdate').val().trim().split(/[\s,]+/);

  let completed = 0
  let fail = 0;
  let total = videosArr.length;

  console.log(accountId, refType, videosArr);

  videosArr.forEach( ref => {
    $.ajax({
      url: `/removeTextTrack`,    //refIdUpdateTool 
      type: "POST",
      data: {
        accountId,
        refType,
        ref,
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>${ref} Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      console.log(`${ref} Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>${ref} Failed: ${err.responseText}</li>`);
    })
  })
}

function handleVideoRenditions(e) {
    e.preventDefault();
    $('#resultsCard').removeClass('hidden');

    const accountId = $('#acccount').val();
    const update = $('#datepicker').val();
    let renditionsTable = $("#renditionsTable");


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
    const videos = $('#vidoesToUpdate').val().trim().split(/[\r\n\s,]+/);
    const refType = $('input[name=refType]:checked').val();
    const renditionProfile = $('#bcRenditionProfile').val();
    
    let percentDone = 0;
    let completed = 0
    let fail = 0;
    let total = videos.length; 

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    videos.forEach(ref => {
      $.ajax({
        url: `/retranscodeVideo`,
        type: "POST",
        data: {
          accountId,
          ref,
          refType,
          renditionProfile
        }
      })
      .done(res => {
          console.log(res);
          completed++;
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#success').append(`<li>${ref} Sucessfully processsed.</li>`);
      })
      .fail(err => {
          completed++;
          fail++;
          
          console.log(`${ref} Failed: ${err.responseText}`, err);
          $('.progress-bar').css("width", `${(completed/total)*100}%`);
          $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
          $('ul#fail').append(`<li>${ref} Failed: ${err.responseText}</li>`);
        })
    });
}

function handleThumbnailUploadForm(e) {
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
    const refType = $('input[name=refType]:checked').val();
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
          ref: video,
          refType,
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


async function handleRefIdUpdateForm(e) {
    e.preventDefault();
    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    let completed = 0
    let fail = 0;
    let total = 1
    
    const accountId = $('#bcAccount').val();
    const refType = $('input[name=refType]:checked').val();
    const file = document.getElementById('selectCSV').files[0];
    if (!file) return;

    let results = await papaPromisified(file);
    let videos = results.data
    videos.shift();

    console.log(videos);

    total = videos.length;

    videos.forEach(video => {
      let [ref, newRefId] = [...video];
      
      $('#resultsCard').removeClass('hidden');
      $('ul#success').html(""); 
      $('ul#fail').html(""); 
  
      $.ajax({
        url: `/refIdUpdate`,
        type: "POST",
        data: {
          accountId,
          ref,
          refType,
          reference_id: newRefId
        }
      })
      .done(res => {
        console.log(res);
        completed++;
        $('.progress-bar').css("width", `${(completed/total)*100}%`);
        $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
        $('ul#success').append(`<li>${ref} --> Sucessfully processsed.</li>`);
      })
      .fail(err => {
        completed++;
        fail++;
        
        console.log(`${ref} --> Failed: ${err.responseText}`, err);
        $('.progress-bar').css("width", `${(completed/total)*100}%`);
        $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
        $('ul#fail').append(`<li>${ref} > Failed: ${err.responseText}</li>`);
      });
    })
  
    document.getElementById('refIdUpdateForm').reset();
}

function handleMediaShareForm(e) {
  e.preventDefault();
  $('#resultsCard').removeClass('hidden');
  $('ul#success').html(""); 
  $('ul#fail').html(""); 

  let completed = 0
  let fail = 0;
  let total = 1
  
  const accountIdSource = $('#bcAccountSource').val();
  const accountIdDest = $('#bcAccountDest').val();
  const videos = $('#vidoesToUpdate').val().trim().split(/[\r\n\s,]+/);
  const refType = $('input[name=refType]:checked').val();
  let ref = "";

  videos.forEach(video => {
    ref = video;
    $.ajax({
      url: `/mediaShare`,
      type: "POST",
      data: {
        accountIdSource,
        accountIdDest,
        ref,
        refType
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>Moved ${ref} from ${accountIdSource} to ${accountIdSource} - Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      
      console.log(`Moving ${ref} from ${accountIdSource} to ${accountIdSource} - Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>Moving ${ref} from ${accountIdSource} to ${accountIdDest} - Failed: ${err.responseText}</li>`);
  
    });
  });
}

async function handleMetadataCSV(e) {
  e.preventDefault();

  let completed = 0
  let fail = 0;
  let total = 0;

  const accountId = $('#bcAccount').val();
  const refType = $('input[name=refType]:checked').val();
  const file = document.getElementById('selectCSV').files[0];
  if (!file) return;

  let results = await papaPromisified(file);
  let videos = results.data
  videos.shift();

  total = videos.length;

  videos.forEach(video => {
    let [ref, name, tags, description] = [...video];
    let tagsArr = tags.split(",");
    console.log(ref, name, tags, description, accountId, refType);

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    $.ajax({
      url: `/metadataUpdate`,
      type: "POST",
      data: {
        accountId,
        refType,
        ref,
        name,
        tags: tagsArr,
        description,
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>${ref} --> Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      
      console.log(`${ref} --> Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>${ref} > Failed: ${err.responseText}</li>`);
    });
  })

  document.getElementById('metadataUpdateForm').reset();
}

function papaPromisified (file){
  return new Promise(function(resolve, reject) {
    let config = {
      delimiter: ",",
      download: false,
      skipEmptyLines: true,
      error: reject,
      complete: resolve
    }

    Papa.parse(file, config);
  })
}