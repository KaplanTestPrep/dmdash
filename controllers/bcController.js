const axios = require('axios')
const { moment } = require('../helpers')
const bc = require('../config/bcConfig')
const multer = require('multer')
const fs = require('fs')

const imageMulterOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')

    if (isPhoto) {
      next(null, true)
    } else {
      next({ message: 'That filetype is not allowed' }, false)
    }
  },
}

// --------- Page Renderers
exports.videoRenditionsTool = (req, res) => {
  res.render('videoRenditionsTool', {
    pageTitle: 'Video Renditions',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.batchRetranscodeTool = (req, res) => {
  res.render('batchRetranscodeTool', {
    pageTitle: 'Batch Retranscode',
    active: 'bc',
    bcAccounts: bc.accounts,
    bcRenditions: bc.renditions,
  })
}

exports.thumbnailUpdateTool = (req, res) => {
  res.render('thumbnailUpdateTool', {
    pageTitle: 'Thumbnail Updater',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.refIdUpdateTool = (req, res) => {
  res.render('refIdUpdateTool', {
    pageTitle: 'RefID Updater',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.metadataUpdateTool = (req, res) => {
  res.render('metadataUpdateTool', {
    pageTitle: 'Metadata Updater',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.mediaShareTool = (req, res) => {
  res.render('mediaShareTool', {
    pageTitle: 'Media Sharing',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.removeTextTrackTool = (req, res) => {
  res.render('removeTextTrack', {
    pageTitle: 'Remove TextTrack',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.createPlaylistTool = (req, res) => {
  res.render('createPlaylistTool', {
    pageTitle: 'Create Playlist',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

exports.refIdToIdTool = (req, res) => {
  res.render('refIdToIdTool', {
    pageTitle: 'RefId to Video Id',
    active: 'bc',
    bcAccounts: bc.accounts,
  })
}

// -----------

async function updateVideo(accountId, videoId, body) {
  const bcToken = await exports.getBcToken()
  const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}`
  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json',
  }
  const options = {
    method: 'patch',
    url,
    headers,
    data: body,
  }

  return axios(options)
}

// ----------- APIs

exports.refIdToId = async (req, res) => {
  const accountIdSource = req.body.accountIdSource
  console.log('Account', accountIdSource)
  const ref = req.body.ref
  let videoId = null

  try {
    let response = await exports.getVideoIdFromRefID(
      accountIdSource,
      ref,
      'refId'
    )
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
    return res.status(200).send(videoId)
  } catch (error) {
    console.log(error.response.status)
    return res.status(error.response.status).send('RefID not found!')
  }
}

exports.getRenditions = async (req, res) => {
  let offset = 0
  const limit = 100

  const bcToken = await exports.getBcToken()
  const accountId = req.params.accountId
  const dateFrom = req.params.dateFrom
  const dateTo = req.params.dateTo
  var response = ''
  var renditions = ''
  let videos = []

  //Get Counts for Video Renditions search
  let url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/counts/videos?q=updated_at:${dateFrom}..${dateTo}&limit=${limit}`
  console.log('URL: ', url)
  const options = {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${bcToken.token}`,
      'Content-Type': 'application/json',
    },
  }

  try {
    response = await axios(options)
  } catch (error) {
    console.log(error)
  }

  const videoCount = response.data.count

  // Search Vidoes
  while (offset < videoCount) {
    if (bcToken.token <= Date.now()) {
      bcToken = await exports.getBcToken()
    }

    url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos?q=updated_at:${dateFrom}..${dateTo}&limit=${limit}&offset=${offset}`
    const options = {
      method: 'get',
      url,
      headers: {
        Authorization: `Bearer ${bcToken.token}`,
        'Content-Type': 'application/json',
      },
    }

    try {
      response = await axios(options)
    } catch (error) {
      console.log(error)
    }

    await Promise.all(
      response.data.map(async (responseVid) => {
        let video = {}
        video.videoId = responseVid.id
        video.accountId = responseVid.account_id
        video.refId = responseVid.reference_id
        video.videoName = responseVid.name
        video.description = responseVid.description
        video.state = responseVid.state
        video.createdAt = responseVid.created_at
        video.updatedAt = responseVid.updated_at
        video.publishedAt = responseVid.published_at
        video.duration = responseVid.duration
        video.folderId = responseVid.folder_id
        video.digitalMasterId = responseVid.digital_master_id
        video.tags = responseVid.tags.join(', ')
        if (responseVid.text_tracks[0]) {
          video.textTrackId = responseVid.text_tracks[0].id
          video.textTrackSrc = responseVid.text_tracks[0].src
          video.textTrackLang = responseVid.text_tracks[0].srclang
          video.textTrackLabel = responseVid.text_tracks[0].label
          video.textTrackKind = responseVid.text_tracks[0].kind
        } else {
          video.textTrackId = ''
          video.textTrackSrc = ''
          video.textTrackLang = ''
          video.textTrackLabel = ''
          video.textTrackKind = ''
        }

        // Get Video Renditions
        // if (bcToken.token <= Date.now()) {
        //   bcToken = await exports.getBcToken();
        // }

        // url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${
        //   video.videoId
        // }/assets/renditions`;
        // const options = {
        //   method: "get",
        //   url,
        //   headers: {
        //     Authorization: `Bearer ${bcToken.token}`,
        //     "Content-Type": "application/json"
        //   }
        // };

        // try {
        //   renditions = await axios(options);
        // } catch (error) {
        //   console.log(error);
        // }

        let renditionCount = 0
        video.renditions = ''
        // renditions.data.forEach(rendition => {
        //   video.renditions += `${rendition.video_codec}-${
        //     rendition.video_container
        //   } ${rendition.frame_width}x${rendition.frame_height} ${
        //     rendition.encoding_rate
        //   } \n`;
        //   renditionCount++;
        // });

        video.renditionCount = renditionCount

        videos.push(video)
      })
    )
    offset += limit
  }

  res.json({ data: videos })
}

exports.csvUpload = multer({ inMemory: true }).single('csv')

exports.createPlaylist = async (req, res) => {
  const accountId = req.body.accountId
  const refType = req.body.refType
  const playlist = req.body.playlist

  let response = {}
  let videoId = ''
  let bcToken = await exports.getBcToken()
  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json',
  }

  let video_ids = []
  let videoIdPromises = []

  videoIdPromises = playlist.video_ids.map((ref) => {
    return exports.getVideoIdFromRefID(accountId, ref, refType)
  })

  try {
    video_ids = (await Promise.all(videoIdPromises)).map((response) => {
      if (typeof response !== 'object') return response
      else return response.data.id
    })
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  playlist.video_ids = video_ids

  let url = `https://ingest.api.brightcove.com/v1/accounts/${accountId}/playlists`
  const options = {
    method: 'post',
    url,
    headers,
    data: playlist,
  }

  try {
    response = await axios(options)
    return res.sendStatus(200)
  } catch (error) {
    console.log(error.response.status, error.response.statusText)
    return res
      .status(error.response.status)
      .send({ error: error.response.statusText })
  }
}

exports.removeTextTrack = async (req, res) => {
  const accountId = req.body.accountId
  const ref = req.body.ref
  const refType = req.body.refType
  const body = { text_tracks: [] }
  let videoId = ''
  let response = ''

  try {
    response = await exports.getVideoIdFromRefID(accountId, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  try {
    response = await updateVideo(accountId, videoId, body)
    return res.sendStatus(200)
  } catch (error) {
    return res.status(error.response.status).send('Error Updating Video!')
  }
}

exports.mediaShare = async (req, res) => {
  const accountIdSource = req.body.accountIdSource
  const accountIdDest = req.body.accountIdDest
  const ref = req.body.ref
  const refType = req.body.refType
  let videoId = ''
  let response = {}

  try {
    response = await exports.getVideoIdFromRefID(accountIdSource, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  const url = `https://cms.api.brightcove.com/v1/accounts/${accountIdSource}/videos/${videoId}/shares`
  const bcToken = await exports.getBcToken()
  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const body = [{ id: accountIdDest }]
  const options = {
    method: 'post',
    url,
    headers,
    data: body,
  }

  try {
    response = await axios(options)
    res.sendStatus(200)
  } catch (error) {
    console.log(error.response.status, error.response.statusText)
    res.status(error.response.status).send({ error: error.response.statusText })
  }
}

exports.metadataUpdate = async (req, res) => {
  const data = req.body
  const accountId = req.body.accountId
  const ref = req.body.ref
  const refType = req.body.refType
  let videoId = ''
  let response = ''

  try {
    response = await exports.getVideoIdFromRefID(accountId, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  const body = {}

  if (data.reference_id && data.reference_id !== '') {
    body.reference_id = data.reference_id
  }
  if (data.name && data.name !== '') {
    body.name = data.name
  }
  // console.log(data.tags);
  if (data.tags && data.tags.length > 0) {
    body.tags = data.tags
  }
  if (data.description && data.description !== '') {
    body.description = data.description
  }
  if (data.reference_id && data.reference_id !== '') {
    body.reference_id = data.reference_id
  }

  try {
    response = await updateVideo(accountId, videoId, body)
    return res.sendStatus(200)
  } catch (error) {
    return res.status(error.response.status).send('Error updating Video!')
  }
}

exports.refIdUpdate = async (req, res) => {
  const data = req.body // accountId,  ref,  refType, reference_id
  const accountId = req.body.accountId
  const ref = req.body.ref
  const refType = req.body.refType
  const reference_id = req.body.reference_id
  let videoId = ''
  let response = ''

  try {
    response = await exports.getVideoIdFromRefID(accountId, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    console.log(error.response.status)
    res.status(error.response.status).send('RefID not found!')
    return
  }

  const body = {
    reference_id: reference_id,
  }

  try {
    response = await updateVideo(accountId, videoId, body)
    return res.sendStatus(200)
  } catch (error) {
    return res.status(error.response.status).send('Video Not Updated')
  }
}

exports.thumbnailUpload = multer(imageMulterOptions).single('thumbnail')

exports.thumbnailSave = (req, res, next) => {
  let filename = req.file.originalname
  let buffer = req.file.buffer

  fs.writeFile('./public/uploads/' + filename, buffer, 'binary', function (
    err
  ) {
    if (err) throw err
    res.end('File is uploaded')
  })

  res.sendStatus(200)
}

exports.bcThumbnailUpdate = async (req, res) => {
  const accountId = req.body.accountId
  const ref = req.body.ref
  const refType = req.body.refType
  const thumbnailFileName = req.body.thumbnailFileName
  let response = {}
  let videoId = ''
  let bcToken = await exports.getBcToken()
  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json',
  }

  try {
    response = await getVideoIdFromRefID(accountId, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  const tumbnailUrl = `https://common.liveonlinetechnology.com/uploads/${thumbnailFileName}`

  const url = `https://ingest.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}/ingest-requests`
  const body = {
    poster: {
      url: tumbnailUrl,
      width: 1280,
      height: 720,
    },
    thumbnail: {
      url: tumbnailUrl,
      width: 160,
      height: 90,
    },
  }

  const options = {
    method: 'post',
    url,
    headers,
    data: body,
  }

  try {
    response = await axios(options)
    return res.sendStatus(200)
  } catch (error) {
    console.log(error.response.status, error.response.statusText)
    return res
      .status(error.response.status)
      .send({ error: error.response.statusText })
  }
}

exports.retranscodeVideo = async (req, res) => {
  const data = req.body
  const accountId = req.body.accountId
  const ref = req.body.ref
  const refType = req.body.refType
  let response = {}
  let videoId = ''

  try {
    response = await exports.getVideoIdFromRefID(accountId, ref, refType)
    if (typeof response !== 'object') videoId = response
    else videoId = response.data.id
  } catch (error) {
    return res.status(error.response.status).send('RefID not found!')
  }

  let bcToken = await exports.getBcToken()
  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/json',
  }
  let url = `https://ingest.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}/ingest-requests`
  const body = {
    master: { use_archived_master: true },
    profile: `${data.renditionProfile}`,
  }
  const options = {
    method: 'post',
    url,
    headers,
    data: body,
  }

  try {
    response = await axios(options)
    return res.sendStatus(200)
  } catch (error) {
    console.log(error.response.status, error.response.statusText)
    return res
      .status(error.response.status)
      .send({ error: error.response.statusText })
  }
}

// Utils

exports.getBcVideo = async (accountId, videoId, token) => {
  const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/${videoId}`
  const bcToken = token || (await exports.getBcToken())

  const headers = {
    Authorization: `Bearer ${bcToken.token}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  const options = {
    method: 'get',
    url,
    headers,
  }

  try {
    response = await axios(options)
    return response.data
  } catch (error) {
    console.log(error.response.status, error.response.statusText)
    if (error.response.status === 404)
      return {
        status: 404,
        statusText: 'Video Not Found',
      }
    return error
  }
}

exports.getVideoIdFromRefID = async (accountId, ref, refType) => {
  if (refType === 'id') return Promise.resolve(ref)
  else if (refType === 'refId') {
    const bcToken = await exports.getBcToken()
    const headers = {
      Authorization: `Bearer ${bcToken.token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const url = `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos/ref:${ref}`
    const options = {
      method: 'get',
      url,
      headers,
    }

    return axios(options)
  }
}

exports.getBcToken = async () => {
  const url = `${process.env.BCSERVICEURL}?grant_type=client_credentials`
  const auth64 = new Buffer(
    `${process.env.BCCLIENTID}:${process.env.BCCLIENTSECRET}`
  ).toString('base64')

  const options = {
    method: 'post',
    url,
    data: {
      grant_type: 'client_credentials',
    },
    headers: {
      Authorization: `Basic ${auth64}`,
      'Content-Type': 'application/json',
    },
  }

  const response = await axios(options)

  return {
    token: response.data.access_token,
    expires: Date.now() + response.data.expires_in,
  }
}
