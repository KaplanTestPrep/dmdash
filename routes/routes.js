const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const dashController = require("../controllers/dashController");
const zoomController = require("../controllers/zoomController");
const bcController = require("../controllers/bcController");
const wowzaController = require("../controllers/wowzaController");
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
  "/recordingsTool",
  authController.isLoggedIn,
  zoomController.recordingsTool
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

router.get(
  "/alternateHostTool",
  authController.isLoggedIn,
  zoomController.alternateHostTool
);

router.post(
  "/setAlternateHosts/:email",
  authController.isLoggedIn,
  zoomController.setAlternateHosts
);

router.get(
  "/videoRenditionsTool",
  authController.isLoggedIn,
  bcController.videoRenditionsTool
);

router.get(
  "/bc/getRenditions/:accountId/:update",
  authController.isLoggedIn,
  catchErrors(bcController.getRenditions)
);

router.get(
  "/batchRetranscodeTool",
  authController.isLoggedIn,
  bcController.batchRetranscodeTool
);

router.post(
  "/bcRetranscode",
  authController.isLoggedIn,
  catchErrors(bcController.retranscode)
);

router.get(
  "/thumbnailUpdateTool",
  authController.isLoggedIn,
  bcController.thumbnailUpdateTool
);

router.post(
  "/bcThumbnailUpload",
  authController.isLoggedIn,
  bcController.thumbnailUpload,
  bcController.thumbnailSave
);

router.post(
  "/bcThumbnailUpdate",
  authController.isLoggedIn,
  catchErrors(bcController.bcThumbnailUpdate)
);

router.get(
  "/refIdUpdateTool",
  authController.isLoggedIn,
  bcController.refIdUpdateTool
);

router.post(
  "/refIdUpdate",
  authController.isLoggedIn,
  catchErrors(bcController.refIdUpdate)
);

router.post(
  "/refIdUpdateBatch",
  authController.isLoggedIn,
  bcController.csvUpload,
  bcController.refIdUpdateBatch
);

router.get(
  "/metadataUpdateTool",
  authController.isLoggedIn,
  bcController.metadataUpdateTool
);

router.post(
  "/metadataUpdate",
  authController.isLoggedIn,
  bcController.metadataUpdate
);

router.get("/mediaShare", authController.isLoggedIn, bcController.mediaShare);

router.post(
  "/mediaShare",
  authController.isLoggedIn,
  catchErrors(bcController.mediaShareSingle)
);

router.post(
  "/mediaShareBatch",
  authController.isLoggedIn,
  bcController.csvUpload,
  bcController.mediaShareBatch
);

router.get(
  "/removeTextTrack",
  authController.isLoggedIn,
  bcController.removeTextTrackTool
);

router.post(
  "/removeTextTrack",
  authController.isLoggedIn,
  bcController.removeTextTrack
);


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
