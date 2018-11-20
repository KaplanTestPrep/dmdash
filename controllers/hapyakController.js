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
  console.log("videoInfo: ", videoInfo.status);

  if (videoInfo.status === 404) {
    return res.status(videoInfo.status).send(videoInfo.statusText);
  }

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

    //Error handling for "This video record already exists in our database"
    if (
      response.data.message &&
      response.data.message ===
        "This video record already exists in our database. You cannot update or create a new project with it."
    ) {
      throw {
        response: {
          status: 409,
          message:
            "This video record already exists in our database. You cannot update or create a new project with it."
        }
      };
    }

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
    // console.log(error);
    return res.status(error.response.status).send(error.response.message);
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
    // console.log(error);
    return res.status(error.response.status).send("Error");
  }
};

exports.getAnnotation = async (req, res) => {
  const projectId = req.body.projectId;
  const annotationId = req.body.annotationId;
  const hapyToken = await exports.getHapyakToken();

  const url = `${HAPYAKSERVICEURL}customer/project/${projectId}/annotation/${annotationId}/`;

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
  const annotation = req.body.annotation;
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/${projectId}/annotation/`;
  const body = makeAnnotationBody(annotation);

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
    // console.log(error);
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
    return res.status(200).send(response.data);
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

function makeAnnotationBody(annotation) {
  annotation.start = parseInt(annotation.start, 10);
  annotation.end = parseInt(annotation.end, 10);
  if (annotation.pause) annotation.pause = parseInt(annotation.pause, 10);
  if (annotation.passing_mark)
    annotation.passing_mark = parseInt(annotation.passing_mark, 10);
  if (annotation.reset_variables)
    annotation.reset_variables = isTrue(annotation.reset_variables);
  if (annotation.multiple_answers)
    annotation.multiple_answers = isTrue(annotation.multiple_answers);
  if (annotation.multiple_required)
    annotation.multiple_required = isTrue(annotation.multiple_required);
  if (annotation.show_skip) annotation.show_skip = isTrue(annotation.show_skip);
  if (annotation.show_retry)
    annotation.show_retry = isTrue(annotation.show_retry);
  if (annotation.show_results)
    annotation.show_results = isTrue(annotation.show_results);

  if (annotation.type === "quiz") {
    let quiz = {};
    let answers = [];

    quiz.text = annotation.questionText;
    answers.push({
      text: annotation.answerOptionA,
      correct: "A" === annotation.answerOptionCorrect
    });
    answers.push({
      text: annotation.answerOptionB,
      correct: "B" === annotation.answerOptionCorrect
    });
    answers.push({
      text: annotation.answerOptionC,
      correct: "C" === annotation.answerOptionCorrect
    });
    answers.push({
      text: annotation.answerOptionD,
      correct: "D" === annotation.answerOptionCorrect
    });

    delete annotation.questionText;
    delete annotation.answerOptionA;
    delete annotation.answerOptionB;
    delete annotation.answerOptionC;
    delete annotation.answerOptionD;
    delete annotation.answerOptionCorrect;

    quiz.answers = answers;
    annotation.quiz = [quiz];

    return annotation;
  }

  return annotation;
}

function isTrue(string) {
  return string.toLowerCase() == "true";
}
