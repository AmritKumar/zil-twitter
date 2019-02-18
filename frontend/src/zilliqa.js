const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
const CP = require("@zilliqa-js/crypto");
const { promisify } = require("util");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

export async function submitTweet(contract, tweetId) {
  const tx = await contract.call(
    "register_user",
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
  console.log(tx, tx.receipt);
  return tx.receipt;
}
