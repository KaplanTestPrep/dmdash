const Hapyak = require("../models/Hapyak");
const axios = require("axios");

// CONFIGS - to be moved into config file
let HAPYAKSERVICEURL = `https://api.hapyak.com/api/`;

// --------- Page Renderers
exports.getProjectTool = (req, res) => {
  res.render("getProject", {
    pageTitle: "Get Project",
    active: "hap"
  });
};

// -----------

// ----------- APIs
exports.getProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();

  // ******
  //https://api.hapyak.com/api/customer/project/225547/
  const url = `${HAPYAKSERVICEURL}customer/project/230232/`;
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
    console.log(response.data);
    return res.send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.createProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/`;

  const body = {
    video_source: "brightcove",
    video_source_id: "5826040391001",
    title: "irman test 1 "
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
    console.log(response.data);

    return res.send(response.data);
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.deleteProject = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/231179/`;

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
    console.log(response.data);
    return response.data;
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    // return res.status(error.response.status).send("Error");
    return res.send("Error");
  }
};

exports.createAnnotation = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/225545/annotation/`;

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
    start: 30,
    end: 35
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    return res.status(error.response.status).send("Error");
  }
};

exports.deleteAnnotation = async (req, res) => {
  const hapyToken = await exports.getHapyakToken();
  const url = `${HAPYAKSERVICEURL}customer/project/225545/annotation/1306111/`;

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
    console.log(response.data);
    return response.data;
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
