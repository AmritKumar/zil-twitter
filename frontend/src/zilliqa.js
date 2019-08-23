const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes } = require("@zilliqa-js/util");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

const contractAddress = "a0594b12f6f6bd0430417f3c544bf4ed4f9515fb";
export const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);
const myGasPrice = new BN("5000000000");

export const getTweetStatus = async (tweetId) => {
  const state = await contract.getState();
  const verifiedTweets = state.find(s => s.vname === "verified_tweets");
  const registeredTweets = state.find(s => s.vname === "unverified_tweets");
  const tweetIsVerified = verifiedTweets.value.find(v => v.key === tweetId);
  const tweetIsRegistered = registeredTweets.value.find(v => v.key === tweetId);
  return { isVerified: !!tweetIsVerified, isRegistered: !!tweetIsRegistered };
};

export const isUserRegistered = async (username) => {
  const state = await contract.getState();
  const usedUsernames = state.find(s => s.vname === "used_usernames");
  const isUsed = usedUsernames.value.find(u => u.key === username);
  return !!isUsed;
};

export const registerUser = async (privateKey, userAddress, username) => {
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
};

export const submitTweet = async (privateKey, tweetId) => {
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
    return tx;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to submit tweet. Please make sure the private key used is correct, and that the tweet is not already submitted.");
  }
};
