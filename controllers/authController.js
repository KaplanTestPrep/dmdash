const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const logger = require("./loggingController");

exports.logout = (req, res) => {
  req.flash("success", "You are now logged out!");
  req.logout();
  res.redirect("/login");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    //This is not updated for whatever reason ???
    if (!req.user.email.endsWith("@kaplan.com")) {
      req.flash("danger", "You must login with a Kaplan email address!");
      req.logout();
      res.redirect("/login");
      return;
    }

    console.log(`${req.method}: ${req.route.path}`);

    if (req.route.path === "/login") {
      console.log("/login route and authenticated");
      res.redirect("/");
      return false;
    }
    next();
    return;
  } else if (req.route.path === "/login") {
    next();
    return false;
  }
  req.flash("danger", "Oops, you must be logged in to do that!");
  res.redirect("/login");
};

exports.authCallback = () => {
  passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      res.redirect("/");
    };
};
