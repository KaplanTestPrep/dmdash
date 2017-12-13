const jwt = require('jsonwebtoken');
const axios = require('axios');
const { moment } = require('../helpers');



exports.recordings = (req, res) => {
    res.render("zoomRecordings", { pageTitle: "Zoom Recordings", active: "zoom" });
}

exports.recordingsData = async (req, res) => {

    // Get list of all users
    const url = 'https://api.zoom.us/v2/users';
    const token = exports.getToken();
    
    const response = await axios.get(url, {
        params: {
          access_token: token
        }
    });

    const users = response.data.users;


    // Get list of recordings for each user
    const endDate = moment().toISOString().split('T')[0];
    const startDate = moment().subtract(6, 'months').toISOString().split('T')[0];
    let meetings = [];
    // console.log({startDate, endDate});

    await Promise.all(users.map(async (user) => {
        const url = `https://api.zoom.us/v2/users/${user.id}/recordings`;
        const token = exports.getToken();

        // console.log(user);
        
        const response = await axios.get(url, {
            params: {
              access_token: token,
              userId: user.id,
              from: startDate,
              to: endDate
            }
        });
        
        // recording = {
        //     host: user.email,
        //     hostId: response.data.meetings.host_id,
        //     recId: response.data.meetings.
            
        // }
        // console.log(response.data.meetings);

        meetings = [...meetings, ...response.data.meetings];
      }));

      const recordings = meetings.filter(meeting => { meeting.recording_files });

      const data = { data: meetings};

      console.log(recordings);

    res.send(data);
    
}




exports.users = (req, res) => {
    res.render("zoomUsers", { pageTitle: "Zoom Users", active: "zoom" });
}


exports.getToken = () => {
    const payload = {
        iss: process.env.ZOOMAPIKEY,
        exp: ((new Date()).getTime() + 5000)
    };
    //Automatically creates header, and returns JWT
    var token = jwt.sign(payload, process.env.ZOOMAPISECRET);
        
    return token;
}

exports.getDailyReport = () => {
    const url = 'https://api.zoom.us/v2/report/daily';
    const token = exports.getToken();
    
    return new Promise( resolve => {
        axios.get(url, {
            params: {
              access_token: token
            }
        })
        .then(function (response) {
            // console.log("Response:", response.data);
            const todaysDate = new Date().toISOString().split('T')[0];
            const dailyReportObj = response.data.dates.filter(report => report.date === todaysDate);
            resolve(dailyReportObj[0]);
        });
    })
}



