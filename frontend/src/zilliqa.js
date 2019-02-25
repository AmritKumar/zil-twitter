const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
const contracts = require("@zilliqa-js/contract");
const CP = require("@zilliqa-js/crypto");
const { promisify } = require("util");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

const contractAddress = "4a3164bdca141e21c30c9d42c47abe6bcc4b8915";
export const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);
const myGasPrice = new BN("5000000000");

export async function isTweetIdAlreadyRegistered(tweetId) {
  const state = await contract.getState();
  const verifyingTweets = state.find(s => s.vname === "verifying_tweets");
  const tweet = verifyingTweets.value.find(v => v.key === tweetId);
  return !tweet;
}

export async function isUserRegistered(username) {
  const state = await contract.getState();
  const usedUsernames = state.find(s => s.vname === "used_usernames");
  const isUsed = usedUsernames.value.find(u => u.key === username);
  return !!isUsed;
}

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
      gasPrice: myGasPrice,
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

  try {
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
  } catch (e) {
    console.error(e);
    throw new Error("Failed to submit tweet. Please try again.");
  }
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
    throw new Error(
      "Cannot retrieve tweet verification. Please refresh and try again."
    );
  }
}
