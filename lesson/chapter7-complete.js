const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, units } = require("@zilliqa-js/util");
const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);

const privateKey = "YOUR PRIVATE KEY";
zilliqa.wallet.addByPrivateKey(privateKey);

async function getTweets() {
  const state = await contract.getState();
  const verifyingTweets = state.find(s => s.vname === "verifying_tweets");
  return verifyingTweets.value;
}

async function displayTweets() {
  const tweets = await getTweets();
  const tweetHtml = tweets.forEach(tweet => {
    const tweetId = tweet.key;
    const submitterAddress = tweet.val.arguments[0];

    $("#tweets").append(`<div class="tweet">
        <div>${tweetId}</div>
        <div>${submitterAddress}</div>
      </div>
    `);
  });
}

async function submitTweet(tweetId) {
  // write your function here
  const tx = await contract.call(
    "new_tweet",
    [
      {
        vname: "tweet_id",
        type: "String",
        value: tweetId
      }
    ],
    {
      version: VERSION,
      amount: new BN(0),
      gasPrice: units.toQa("0.005", units.Units.Zil),
      gasLimit: Long.fromNumber(1000)
    }
  );
  return tx;
}
