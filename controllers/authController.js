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
    console.log("PATH:", req.route.path);
    if(req.route.path === "/login"){
      console.log("/login route and authenticated");
      res.redirect("/");
      return false;
    }
    
    next();
    return;
  }
<<<<<<< HEAD
  req.flash("warning", "Oops, you must be logged in to do that!");
=======
  else if(req.route.path === "/login"){
    next();
    return false;
  }
  req.flash("danger", "Oops, you must be logged in to do that!");
>>>>>>> 56a66973424ac4f2c14b076012a05dc8be29ae27
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

<<<<<<< HEAD
// exports.googleAuthCallback = () => {
//   passport.authenticate("google", { failureRedirect: "/login" }),
//     function(req, res) {
//       res.redirect("/dashboard");
//     };
// };
=======
exports.authCallback = () => {
  passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      res.redirect("/");
    };
};
>>>>>>> 56a66973424ac4f2c14b076012a05dc8be29ae27
