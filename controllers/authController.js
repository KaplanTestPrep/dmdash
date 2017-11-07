const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

exports.logout = (req, res) => {
  req.flash("success", "You are now logged out!");
  req.logout();
  res.redirect("/login");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("warning", "Oops, you must be logged in to do that!");
  res.redirect("/login");
};

// exports.googleAuthenticate = (req, res) => {
//   passport.authenticate("google", {
//     scope: [
//       "https://www.googleapis.com/auth/plus.login",
//       "https://www.googleapis.com/auth/plus.profile.emails.read"
//     ]
//   });
// };

// exports.googleAuthCallback = () => {
//   passport.authenticate("google", { failureRedirect: "/login" }),
//     function(req, res) {
//       res.redirect("/dashboard");
//     };
// };
