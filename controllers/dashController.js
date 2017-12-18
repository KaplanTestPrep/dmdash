const zoom = require("./zoomController");


exports.getDashboard = async (req, res) => {
    const dailyReport = await zoom.getDailyReport();
    res.render('dashboard', { title: 'Dashboard', dailyReport });
};