const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const dashController = require("../controllers/dashController");
const zoomController = require("../controllers/zoomController");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { catchErrors } = require("../handlers/errorHandlers");

router.get(
  "/",
  authController.isLoggedIn,
  catchErrors(dashController.getDashboard)
);

router.get("/profile", authController.isLoggedIn, (req, res) => {
  res.render("profile", { pageTitle: "Profile", active: "profile" });
});

router.get("/login", authController.isLoggedIn, userController.loginForm);

router.get(
  "/zoomRecordings",
  authController.isLoggedIn,
  zoomController.recordings
);

router.get(
  "/getRecordings",
  authController.isLoggedIn,
  catchErrors(zoomController.getRecordings)
);

router.post(
  "/deleteRecordings",
  authController.isLoggedIn,
  zoomController.deleteRecordings
);

router.get("/zoomUsers", authController.isLoggedIn, zoomController.users);

// router.get("/auth/google", authController.authenticate);
// router.get("/auth/google/callback", authController.authCallback);
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function(req, res) {
    res.redirect("/");
  }
);

router.get("/logout", authController.logout);

module.exports = router;
