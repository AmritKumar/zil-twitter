const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes } = require("@zilliqa-js/util");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

const contractAddress = "776f230Bb317015C920928ad32267519DB306881";
const opk = "db11cfa086b92497c8ed5a4cc6edb3a5bfe3a640c43ffb9fc6aa0873c56f2ee3";
export const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
const contract = zilliqa.contracts.at(contractAddress);
const myGasPrice = new BN("1000000000");

export const getTweetStatus = async (tweetId) => {
  const state = await contract.getState();
  const verifiedTweets = Object.values(state.verified_tweets);

  const tweetIsVerified = verifiedTweets.find(v => v === tweetId);

  return { isVerified: !!tweetIsVerified, isRegistered: !!tweetIsVerified };
};

export const isUserRegistered = async (username) => {
  const state = await contract.getState();

  if (state.users !== undefined) {
    const isUsed = Object.keys(state.users).find(u => u.toLowerCase() === username.toLowerCase());
    return !!isUsed;
  } else {
    throw new Error('There is a problem with the contract.');
  }
};

export const registerUser = async (privateKey, userAddress, username) => {
  zilliqa.wallet.addByPrivateKey(opk);
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
      gasLimit: Long.fromNumber(10000)
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

export const submitTweet = async (privateKey, data, passphrase) => {
  const wallet = await zilliqa.wallet.addByKeystore(privateKey, passphrase);



  try {
    const tx = await contract.call(
      "verify_tweet_pay",
      [
        {
          vname: "tweet_id",
          type: "String",
          value: `${data.tweetId}`
        },
        {
          "vname": "twitter_username",
          "type": "String",
          "value": `${data.username}`
        },
        {
          "vname": "tweet_text",
          "type": "String",
          "value": `${data.tweetText}`
        },
        {
          "vname": "start_pos",
          "type": "Uint32",
          "value": `${data.startPos}`
        }
      ],
      {
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(50000)
      }
    );
    return tx;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to submit tweet. Please make sure the private key used is correct, and that the tweet is not already submitted.");
  }
};
