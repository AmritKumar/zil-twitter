const Twitter = require("twitter");
const { getHashtag } = require("./zilliqa");

async function getTweet(tweetId, accessToken, accessTokenSecret) {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
  });
  const url = "/statuses/show/" + tweetId;
  return new Promise((resolve, reject) => {
    client.get(url, { tweet_mode: "extended" }, function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

async function getTweetUsername(tweetId, accessToken, accessTokenSecret) {
  try {
    const data = await getTweet(tweetId, accessToken, accessTokenSecret);
    return data.user.screen_name;
  } catch (e) {
    console.error(e);
  }
}

async function getTweetData(tweetId, accessToken, accessTokenSecret) {
  try {
    const hashtag = await getHashtag();
    const data = await getTweet(tweetId, accessToken, accessTokenSecret);
    const tweetText = data.full_text.toLowerCase();
    let startPos = tweetText.indexOf(hashtag.toLowerCase());
    let endPos = 0;
    if (startPos !== -1) {
      endPos = startPos + hashtag.length - 1;
    } else {
      startPos = 0;
    }
    const username = data.user.screen_name;
    return {
      tweetId,
      tweetText,
      username,
      startPos,
      endPos
    };
  } catch (e) {
    console.error(e);
  }
}

module.exports = { getTweetData, getTweetUsername };
