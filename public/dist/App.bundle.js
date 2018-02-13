/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


$(document).ready(function () {
  // Datatable init
  var table = $("#datatables").DataTable({
    // dom: 'lfrtBip',
    // buttons: [
    //   {
    //     extend: 'csvHtml5',
    //     text: 'Download CSV',
    //     className: 'btn btn-default'
    //    }
    // ],
    ajax: "/getRecordings",
    columns: [{ data: "id" }, { data: "meeting_id" }, { data: "user" }, { data: "topic" }, { data: "recording_start" }, { data: "recording_end" }, { data: "file_size" }, { data: "file_type" }],
    columnDefs: [{
      targets: [0, 1],
      visible: false,
      searchable: true
    }],
    pageLength: 25
  });

  $("#datatables").on("click", "tr", function () {
    $(this).toggleClass("selected");
  });

  $("#delete").click(function () {
    var recordings = table.rows(".selected").data();
    var msg = "Are you sure you want to delete " + recordings.length + " recordings?";

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
    }).then(function (result) {
      if (result.value) {
        var toBeDeleted = [];
        for (var i = 0; i < recordings.length; i++) {
          var rec = {
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
        }).then(function (result) {
          table.rows(".selected").remove().draw(false);
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

  $("#addCoHosts").click(function (e) {
    e.preventDefault();
    var emails = $("textarea").val().trim().split(/[\r\n,]+/);

    var percentDone = 0;
    var completed = 0;
    var fail = 0;
    var total = emails.length;

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html("");
    $('ul#fail').html("");

    emails.forEach(function (email) {
      $.ajax({
        url: "/setAlternateHosts/" + email,
        type: "POST"
      }).done(function (res) {
        console.log(res);
        completed++;
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#success').append("<li>" + email + " Sucessfully processsed.</li>");
      }).fail(function (err) {
        completed++;
        fail++;

        console.log(email + " Failed: " + err.responseText, err);
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#fail').append("<li>" + email + " Failed: " + err.responseText + "</li>");
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

  $('#videoRenditions').click(function (e) {
    e.preventDefault();
    var accountId = $('#acccount').val();
    var update = $('#datepicker').val();
    var renditionsTable = $("#renditionsTable");

    $('#resultsCard').removeClass('hidden');

    if (!$.fn.DataTable.isDataTable('#renditionsTable')) {
      renditionsTable.DataTable({
        dom: 'lfrtBip',
        buttons: [{
          extend: 'csvHtml5',
          text: 'Download CSV',
          className: 'btn btn-default'
        }],
        ajax: "/bc/getRenditions/" + accountId + "/" + update,
        columns: [{ data: "videoId" }, { data: "accountId" }, { data: "refId" }, { data: "videoName" }, { data: "description" }, { data: "state" }, { data: "createdAt" }, { data: "updatedAt" }, { data: "publishedAt" }, { data: "duration" }, { data: "folderId" }, { data: "digitalMasterId" }, { data: "tags" }, { data: "textTrackId" }, { data: "textTrackSrc" }, { data: "textTrackLang" }, { data: "textTrackLabel" }, { data: "textTrackKind" }, { data: "renditions" }, { data: "renditionCount" }],
        columnDefs: [{
          targets: [0, 1, 5, 6, 8, 10, 11, 13, 14, 15, 17, 18],
          visible: false,
          searchable: true
        }],
        pageLength: 25,
        processing: true
      });
    } else {
      renditionsTable = new $.fn.dataTable.Api("#renditionsTable");
      renditionsTable.ajax.url("/bc/getRenditions/" + accountId + "/" + update).load();
    }
  });

  $('#batchRetranscode').click(function (e) {
    e.preventDefault();
    var accountId = $('#bcAcccount').val();
    var videos = $('#vidoesToTranscode').val().trim().split(/[\r\n\s,]+/);
    var idType = $('input[name=idType]:checked').val();
    var renditionProfile = $('#bcRenditionProfile').val();
    var percentDone = 0;
    var completed = 0;
    var fail = 0;
    var total = videos.length;

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html("");
    $('ul#fail').html("");

    videos.forEach(function (video) {
      $.ajax({
        url: "/bcRetranscode",
        type: "POST",
        data: {
          accountId: accountId,
          videoId: video,
          idType: idType,
          renditionProfile: renditionProfile
        }
      }).done(function (res) {
        console.log(res);
        completed++;
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#success').append("<li>" + video + " Sucessfully processsed.</li>");
      }).fail(function (err) {
        completed++;
        fail++;

        console.log(video + " Failed: " + err.responseText, err);
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#fail').append("<li>" + video + " Failed: " + err.responseText + "</li>");
      });
    });
  });

  $("#imageUploadForm").submit(function (e) {
    e.preventDefault();

    $("span#status").removeClass();
    $("span#status").addClass('text-warning');
    $("span#status").text("  Uploading...");

    var filename = $("#selectThumbnail").val().split('\\').pop();
    $("#uploadedImage").val(filename);

    var fileSelect = document.getElementById('selectThumbnail');
    var files = fileSelect.files;
    var form = new FormData();

    form.append('thumbnail', files[0], files[0].name);

    $.ajax({
      url: '/bcThumbnailUpload',
      data: form,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function success(data) {
        $("span#status").removeClass();
        $("span#status").addClass('text-success');
        $("span#status").text("  Upload Completed!");
      }
    });
  });

  $('#thumbnailUpdateForm').submit(function (e) {
    e.preventDefault();
    var accountId = $('#bcAcccount').val();
    var videos = $('#vidoesToUpdate').val().trim().split(/[\r\n\s,]+/);
    var idType = $('input[name=idType]:checked').val();
    var thumbnailFileName = $('#uploadedImage').val();
    var completed = 0;
    var fail = 0;
    var total = videos.length;

    $('#resultsCard').removeClass('hidden');
    $('ul#success').html("");
    $('ul#fail').html("");

    videos.forEach(function (video) {
      $.ajax({
        url: "/bcThumbnailUpdate",
        type: "POST",
        data: {
          accountId: accountId,
          videoId: video,
          idType: idType,
          thumbnailFileName: thumbnailFileName
        }
      }).done(function (res) {
        console.log(res);
        completed++;
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#success').append("<li>" + video + " Sucessfully processsed.</li>");
      }).fail(function (err) {
        completed++;
        fail++;

        console.log(video + " Failed: " + err.responseText, err);
        $('.progress-bar').css("width", completed / total * 100 + "%");
        $("#percentage").text("Progress: " + Math.round(completed / total * 100) + "%");
        $('ul#fail').append("<li>" + video + " Failed: " + err.responseText + "</li>");
      });
    });
  });
}); // doc.ready

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map