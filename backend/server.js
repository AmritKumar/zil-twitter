"use strict";

// mongoose file must be loaded before all other files in order to provide
// models to other modules
const mongoose = require("./mongoose"),
  passport = require("passport"),
  express = require("express"),
  jwt = require("jsonwebtoken"),
  router = express.Router(),
  cors = require("cors"),
  path = require("path"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  request = require("request");

const {
  fundAccount,
  getTweetId,
  verifyTweet
} = require("./zilliqa");
const { getTweetData } = require("./twitter");

mongoose();

const User = require("mongoose").model("User");
const passportConfig = require("./passport");

passportConfig();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", "127.0.0.1");
}

// enable cors
const corsOption = {
  origin: true,
  // methods: "GET,HEAD",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};
app.use(cors(corsOption));
app.use(cookieParser());
//rest API requirements
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

router.route("/auth/twitter/reverse").post((req, res) => {
  request.post(
    {
      url: "https://api.twitter.com/oauth/request_token",
      oauth: {
        oauth_callback: "https%3A%2F%2Flocalhost%3A4000%2Ftwitter-callback",
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET
      }
    },
    (err, json) => {
      if (err) {
        return res.send(500, { message: e.message });
      }
      const jsonStr =
        '{ "' + json.body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    }
  );
});

const generateAndSendToken = (req, res) => {
  const { _id: id } = req.user;
  const username = req.user.twitterProvider.username;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 });
  res.cookie("token", token, {httpOnly: true, sameSite: true });
  res.status(200).send(JSON.stringify({ username }));
};

router.route("/auth/twitter").post(
  (req, res, next) => {
    request.post(
      {
        url: "https://api.twitter.com/oauth/access_token?oauth_verifier",
        oauth: {
          consumer_key: process.env.TWITTER_CONSUMER_KEY,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
          token: req.query.oauth_token
        },
        form: { oauth_verifier: req.query.oauth_verifier }
      },
      function(err, json) {
        if (err) {
          return res.send(500, { message: err.message });
        }

        const bodyString =
          '{ "' + json.body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
        const parsedBody = JSON.parse(bodyString);

        req.body["oauth_token"] = parsedBody.oauth_token;
        req.body["oauth_token_secret"] = parsedBody.oauth_token_secret;
        req.body["user_id"] = parsedBody.user_id;
        req.body["screen_name"] = parsedBody.screen_name;

        next();
      }
    );
  },
  passport.authenticate("twitter-token", {session: false }),
  (req, res, next) => {
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    return next();
  },
  generateAndSendToken
);

//token handling middleware
const authenticate = (req, res, next) => {
  const token = req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.cookies.token;
  if (!token) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        res.status(401).send("Unauthorized: Invalid token");
      } else {
        User.findById(decoded.id, (err, user) => {
          if (err) {
            next(err);
          } else {
            req.user = user;
            next();
          }
        });
      }
    });
  }
};

async function fulfillFundsRequest(req, res, next) {
  // const { userId, token, tokenSecret, address } = req.body;
  const { address } = req.body;

  try {
    // const user = await User.findById(userId);
    // const {
    //   token: matchToken,
    //   tokenSecret: matchTokenSecret
    // } = user.twitterProvider;
    // console.log("user", userId, token, tokenSecret);
    // console.log("match", userId, matchToken, matchTokenSecret);
    // if (token !== matchToken || tokenSecret !== matchTokenSecret) {
    //   throw new Error("Token & token secret does not match");
    // }
    console.log("funding account:", address);
    const fundReceipt = await fundAccount(address);
    // const registerReceipt = await registerUser(address, username);
    // const promises = [fundAccount(address), registerUser(address, username)];
    // const receipts = await Promise.all(promises);
    res.status(200).send(JSON.stringify(fundReceipt));
    next();
  } catch (e) {
    console.error(e);
    res.status(400).send("Not authenticated");
  }
}

router
  .route("/request-funds")
  .post(authenticate, fulfillFundsRequest);

const fulfillSubmitTweet = async (req, res) => {
  const { txnId } = req.body;
  const { tokenSecret } = req.user.twitterProvider

  try {
    const { tweetId, sender } = await getTweetId(txnId);
    const tweetData = await getTweetData(tweetId, twitterToken, tokenSecret);
    const { tweetText, startPos, endPos } = tweetData;
    console.log(tweetData);
    console.log("verifyTweet...");
    const tx = await verifyTweet(sender, tweetId, tweetText, startPos, endPos);
    res.status(200).send(JSON.stringify(tx));
  } catch (e) {
    console.error(e);
    res.status(400).send("Tweet not valid");
  }
};

router
  .route("/submit-tweet")
  .post(authenticate, fulfillSubmitTweet);
// router.route("/submit-tweet").post(authenticate, fulfillSubmitTweet);


app.use("/", router);
app.use("/api/v1", router);

const frontendBuild = path.join(__dirname, "frontend", "build");
console.log(frontendBuild);

app.use(express.static(frontendBuild));

app.listen(4000);
module.exports = app;

console.log("Server running at http://localhost:4000/");
