const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
const contracts = require("@zilliqa-js/contract");
const CP = require("@zilliqa-js/crypto");
const { promisify } = require("util");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

const contractAddress = "edf8fbb9e371bd0bb9ae6ea2bc62b4ac36a9a18c";
export const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);
const myGasPrice = new BN("1000000000");

export async function registerUser(privateKey, userAddress, username) {
  zilliqa.wallet.addByPrivateKey(privateKey);
  const tx = await contract.call(
    "register_user",
    [
      {
        vname: "user_address",
        type: "ByStr20",
        value: `0x${userAddress}`
      },
      { vname: "twitter_username", type: "String", value: username }
    ],
    {
      version: VERSION,
      amount: new BN(0),
      gasPrice: new BN("2000000000"),
      gasLimit: Long.fromNumber(1000)
    }
  );
  const { event_logs: eventLogs } = tx.receipt;
  if (!eventLogs) {
    throw new Error(
      "Username or address already used. Please try another username."
    );
  }
  return tx;
}

export async function submitTweet(privateKey, tweetId) {
  zilliqa.wallet.addByPrivateKey(privateKey);

  const state = await contract.getState();
  console.log(state);

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
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(1000)
    }
  );
  console.log(tx);
  const { id: txnId } = tx;
  return { txnId, ...tx.receipt };
}

export async function getTweetVerification(txnId, tweetId) {
  try {
    const tx = await zilliqa.blockchain.getTransaction(txnId);
    const { event_logs: eventLogs } = tx.receipt;
    const eventLog = eventLogs.find(e => e._eventname === "verify_tweet");
    const tweetIdParam = eventLog.params.find(p => p.vname === "tweet_id");
    const matchTweetId = tweetIdParam.value;
    if (tweetId !== matchTweetId) {
      throw new Error(
        `Tweet ID '${tweetId}' does not match tweet ID from transaction '${matchTweetId}'`
      );
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
