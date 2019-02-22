const { Hapyak, HapyakSubA, HapyakSubB } = require("../models/Hapyak");
const axios = require("axios");
const {
  getBcToken,
  getBcVideo,
  getVideoIdFromRefID
} = require("./bcController");
const { accounts, hapyakToBcAccountMap } = require("../config/hapyakConfig");

// CONFIGS - to be moved into config file
let HAPYAKSERVICEURL = `https://api.hapyak.com/api/`;

// --------- Page Renderers
exports.getProjectTool = (req, res) => {
  res.render("getProject", {
    pageTitle: "Project List",
    active: "hap",
    accounts
  });
};

exports.importAnnotations = (req, res) => {
  res.render("importAnnotations", {
    pageTitle: "Import Annotations",
    active: "hap",
    accounts
  });
};

exports.projectPage = async (req, res) => {
  let projectDetails = await getProject(req.params.projectId, req.query.env);

  res.render("projectPage", {
    pageTitle: "Project Page",
    active: "hap",
    title: projectDetails.title,
    tags: projectDetails.tags,
    id: projectDetails.id,
    video_source_id: projectDetails.video_source_id,
    annotation_count: projectDetails.annotation_count
  });
};
// -----------

// ----------- APIs
exports.listProjects = async (req, res) => {
  const env = req.query.env || "PROD";

  // Local DB Project lookup --------
  //
  // let db = setDBEnv(env);
  // try {
  //   const response = await db.Project.find({});
  //   return res.send({ data: response });
  // } catch (error) {
  //   return res.status(error.response.status).send("Error");
  // }
  // -----------------------------

  const hapyToken = await exports.getHapyakToken(env);
  const url = `${HAPYAKSERVICEURL}customer/project/`;
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
    let results = response.data.result;
    results.forEach(result => {
      if (result.tags) result.tags = result.tags.join(", ");
    });

    return res.send(results);
  } catch (error) {
    return res.status(error).send("Error");
  }
};

// exports.getProject = async (req, res) => {
//   const videoId = req.body.videoId;
//   const env = req.body.env || "PROD";
//   const hapyToken = await exports.getHapyakToken(env);

//   const url = `${HAPYAKSERVICEURL}customer/project/${videoId}/`;

//   const options = {
//     method: "get",
//     url,
//     headers: {
//       "X-Hapyak-Grant-Token": hapyToken.token,
//       "Content-Type": "application/json"
//     }
//   };

//   try {
//     const response = await axios(options);
//     return res.send(response.data);
//   } catch (error) {
//     return res.status(error.response.status).send("Error");
//   }
// };

exports.createProject = async (req, res) => {
  let videoId = "";
  const refId = req.body.refId;
  const env = req.body.env || "PROD";
  const db = setDBEnv(env);
  const hapyToken = await exports.getHapyakToken(env);
  const url = `${HAPYAKSERVICEURL}customer/project/`;
  const bcToken = await getBcToken();

  try {
    const videoIdResponse = await getVideoIdFromRefID(
      hapyakToBcAccountMap[env],
      refId,
      "refId"
    );
    if (typeof videoIdResponse !== "object") videoId = videoIdResponse;
    else videoId = videoIdResponse.data.id;
  } catch (error) {
    console.log(error);
    return res.status(error.response.status).send(error.response.statusText);
  }

  const videoInfo = await getBcVideo(
    hapyakToBcAccountMap[env],
    videoId,
    bcToken
  );

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
    const project = new db.Project({
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
  const id = req.body.toBeDeleted;
  const env = req.body.env || "PROD";
  const db = setDBEnv(env);
  const hapyToken = await exports.getHapyakToken(env);
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
    await db.Project.findOneAndRemove({ id });

    return res.status(200).send(response.data);
  } catch (error) {
    // console.log(error);
    return res.status(error.response.status).send("Error");
  }
};

exports.getAnnotation = async (req, res) => {
  const projectId = req.body.projectId;
  const annotationId = req.body.annotationId;
  const env = req.body.env || "PROD";
  const hapyToken = await exports.getHapyakToken(env);

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
    console.log("getAnnotations Error: ", error);
    // return res.status(error.response.status).send("Error");
    return res.send("Error");
  }
};

exports.createAnnotation = async (req, res) => {
  const projectId = req.body.projectId;
  const annotation = req.body.annotation;
  const env = req.body.env || "PROD";
  const db = setDBEnv(env);
  const hapyToken = await exports.getHapyakToken(env);
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
    const project = new db.Annotation({
      id: response.data.annotation.id,
      projectId,
      type: response.data.annotation.type,
      startTime: body.start || 0,
      created: Date.now()
    });
    await project.save();

    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error);
    return res.status(error.response.status).send("Error");
  }
};

exports.deleteAnnotation = async (req, res) => {
  const annotationId = req.body.annotationId;
  const projectId = req.body.projectId;
  const env = req.body.env || "PROD";
  const db = setDBEnv(env);
  const hapyToken = await exports.getHapyakToken(env);
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
    await db.Annotation.findOneAndRemove({ id: annotationId });
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.listAnnotations = async (req, res) => {
  const env = req.body.env || "PROD";
  const hapyToken = await exports.getHapyakToken(env);
  let projectId = parseInt(req.params.projectId, 10);
  let subsetAnnotations = [];

  // List annotations from local DB
  // const db = setDBEnv(env);
  //
  // try {
  //   const response = await db.Annotation.find({ projectId });
  //   return res.send({ data: response });
  // } catch (error) {
  //   // return res.status(error.response.status).send("Error");
  //   return res.send("Error");
  // }

  let projectDetails = await getProject(projectId, env, hapyToken);
  if (projectDetails.annotation_count === 0) return res.status(200).send({});

  const annotations = await Promise.all(
    projectDetails.annotations.map(anno => {
      return getAnnotation(projectId, anno.id, env, hapyToken);
    })
  );

  annotations.forEach(anno => {
    let subsetAnno = {};

    subsetAnno.id = anno.id;
    subsetAnno.type = anno.type;
    if (anno.type !== "quiz") {
      subsetAnno.class = anno.properties.custom_classes;
      subsetAnno.start = parseFloat(anno.properties.start, 10) || null;
      subsetAnno.end = parseFloat(anno.properties.end, 10) || null;
    } else {
      subsetAnno.start = null;
      subsetAnno.end = null;
      subsetAnno.class = anno.custom_classes;
    }

    subsetAnnotations.push(subsetAnno);
  });

  return res.status(200).send(subsetAnnotations);
};

exports.getHapyakToken = async env => {
  const url = `${HAPYAKSERVICEURL}auth/`;
  let key = "";
  let secret = "";

  switch (env) {
    case "PROD":
      key = process.env.HAPYAKIDPROD;
      secret = process.env.HAPYAKSECRETPROD;
      break;

    case "SUBA":
      key = process.env.HAPYAKIDSUBA;
      secret = process.env.HAPYAKSECRETSUB;
      break;

    case "SUBB":
      key = process.env.HAPYAKIDSUBB;
      secret = process.env.HAPYAKSECRETSUB;
      break;
  }

  const options = {
    method: "post",
    url,
    data: {
      api_key: key,
      secret: secret
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

async function getProject(projectId, env, hapyToken) {
  if (!hapyToken) hapyToken = await exports.getHapyakToken(env);

  const url = `${HAPYAKSERVICEURL}customer/project/${projectId}/`;

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
  } catch (error) {}
}

async function getAnnotation(projectId, annotationId, env, hapyToken) {
  if (!hapyToken) hapyToken = await exports.getHapyakToken(env);

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
    console.log("RESPONSE", response.data);
    return response.data;
  } catch (error) {
    console.log("getAnnotations Error: ", error);
    return false;
  }
}

function makeAnnotationBody(annotation) {
  annotation.start = parseFloat(annotation.start, 10);
  annotation.end = parseFloat(annotation.end, 10);
  if (annotation.duration)
    annotation.duration = parseFloat(annotation.duration, 10);
  if (annotation.pause) {
    annotation.pause =
      annotation.pause === "TRUE" || annotation.pause === "true";
  }
  if (annotation.passing_mark)
    annotation.passing_mark = parseInt(annotation.passing_mark, 10);
  if (annotation.reset_variables)
    annotation.reset_variables = isTrue(annotation.reset_variables);
  if (annotation.multiple_answers)
    annotation.multiple_answers = isTrue(annotation.multiple_answers);
  if (annotation.multiple_required)
    annotation.multiple_required = isTrue(annotation.multiple_required);
  if (annotation.show_review)
    annotation.show_review = isTrue(annotation.show_review);
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
    if (annotation.answerOptionC) {
      answers.push({
        text: annotation.answerOptionC,
        correct: "C" === annotation.answerOptionCorrect
      });
    }
    if (annotation.answerOptionD) {
      answers.push({
        text: annotation.answerOptionD,
        correct: "D" === annotation.answerOptionCorrect
      });
    }
    if (annotation.answerOptionE) {
      answers.push({
        text: annotation.answerOptionE,
        correct: "E" === annotation.answerOptionCorrect
      });
    }

    delete annotation.questionText;
    delete annotation.answerOptionA;
    delete annotation.answerOptionB;
    delete annotation.answerOptionC;
    delete annotation.answerOptionD;
    delete annotation.answerOptionE;
    delete annotation.answerOptionCorrect;

    quiz.answers = answers;
    annotation.quiz = [quiz];

    console.log(answers);
    return annotation;
  }

  if (annotation.type === "contents") {
    delete annotation.start;
    delete annotation.end;
  }

  return annotation;
}

function isTrue(string) {
  return string.toLowerCase() == "true";
}

function setDBEnv(env) {
  switch (env) {
    case "PROD":
      db = Hapyak;
      return db;

    case "SUBA":
      db = HapyakSubA;
      return db;

    case "SUBB":
      db = HapyakSubB;
      return db;
  }
}
