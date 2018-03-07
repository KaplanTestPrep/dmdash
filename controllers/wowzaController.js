const axios = require("axios");
const { moment } = require("../helpers");
const { wowzerServers, wowzaHost } = require("../config/wowzaConfig");

// --------- Page Renderers
exports.wowzaMonitor = async (req, res) => {
  const data = await exports.getStatus();
  console.log(data);
  res.render("wowzaMonitor", {
    pageTitle: "Wowza Monitor",
    active: "wowza",
    data: data
  });
};

exports.getStatus = async (req, res) => {
  let serversStatus = await Promise.all(
    wowzerServers.map(server => getServerStatus(server))
  );
  return serversStatus;
};

let getServerStatus = server => {
  const url = `http://${server}.${wowzaHost}/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/live/monitoring/current`;
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(function(response) {
        let status = response.data;
        status.serverName = server;
        resolve(status);
      })
      .catch(error => reject(error));
  });
};
