"use strict";

const passport = require("passport"), 
  TwitterTokenStrategy = require("passport-twitter-token"),
  User = require("mongoose").model("User"),
  TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;;

module.exports = () => {
  passport.use(
    new TwitterTokenStrategy(
      {
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET
        // includeEmail: true
      },
      (token, tokenSecret, profile, done) => {
        User.upsertTwitterUser(token, tokenSecret, profile, 
          (err, user) => {
            done(err, user);
          } 
        );
      }
    )
  );
};
