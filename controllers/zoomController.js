const jwt = require("jsonwebtoken");
const axios = require("axios");
const { moment } = require("../helpers");

exports.getToken = () => {
  const payload = {
    iss: process.env.ZOOMAPIKEY,
    exp: new Date().getTime() + 5000
  };
  //Automatically creates header, and returns JWT
  var token = jwt.sign(payload, process.env.ZOOMAPISECRET);

  return token;
};

exports.getRecordings = async (req, res) => {
  let recordings = [];

  //  Get list of all users
  // Get page count
  const url = "https://api.zoom.us/v2/users";
  const token = exports.getToken();
  const response = await axios.get(url, {
    params: {
      access_token: token,
      page_size: 10
    }
  });

  const pageCount = response.data.page_count;
  let pageNumber = response.data.page_number;

  do {
    // Get list of all users
    const url = "https://api.zoom.us/v2/users";
    const token = exports.getToken();
    const response = await axios.get(url, {
      params: {
        access_token: token,
        page_size: 10,
        page_number: pageNumber
      }
    });

    const users = response.data.users;

    // Get list of recordings for each user
    const endDate = moment()
      .toISOString()
      .split("T")[0];
    const startDate = moment()
      .subtract(6, "months")
      .toISOString()
      .split("T")[0];

    await Promise.all(
      users.map(async user => {
        const url = `https://api.zoom.us/v2/users/${user.id}/recordings`;
        const token = exports.getToken();
        const userEmail = user.email;

        const response = await axios.get(url, {
          params: {
            access_token: token,
            userId: user.id,
            from: startDate,
            to: endDate
          }
        });

        const meetings = response.data.meetings;
        let recording = {};

        meetings.forEach(meeting => {
          const topic = meeting.topic;

          meeting.recording_files.forEach(rawRecording => {
            recording = (({
              id,
              meeting_id,
              file_size,
              recording_start,
              recording_end,
              file_type
            }) => ({
                id,
                meeting_id,
                file_size,
                recording_start,
                recording_end,
                file_type
              }))(rawRecording);

            recording.user = userEmail;
            recording.topic = topic;

            recordings.push(recording);
          });
        });
      })
    );

    pageNumber++;
  } while (pageNumber <= pageCount);

  const data = { data: recordings };
  //res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
};

exports.deleteRecordings = async (req, res) => {
  const toBeDeleted = req.body;
  console.log(toBeDeleted);

  const token = exports.getToken();
  try {
    const promises = toBeDeleted.map(rec => {
      const url = `https://api.zoom.us/v2/meetings/${
        rec.meetingId
        }/recordings/${rec.id}`;
      return axios.delete(url, {
        params: {
          access_token: token
        }
      });
    });

    const response = await Promise.all(promises);
    console.log(response);
  } catch (err) {
    console.log(err);
  }

  res.sendStatus(200);
};

exports.getDailyReport = () => {
  const url = "https://api.zoom.us/v2/report/daily";
  const token = exports.getToken();

  return new Promise(resolve => {
    axios
      .get(url, {
        params: {
          access_token: token
        }
      })
      .then(function (response) {
        // console.log("Response:", response.data);
        const todaysDate = new Date().toISOString().split("T")[0];
        console.log(todaysDate);

        const dailyReportObj = response.data.dates.filter(
          report => report.date === todaysDate
        );
        console.log("Resolve:", dailyReportObj[0]);
        resolve(dailyReportObj[0]);
      });
  });
};

exports.recordings = (req, res) => {
  res.render("zoomRecordings", {
    pageTitle: "Zoom Recordings",
    active: "zoom"
  });
};

exports.alternateHosts = (req, res) => {
  res.render("zoomAltHosts", {
    pageTitle: "Alternate Host Tool",
    active: "zoom"
  });
};

exports.setAlternateHosts = async (req, res) => {
  const email = req.params.email;
  const url = `https://api.zoom.us/v2/users/${email}/meetings`;
  const token = exports.getToken();

  const response = await axios.get(url, {
    params: {
      access_token: token,
      page_size: 100
    }
  });

  const meetings = response.data.meetings;

  try {
    await Promise.all(
      meetings.map(async meeting => {
        meetingId = meeting.id;
        const url = `https://api.zoom.us/v2/meetings/${meetingId}`;
        const token = exports.getToken();

        const response = await axios({
          method: 'patch',
          url,
          params: {
            access_token: token
          },
          data: {
            "settings": {
              "alternative_hosts": "LiveOnlineService@kaplan.com loltech@kaplan.com"
            }
          }
        });
      })
    )
  } catch (error) {
    console.log(error);
  }

  res.sendStatus(200);
};
