const axios = require("axios");
const { moment } = require("../helpers");
const bc = require("../config/bcConfig");
const multer = require("multer");
const fs = require('fs');

// --------- Page Renderers
exports.wowzaMonitor = (req, res) => {
    const data = exports.getStatus();
    res.render("wowzaMonitor", {
        pageTitle: "Wowza Monitor",
        active: "wowza",
        data
  });
};



exports.getStatus = async (req, res) => {
    const url = "http://wowza-srv02.onlinepreplive.com:8087/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/live/monitoring/current";
    
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: {
            access_token: token
          }
        })
        .then(function (response) {
          const todaysDate = new Date().toISOString().split("T")[0];
  
          const dailyReportObj = response.data.dates.filter(report => report.date === todaysDate);
          resolve(dailyReportObj[0]);
        })
        .catch(err){
            reject(new Error(err));
        }

}