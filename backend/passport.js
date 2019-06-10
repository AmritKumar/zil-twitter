"use strict";

const passport = require("passport"), 
  TwitterTokenStrategy = require("passport-twitter-token"),
  User = require("mongoose").model("User"),
  TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;;

module.exports = function() {
  passport.use(
    new TwitterTokenStrategy(
      {
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET
        // includeEmail: true
      },
      function(token, tokenSecret, profile, done) {
        User.upsertTwitterUser(token, tokenSecret, profile, function(
          err,
          user
        ) {
          return done(err, user);
        });
      }
    )
  );
};
