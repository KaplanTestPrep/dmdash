const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");


module.exports = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLECLIENTID,
      clientSecret: process.env.GOOGLECLIENTSECRET,
      callbackURL: process.env.GOOGLECALLBACKURL
    },
    function(request, accessToken, refreshToken, profile, done) {
      User.findOne({ oauthID: profile.id }, function(err, user) {
        if (err) {
          console.log(err); // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new User({
            oauthID: profile.id,
            name: profile.displayName,
            email: profile.email,
            picture: profile.photos[0].value,
            created: Date.now()
          });
          user.save(function(err) {
            if (err) {
              console.log(err); // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
      });
    }
  )
);
