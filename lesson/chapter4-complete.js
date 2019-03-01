const { Zilliqa } = require("@zilliqa-js/zilliqa");
const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);

async function getTweets() {
  // write your code here
  const state = await contract.getState();
  const verifyingTweets = state.find(s => s.vname === "verifying_tweets");
  return verifyingTweets.value;
}
