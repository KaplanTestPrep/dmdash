const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!");
  res.redirect("/login");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", "Oops, you must be logged in to do that!");
  res.redirect("/login");
};

exports.authenticate = (req, res) => {
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  });
};

exports.authCallback = () => {
  passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      res.redirect("/dashboard");
    };
};
