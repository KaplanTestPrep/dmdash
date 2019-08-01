const zoom = require("./zoomController");
const wowza = require("./wowzaController");

exports.getDashboard = async (req, res) => {
  const dailyZoomReport = await zoom.getDailyReport();
  // not being used
  // const wowzaServerStatus = await wowza.getStatus();
  //

  res.render("dashboard", {
    title: "Dashboard",
    dailyZoomReport
    // wowzaServerStatus
  });
};
