const { Zilliqa } = require("@zilliqa-js/zilliqa");
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
  // write your code here
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
