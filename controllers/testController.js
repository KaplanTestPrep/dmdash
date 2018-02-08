const mongoose = require("mongoose");

exports.test = (req, res) => {
  res.render("login", { title: "Login" });
};
