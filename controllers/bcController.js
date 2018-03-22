const axios = require("axios");
const { moment } = require("../helpers");
const bc = require("../config/bcConfig");
const multer = require("multer");
const fs = require('fs');

const imageMulterOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');

    if(isPhoto){
      next(null, true);
    }else {
      next({message: 'That filetype is not allowed'}, false);
    }
  }
}


// --------- Page Renderers
exports.videoRenditionsTool = (req, res) => {
  res.render("videoRenditionsTool", {
    pageTitle: "Video Renditions",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

exports.batchRetranscodeTool = (req, res) => {
  res.render("batchRetranscodeTool", {
    pageTitle: "Batch Retranscode",
    active: "bc",
    bcAccounts: bc.accounts,
    bcRenditions: bc.renditions
  });
};

exports.thumbnailUpdateTool = (req, res) => {
  res.render("thumbnailUpdateTool", {
    pageTitle: "Thumbnail Updater",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

exports.refIdUpdateTool = (req, res) => {
  res.render("refIdUpdateTool", {
    pageTitle: "RefID Updater",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

exports.metadataUpdateTool = (req, res) => {
  res.render("metadataUpdateTool", {
    pageTitle: "Metadata Updater",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

exports.mediaShare = (req, res) => {
  res.render("mediaShare", {
    pageTitle: "Media Sharing",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

exports.removeTextTrackTool = (req, res) => {
  res.render("removeTextTrack", {
    pageTitle: "Remove TextTrack",
    active: "bc",
    bcAccounts: bc.accounts
  });
};

// -----------

async function getVideoIdFromRefID(accountId, ref, refType){
  
  if(refType === 'id') 
    return ref
  else if (refType === 'refId') {
    const bcToken = await exports.getBcToken();
    const headers = {
      'Authorization': `Bearer ${bcToken.token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/ref:${ref}`;
    const options = {
      method: 'get',
      url,
      headers
    }


    console.log(accountId, ref, refType)
    return await axios(options);
  }
}

async function updateVideo(accountId, videoId, body) {
  const bcToken = await exports.getBcToken();
  let url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}`;
  const headers = {
    'Authorization': `Bearer ${bcToken.token}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const options = {
    method: 'patch',
    url,
    headers,
    data: body
  }

  console.log("Updating video:", accountId, videoId, body);
  return await axios(options);
}


// ----------- APIs
exports.csvUpload = multer({ inMemory: true}).single('csv');

exports.removeTextTrack = async (req, res) => {
  const accountId = req.body.accountId;
  const ref = req.body.ref;
  const refType = req.body.refType;
  const body = { "text_tracks": [] };
  let videoId =  ""; 
  let response = "";
  

  try {
    response = await getVideoIdFromRefID(accountId, ref, refType);
    videoId = response.data.id;
    console.log("Response VideoID:", videoId);
  } catch (error) {
    console.log(error.response.status);
    res.status(error.response.status).send('RefID not found!');
    return;
  }  

  try {
    console.log("Calling updateVideo");
    response = await updateVideo(accountId, videoId, body);
    console.log("Update Video Finished");
    res.sendStatus(200);
  } catch (error) {
    console.log("Err:", error);
    console.log(error.response.status);
    res.status(error.response.status).send('Video Not Updated');
    return;
  } 
}

exports.mediaShareSingle = async (req, res) => {
  const data = req.body;   // { accountId, oldId, idType, newRefId }
  let videoId = "";
  let response = {};
  let bcToken = await exports.getBcToken();

  const headers = {
    'Authorization': `Bearer ${bcToken.token}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  if (data.idType === 'refId') {
    let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountIdSource}/videos/ref:${data.refId}`;

  const options = {
      method: 'get',
      url,
      headers
    }

    try {
      response = await axios(options);
    } catch (error) {
      console.log(error.response.status);
      res.status(error.response.status).send('RefID not found!');
      return;
    }

    videoId = response.data.id;

  } else {
    videoId = data.refId;
  }

  let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountIdSource}/videos/${videoId}/shares`;

  const body = [
    {id : data.accountIdDest}
  ];

  const options = {
    method: 'post',
    url,
    headers,
    data: body
  }

  try {
    response = await axios(options);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.response.status, error.response.statusText);
    res.status(error.response.status).send({ error: error.response.statusText });
  }
}

exports.mediaShareBatch = async (req, res) => {
  let filename = req.file.originalname;
  let csvString = req.file.buffer.toString();
  let csvArr = csvString.split(/\r?\n/);
  csvArr.pop();
  csvArr.shift();

  console.log(csvArr);

  res.status(200).send(JSON.stringify(csvArr));
}


exports.metadataUpdate = async (req, res) => {
  const data = req.body;
  const accountId = req.body.accountId;
  const ref = req.body.ref;
  const refType = req.body.refType;
  let videoId =  ""; 
  let response = "";
  
  try {
    response = await getVideoIdFromRefID(accountId, ref, refType);
    videoId = response.data.id;
  } catch (error) {
    console.log(error.response.status);
    res.status(error.response.status).send('RefID not found!');
    return;
  }

  const body = {}; 

  if(data.reference_id && data.reference_id !== ""){
    body.reference_id = data.reference_id;
  }
  if(data.name && data.name !== ""){
    body.name = data.name;
  }
  if(data.tags && data.tags !== ""){
    body.tags = data.tags;
  }
  if(data.description && data.description !== ""){
    body.description = data.description;
  }

  try {
    response = await updateVideo(accountId, videoId, body);
    res.sendStatus(200);
  } catch (error) {
    res.status(error.response.status).send('Video Not Updated');
    return;
  } 
}


exports.refIdUpdate = async (req, res) => {
  const data = req.body;   // { accountId, oldId, idType, newRefId }
  let videoId = "";
  let response = {};
  let bcToken = await exports.getBcToken();

  const headers = {
    'Authorization': `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json'
  };

  if (data.idType === 'refId') {
    let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountId}/videos/ref:${data.oldId}`
    const options = {
      method: 'get',
      url,
      headers
    }

    try {
      response = await axios(options);
    } catch (error) {
      console.log(error.response.status);
      res.status(error.response.status).send('RefID not found!');
      return;
    }

    videoId = response.data.id;

  } else {
    videoId = data.oldId;
  }

  let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountId}/videos/${videoId}`;
  const body = {
    reference_id : data.newRefId
  }

  const options = {
    method: 'patch',
    url,
    headers,
    data: body
  }

  try {
    response = await axios(options);
    console.log(response);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.response.status, error.response.statusText);
    res.status(error.response.status).send({ error: error.response.statusText });
  }
}


exports.refIdUpdateBatch = async (req, res) => {
  let filename = req.file.originalname;
  let csvString = req.file.buffer.toString();
  let csvArr = csvString.split(/\r?\n/);
  csvArr.pop();
  csvArr.shift();

  res.status(200).send(JSON.stringify(csvArr));
}



exports.thumbnailUpload = multer(imageMulterOptions).single('thumbnail');

exports.thumbnailSave = (req, res, next) => {
  let filename = req.file.originalname;
  let buffer = req.file.buffer; 

  fs.writeFile('./public/uploads/' + filename, buffer, 'binary', function(err) {
    if (err) throw err
    res.end('File is uploaded')
  });

  res.sendStatus(200);
}

exports.bcThumbnailUpdate = async (req, res) => {
  const data = req.body;
  let response = {};
  let videoId = "";
  let bcToken = await exports.getBcToken();
  const headers = {
    'Authorization': `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json'
  };

  if (data.idType === 'refId') {
    let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountId}/videos/ref:${data.videoId}`
    const options = {
      method: 'get',
      url,
      headers
    }

    try {
      response = await axios(options);
    } catch (error) {
      console.log(error.response.status);
      res.status(error.response.status).send('RefId not found!');
      return;
    }

    videoId = response.data.id;

  } else {
    videoId = data.videoId;
  }

  // Dev Hardcode
  // let tumbnailUrl = 'https://common.liveonlinetechnology.com/uploads/Rick.jpg';
  let tumbnailUrl = `https://common.liveonlinetechnology.com/uploads/${data.thumbnailFileName}`;

  let url = `https://ingest.api.brightcove.com/v1/accounts/${data.accountId}/videos/${videoId}/ingest-requests`;
  const body = {
    poster: {
        url: tumbnailUrl,
        width: 1280,
        height: 720
    },
    thumbnail: {
        url: tumbnailUrl,
        width: 160,
        height: 90
    }
  }

  const options = {
    method: 'post',
    url,
    headers,
    data: body
  }

  try {
    response = await axios(options);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.response.status, error.response.statusText);
    res.status(error.response.status).send({ error: error.response.statusText });
  }
  
}

exports.retranscode = async (req, res) => {
  const data = req.body;
  let response = {};
  let videoId = "";
  let bcToken = await exports.getBcToken();
  const headers = {
    'Authorization': `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json'
  };


  if (data.idType === 'refId') {
    let url = `https://cms.api.brightcove.com/v1/accounts/${data.accountId}/videos/ref:${data.videoId}`
    const options = {
      method: 'get',
      url,
      headers
    }

    try {
      response = await axios(options);
    } catch (error) {
      console.log(error.response.status);
      res.status(error.response.status).send('RefId not found!');
      return;
    }

    videoId = response.data.id;

  } else {
    videoId = data.videoId;
  }


  let url = `https://ingest.api.brightcove.com/v1/accounts/${data.accountId}/videos/${videoId}/ingest-requests`
  const body = {
    master: { "use_archived_master": true },
    profile: `${data.renditionProfile}`
  }
  const options = {
    method: 'post',
    url,
    headers,
    data: body
  }

  try {
    response = await axios(options);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.response.status, error.response.statusText);
    res.status(error.response.status).send({ error: error.response.statusText });
  }
};


exports.getRenditions = async (req, res) => {
  console.log("getRenditions!!!");
  let offset = 0;
  const limit = 100;

  const bcToken = await exports.getBcToken();
  const accountId = req.params.accountId;
  const updatedAt = req.params.update;
  var response = "";
  var renditions = "";
  let videos = [];


  //Get Counts for Video Renditions search
  let url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/counts/videos?q=updated_at:${updatedAt}&to=1d&limit=${limit}`
  const options = {
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${bcToken.token}`,
      'Content-Type': 'application/json'
    }
  }

  try {
    response = await axios(options);
  } catch (error) {
    console.log(error);
  }

  const videoCount = response.data.count;

  // Search Vidoes
  while (offset < videoCount) {
    if (bcToken.token <= Date.now()) {
      bcToken = await exports.getBcToken();
    }

    url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos?q=updated_at:${updatedAt}&to=1d&limit=${limit}&offset=${offset}`
    const options = {
      method: 'get',
      url,
      headers: {
        'Authorization': `Bearer ${bcToken.token}`,
        'Content-Type': 'application/json'
      }
    }

    try {
      response = await axios(options);
    } catch (error) {
      console.log(error);
    }

    await Promise.all(
      response.data.map(async responseVid => {
        let video = {};
        video.videoId = responseVid.id;
        video.accountId = responseVid.account_id;
        video.refId = responseVid.reference_id;
        video.videoName = responseVid.name;
        video.description = responseVid.description;
        video.state = responseVid.state;
        video.createdAt = responseVid.created_at;
        video.updatedAt = responseVid.updated_at;
        video.publishedAt = responseVid.published_at;
        video.duration = responseVid.duration;
        video.folderId = responseVid.folder_id;
        video.digitalMasterId = responseVid.digital_master_id;
        video.tags = responseVid.tags.join(', ');
        if (responseVid.text_tracks[0]) {
          video.textTrackId = responseVid.text_tracks[0].id;
          video.textTrackSrc = responseVid.text_tracks[0].src;
          video.textTrackLang = responseVid.text_tracks[0].srclang;
          video.textTrackLabel = responseVid.text_tracks[0].label;
          video.textTrackKind = responseVid.text_tracks[0].kind;
        }
        else {
          video.textTrackId = "";
          video.textTrackSrc = "";
          video.textTrackLang = "";
          video.textTrackLabel = "";
          video.textTrackKind = "";
        }

        // Get Video Renditions
        if (bcToken.token <= Date.now()) {
          bcToken = await exports.getBcToken();
        }

        url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${video.videoId}/assets/renditions`
        const options = {
          method: 'get',
          url,
          headers: {
            'Authorization': `Bearer ${bcToken.token}`,
            'Content-Type': 'application/json'
          }
        }

        try {
          renditions = await axios(options);
        } catch (error) {
          console.log(error);
        }

        let renditionCount = 0;
        video.renditions = "";
        renditions.data.forEach(rendition => {
          video.renditions += `${rendition.video_codec}-${rendition.video_container} ${rendition.frame_width}x${rendition.frame_height} ${rendition.encoding_rate} \n`
          renditionCount++;
        });

        video.renditionCount = renditionCount;

        videos.push(video);
      }));
    offset += limit;
  }

  res.json({ data: videos });
}

exports.getBcToken = async () => {

  const url = `${process.env.BCSERVICEURL}?grant_type=client_credentials`;
  const auth64 = new Buffer(`${process.env.BCCLIENTID}:${process.env.BCCLIENTSECRET}`).toString('base64');

  const options = {
    method: 'post',
    url,
    data: {
      'grant_type': 'client_credentials'
    },
    headers: {
      'Authorization': `Basic ${auth64}`,
      'Content-Type': 'application/json'
    }
  }

  const response = await axios(options);

  return {
    token: response.data.access_token,
    expires: Date.now() + response.data.expires_in
  }

}

