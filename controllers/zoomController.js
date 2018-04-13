const jwt = require('jsonwebtoken');
const axios = require('axios');
const { moment } = require('../helpers');


const TUTORS_GROUP_ID = 'W3d-qqpNTX6bnzuKhP5zCg';


exports.recordingsTool = (req, res) => {
  res.render("zoomRecordingsTool", {
    pageTitle: "Zoom Recordings",
    active: "zoom"
  });
};

exports.alternateHostTool = (req, res) => {
  res.render("alternateHostTool", {
    pageTitle: "Alternate Host Tool",
    active: "zoom"
  });
};

// ---- APIs 

exports.getToken = () => {
  const payload = {
    iss: process.env.ZOOMAPIKEY,
    exp: new Date().getTime() + 5000
  };

  var token = jwt.sign(payload, process.env.ZOOMAPISECRET);

  return token;
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

        const dailyReportObj = response.data.dates.filter(report => report.date === todaysDate);
        resolve(dailyReportObj[0]);
      });
  });
};

exports.getTutorRecordings = async (req, res) => {
  let recordings = [];
  let page_size = 10;

  // Get page count for all Tutors group members
  const url = `https://api.zoom.us/v2/groups/${TUTORS_GROUP_ID}/members`;
  const token = exports.getToken();
  const response = await axios.get(url, {
    params: {
      access_token: token,
      page_size
    }
  });

  const pageCount = response.data.page_count;
  let pageNumber = 1;

  do {
    const url = `https://api.zoom.us/v2/groups/${TUTORS_GROUP_ID}/members`;
    const token = exports.getToken();
    const response = await axios.get(url, {
      params: {
        access_token: token,
        page_size,
        page_number: pageNumber
      }
    });

    const users = response.data.members;

    // Get list of recordings for each user   
    // date format: 2017-08-28
    const startDate = moment().subtract(1, "months").format('YYYY-MM-DD'); 
    const endDate = moment().format('YYYY-MM-DD');

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
              recording_start,
              file_type,
              download_url
            }) => ({
                id,
                meeting_id,
                recording_start,
                file_type,
                download_url
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


  let filteredRecordings = recordings.filter(rec => rec.file_type === 'MP4');

  const data = { data: filteredRecordings };
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}


exports.getRecordings = async (req, res) => {
  let recordings = [];
  let page_size = 5;

  //  Get list of all users
  // Get page count
  const url = "https://api.zoom.us/v2/users";
  const token = exports.getToken();
  const response = await axios.get(url, {
    params: {
      access_token: token,
      page_size
    }
  });

  const pageCount = response.data.page_count;
  let pageNumber = 1;              //response.data.page_number;

  do {
    // Get list of all users
    const url = "https://api.zoom.us/v2/users";
    const token = exports.getToken();
    const response = await axios.get(url, {
      params: {
        access_token: token,
        page_size,
        page_number: pageNumber
      }
    });

    const users = response.data.users;

    // Get list of recordings for each user   
    // date format: 2017-08-28
    const startDate = moment().subtract(6, "months").format('YYYY-MM-DD'); 
    const endDate = moment().format('YYYY-MM-DD');

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
  res.setHeader('Content-Type', 'application/json');
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

exports.setAlternateHosts = async (req, res) => {
  const email = req.params.email;
  const url = `https://api.zoom.us/v2/users/${email}/meetings`;
  const token = exports.getToken();
  let response = {};
  
  try {
    response = await axios.get(url, {
      params: {
        access_token: token,
        page_size: 100
      }
    });
  } catch(error){
    console.log("It's catching here ain't it?");
    console.log(error.response.status, error.response.statusText);
    return res.status(error.response.status).send({ error: error.response.statusText });
  }

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
  } catch(error) {
    console.log("IS IT CATCHING HERE?");
    console.log(error.response.status, error.response.statusText);
    return res.status(error.response.status).send({ error: error.response.statusText });
  }

  res.sendStatus(200);
};