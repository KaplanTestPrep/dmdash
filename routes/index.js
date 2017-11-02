const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

router.get("/", (req, res) => {
  res.render("layout");
});

router.get("/dashboard", authController.isLoggedIn, (req, res) => {
  res.render("dashboard", { pageTitle: "Dashboard" });
});

router.get("/profile", authController.isLoggedIn, (req, res) => {
  req.flash("error", "Testing 123 123");
  res.render("profile", { pageTitle: "Profile" });
});

router.get("/login", userController.loginForm);

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
    res.redirect("/dashboard");
  }
);

router.get("/logout", authController.logout);

module.exports = router;
