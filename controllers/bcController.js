const axios = require("axios");
const { moment } = require("../helpers");
const bc = require("../config/bcConfig");

exports.videoRenditions = (req, res) => {
  console.log("bcRenditionsList");

  res.render("bcRenditionsList", {
    pageTitle: "Video Renditions",
    active: "bc",
    bcAccounts: bc.brightcoveAccounts
  });
};

exports.batchRetranscode = (req, res) => {
  console.log("bcBatchRetranscode");
  res.render("bcBatchRetranscode", {
    pageTitle: "Video Renditions",
    active: "bc"
  });
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
  console.log(videoCount);

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

        console.log(video.videoName);
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
          //$videoRenditions .= "$videoRenditionCodec-$videoRenditionContainer  $videoRenditionFrame  $videoRenditionRate \n";
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
  const url = `${bc.bcCredentials.serviceUrl}?grant_type=client_credentials`;
  const auth64 = new Buffer(`${bc.bcCredentials.clientId}:${bc.bcCredentials.client_secret}`).toString('base64');

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