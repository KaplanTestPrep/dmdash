const jwt = require("jsonwebtoken");
const axios = require("axios");
const { moment } = require("../helpers");

exports.recordings = (req, res) => {
  res.render("zoomRecordings", {
    pageTitle: "Zoom Recordings",
    active: "zoom"
  });
};

exports.getRecordings = async (req, res) => {

  let recordings = [];
  // let pageNumber = 0;
  // let pageCount = 0;

  //  Get list of all users
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
      console.log(pageCount, pageNumber);
      
      const users = response.data.users;
      console.log(users);

      // Get list of recordings for each user
      const endDate = moment().toISOString().split("T")[0];
      const startDate = moment().subtract(6, "months").toISOString().split("T")[0];

      // console.log({startDate, endDate});

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

          // console.log(response.status);
          if(response.status !== 200){
            console.log('Error: ', response.statusText);
          }

          //   console.log(response.data);
          const meetings = response.data.meetings;
          let recording = {};

          meetings.forEach(meeting => {
            // console.log(meeting.id);
            const topic = meeting.topic;

            meeting.recording_files.forEach(rawRecording => {
              recording = (({
                id,
                meeting_id,
                file_size,
                recording_start,
                recording_end
              }) => ({
                id,
                meeting_id,
                file_size,
                recording_start,
                recording_end
              }))(rawRecording);

              recording.user = userEmail;
              recording.topic = topic;

              recordings.push(recording);
            });
          });
        })
      );

      pageNumber++;
  }
  while (pageNumber <= pageCount );


  const data = { data: recordings };
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
};

exports.users = (req, res) => {
  res.render("zoomUsers", { pageTitle: "Zoom Users", active: "zoom" });
};

exports.getToken = () => {
  const payload = {
    iss: process.env.ZOOMAPIKEY,
    exp: new Date().getTime() + 5000
  };
  //Automatically creates header, and returns JWT
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
      .then(function(response) {
        // console.log("Response:", response.data);
        const todaysDate = new Date().toISOString().split("T")[0];
        const dailyReportObj = response.data.dates.filter(
          report => report.date === todaysDate
        );
        console.log('Resolve:',dailyReportObj[0] )
        resolve(dailyReportObj[0]);
      });
  });
};

