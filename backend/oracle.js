const fs = require("fs");
const { promisify } = require("util");
const { Zilliqa } = require("@zilliqa-js/zilliqa");
const CP = require("@zilliqa-js/crypto");
const { BN, Long, bytes, units } = require("@zilliqa-js/util");

const CHAIN_ID = 2;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

const zilliqa = new Zilliqa("http://localhost:4200/");

const CONTRACT_PATH = "/code/scilla-benchmark/zil-twitter/Twitter.scilla";

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;

zilliqa.wallet.addByPrivateKey(OWNER_PRIVATE_KEY);
zilliqa.wallet.addByPrivateKey(ORACLE_PRIVATE_KEY);
zilliqa.wallet.addByPrivateKey(USER_PRIVATE_KEY);

const ownerAddress = CP.getAddressFromPrivateKey(OWNER_PRIVATE_KEY);
const oracleAddress = CP.getAddressFromPrivateKey(ORACLE_PRIVATE_KEY);
const userAddress = CP.getAddressFromPrivateKey(USER_PRIVATE_KEY);
const myGasPrice = units.toQa("1000", units.Units.Li);

async function readContractFile(filepath) {
  const readfile = promisify(fs.readFile);
  try {
    const content = await readfile(filepath);
    return content.toString();
  } catch (e) {
    console.error(e);
  }
}

const init = [
  {
    vname: "_scilla_version",
    type: "Uint32",
    value: "0"
  },
  {
    vname: "owner",
    type: "ByStr20",
    value: `0x${ownerAddress}`
  },
  {
    vname: "oracle_address",
    type: "ByStr20",
    value: `0x${oracleAddress}`
  },
  {
    vname: "hashtag",
    type: "String",
    value: "#BuiltWithZil"
  }
];

async function deployTestContract() {
  const code = await readContractFile(CONTRACT_PATH);
  const contract = zilliqa.contracts.new(code, init);
  try {
    const [deployTx, deployedContract] = await contract.deploy({
      version: VERSION,
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(10000)
    });
    return deployedContract;
  } catch (e) {
    console.error(e);
  }
}

async function fundAccount(address) {
  const tx = zilliqa.blockchain.createTransaction(
    zilliq.transactions.new({
      version: VERSION,
      toAddr: address,
      amount: new BN(300),
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(1)
    })
  );
  return tx.receipt;
}

async function registerUser(contract, username) {
  const params = [
    {
      vname: "user_address",
      type: "ByStr20",
      value: `0x${userAddress}`
    },
    { vname: "twitter_username", type: "String", value: username }
  ];
  const callTx = await contract.call("register_user", params, {
    version: VERSION,
    amount: new BN(0),
    gasPrice: myGasPrice,
    gasLimit: Long.fromNumber(10000)
  });
  return callTx;
}

async function submitNewTweet(tweetId) {}

async function verifyNewTweet(
  contract,
  userAddress,
  tweetId,
  tweetText,
  startPos,
  endPos
) {
  const myGasPrice = units.toQa("1000", units.Units.Li);
  const params = [
    {
      vname: "user_address",
      type: "ByStr20",
      value: `0x${userAddress}`
    },
    {
      vname: "tweet_id",
      type: "String",
      value: tweetId
    },
    {
      vname: "tweet_text",
      type: "String",
      value: tweetText
    },
    {
      vname: "start_pos",
      type: "Uint32",
      value: startPos.toString()
    },
    {
      vname: "end_pos",
      type: "Uint32",
      value: endPos.toString()
    }
  ];
  contract.call("verify_tweet", params, {
    version: VERSION,
    amount: new BN(0),
    gasPrice: myGasPrice,
    gasLimit: Long.fromNumber(1000000)
  });
}

async function test() {
  const contract = await deployTestContract();
  const callTx = await registerUser(contract, "kenchangh");
  console.log(callTx);
}
test();

module.exports = { deployTestContract, submitNewTweet, verifyNewTweet };
