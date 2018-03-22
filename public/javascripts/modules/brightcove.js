import $ from 'jquery';
window.jQuery = $;
window.$ = $;

$(document).ready(function () {

    $('#videoRenditions').click((e) => handleVideoRenditions(e));
    $('#batchRetranscode').click((e) => handleBatchRetranscode(e));
    $("#imageUploadForm").submit((e) => handleImageUploadForm(e));
    $('#thumbnailUpdateForm').submit((e) => handleThumbnailUpdateForm(e));
    $('#refIdUpdateForm').submit((e) => handleRefIdUpdateForm(e));
    $('#mediaShareSingleForm').submit((e) => handleMediaShareSingleForm(e));
    $('#mediaShareBatchForm').submit((e) => handleMediaShareBatchForm(e));
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


function handleRefIdUpdateForm(e) {
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
      url: `/metadataUpdateTool`,    //refIdUpdateTool 
      type: "POST",
      data: {
        accountId,
        idType,
        ref: oldId,
        reference_id: newRefId
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








async function handleRefIdUpdateBatchForm(e) {
  $("span#status").removeClass();
  $("span#status").text("");
  e.preventDefault();

  let percentDone = 0;
  let completed = 0
  let fail = 0;
  let total = 0;

  const accountId = $('#bcAccountBatch').val();
  const idType = $('input[name=idTypeBatch]:checked').val();
  let file = document.getElementById('selectCSV').files[0];
  if (!file) return;

  let results = await papaPromisified(file);
  console.log("For real:", results);
  total = results.length;

  let data = results.data
  data.shift();

  data.forEach(video => {
    let [refId, title, tags, shortDescription] = [...video];
    let tagsArr = tags.split(",");
    console.log(refId, title, tags, shortDescription, accountId, idType);

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html(""); 
    $('ul#fail').html(""); 

    $.ajax({
      url: `/metadataUpdateTool`,
      type: "POST",
      data: {
        accountId,
        idType,
        ref: refId,
        reference_id: refId,
        name: title,
        tags: tagsArr,
        description: shortDescription
      }
    })
    .done(res => {
      console.log(res);
      completed++;
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#success').append(`<li>${refId} --> Sucessfully processsed.</li>`);
    })
    .fail(err => {
      completed++;
      fail++;
      
      console.log(`${refId} --> Failed: ${err.responseText}`, err);
      $('.progress-bar').css("width", `${(completed/total)*100}%`);
      $("#percentage").text(`Progress: ${Math.round((completed/total)*100)}%`);
      $('ul#fail').append(`<li>${refId} > Failed: ${err.responseText}</li>`);
    });
  })

  document.getElementById('refIdUpdateBatchForm').reset();
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


async function handleMetadataCSV(e) {
  e.preventDefault();

  let completed = 0
  let fail = 0;
  let total = 0;

  const accountId = $('#bcAccountBatch').val();
  const refType = $('input[name=idTypeBatch]:checked').val();

  let file = document.getElementById('selectCSV').files[0];
  if (!file) return;

  let results = await papaPromisified(file);
  let data = results.data
  data.shift();

  total = data.length;

  data.forEach(video => {
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