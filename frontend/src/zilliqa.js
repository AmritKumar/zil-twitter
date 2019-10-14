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
  console.log(state);
  const verifiedTweets = Object.keys(state.verified_tweets);
  const registeredTweets = Object.keys(state.unverified_tweets);

  const tweetIsVerified = verifiedTweets.find(v => v === tweetId);
  const tweetIsRegistered = registeredTweets.find(v => v === tweetId);

  return { isVerified: !!tweetIsVerified, isRegistered: !!tweetIsRegistered };
};

export const isUserRegistered = async (username) => {
  const state = await contract.getState();
  const usedUsernames = state.used_usernames;
  if(usedUsernames !== undefined) {
    const isUsed = Object.keys(usedUsernames).find(u => u === username);
    return !!isUsed;
  }else {
    throw 'There is a problem with the contract.';
  }
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

export const submitTweet = async (privateKey, tweetId, passphrase) => {
  const wallet = await zilliqa.wallet.addByKeystore(privateKey, passphrase);


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
