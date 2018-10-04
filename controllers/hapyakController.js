const Hapyak = require("../models/Hapyak");
const axios = require("axios");
const { getBcToken, getBcVideo } = require("./bcController");

// CONFIGS - to be moved into config file
let HAPYAKSERVICEURL = `https://api.hapyak.com/api/`;

// --------- Page Renderers
exports.getProjectTool = (req, res) => {
  res.render("getProject", {
    pageTitle: "Project List",
    active: "hap"
  });
};

exports.importAnnotations = (req, res) => {
  res.render("importAnnotations", {
    pageTitle: "Import Annotations",
    active: "hap"
  });
};

exports.projectPage = (req, res) => {
  res.render("projectPage", {
    pageTitle: "Project Page",
    active: "hap"
  });
};
// -----------

// ----------- APIs
exports.listProjects = async (req, res) => {
  try {
    const response = await Hapyak.Project.find({});
    return res.send({ data: response });
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.getProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const videoId = req.body.videoId;

  // ******
  //https://api.hapyak.com/api/customer/project/225547/
  const url = `${HAPYAKSERVICEURL}customer/project/${videoId}/`;
  // ******

  const options = {
    method: "get",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    }
  };

  try {
    const response = await axios(options);
    return res.send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.createProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/`;
  const videoId = req.body.video_source_id;

  const bcToken = await getBcToken();

  //hardcode ATOM BC account for now
  const videoInfo = await getBcVideo(1107601866001, videoId, bcToken);
  const title = videoInfo.name;

  const body = {
    video_source: "brightcove",
    video_source_id: videoId,
    title
  };

  const options = {
    method: "post",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    },
    data: body
  };

  try {
    const response = await axios(options);

    //Write response to DB.
    const project = new Hapyak.Project({
      id: response.data.project.id,
      title: response.data.project.title,
      brightcoveId: videoId,
      video: response.data.project.video,
      track: response.data.project.track,
      created: Date.now()
    });
    await project.save();

    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.deleteProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const id = req.body.toBeDeleted;
  const url = `${HAPYAKSERVICEURL}customer/project/${id}/`;

  const options = {
    method: "delete",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    }
  };

  try {
    const response = await axios(options);
    await Hapyak.Project.findOneAndRemove({ id });

    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error);
    return res.status(error.response.status).send("Error");
  }
};

exports.getAnnotation = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();

  // ******
  //https://api.hapyak.com/api/customer/project/225545/annotation/1300207/
  const url = `${HAPYAKSERVICEURL}customer/project/225545/annotation/1300207/`;
  // ******

  const options = {
    method: "get",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    }
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    // return res.status(error.response.status).send("Error");
    return res.send("Error");
  }
};

exports.createAnnotation = async (req, res) => {
  const projectId = req.body.projectId;
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/${projectId}/annotation/`;
  const body = {
    type: "quiz",
    quiz: [
      {
        text: "What's the capital of New York?",
        answers: [
          {
            text: "Albany",
            correct: true
          },
          {
            text: "Syracuse",
            correct: false
          }
        ]
      },
      {
        text: "Can you check it? Yes you can.",
        answers: [
          {
            text: "Red",
            correct: true
          },
          {
            text: "Yellow",
            correct: true
          },
          {
            text: "Blue",
            correct: true
          }
        ]
      }
    ],
    passing_mark: 51,
    start: 3,
    end: 15
  };

  const options = {
    method: "post",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    },
    data: body
  };

  try {
    const response = await axios(options);

    //Write response to DB.
    const project = new Hapyak.Annotation({
      id: response.data.annotation.id,
      projectId,
      type: response.data.annotation.type,
      startTime: body.start,
      created: Date.now()
    });

    await project.save();

    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.deleteAnnotation = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const annotationId = req.body.annotationId;
  const projectId = req.body.projectId;
  const url = `${HAPYAKSERVICEURL}customer/project/${projectId}/annotation/${annotationId}/`;

  const options = {
    method: "delete",
    url,
    headers: {
      "X-Hapyak-Grant-Token": hapyToken.token,
      "Content-Type": "application/json"
    }
  };

  try {
    const response = await axios(options);
    await Hapyak.Annotation.findOneAndRemove({ id: annotationId });
    return response.data;
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.listAnnotations = async (req, res) => {
  let projectId = parseInt(req.params.projectId);

  try {
    const response = await Hapyak.Annotation.find({ projectId });
    return res.send({ data: response });
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.getHapyakToken = async () => {
  const url = `${HAPYAKSERVICEURL}auth/`;

  const options = {
    method: "post",
    url,
    data: {
      api_key: process.env.HAPYAKCLIENTID,
      secret: process.env.HAPYAKCLIENTSECRET
    },
    headers: {
      "Content-Type": "application/json"
    }
  };

  const response = await axios(options);

  return {
    token: response.data.token,
    expires: response.data.expires
  };
};
