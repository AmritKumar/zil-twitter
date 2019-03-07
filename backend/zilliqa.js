const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
const CP = require("@zilliqa-js/crypto");
const { promisify } = require("util");
const fs = require("fs");

const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

// const zilliqa = new Zilliqa("http://localhost:4200");
const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");

const CONTRACT_PATH = "../scilla/Twitter.scilla";
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

zilliqa.wallet.addByPrivateKey(OWNER_PRIVATE_KEY);
zilliqa.wallet.addByPrivateKey(ORACLE_PRIVATE_KEY);

const ownerAddress = CP.getAddressFromPrivateKey(OWNER_PRIVATE_KEY);
const oracleAddress = CP.getAddressFromPrivateKey(ORACLE_PRIVATE_KEY);
const contractAddress = "91121ec8f6fdd83992cd5edee29a8dbbd27d21f4";
const deployedContract = zilliqa.contracts.at(`0x${contractAddress}`);

// const myGasPrice = new BN(units.fromQa(new BN("100"), units.Units.Li));
// const myGasPrice = units.toQa("1000", units.Units.Li);
const myGasPrice = new BN("1000000000");

async function readContractFile(filepath) {
  const readfile = promisify(fs.readFile);
  try {
    const content = await readfile(filepath);
    return content.toString();
  } catch (e) {
    console.error(e);
  }
}

const initParams = [
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
    value: "#buildonzil"
  }
];

async function deployTestContract() {
  console.log("deploying contract...");
  const code = await readContractFile(CONTRACT_PATH);
  const contract = zilliqa.contracts.new(code, initParams);
  try {
    const [deployTx, deployedContract] = await contract.deploy({
      version: VERSION,
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(100000)
    });
    console.log(deployTx, deployedContract);
    console.log(deployTx.receipt);
    return deployedContract;
  } catch (e) {
    console.error(e);
  }
}

async function fundAccount(address) {
  const tx = await zilliqa.blockchain.createTransaction(
    zilliqa.transactions.new({
      version: VERSION,
      toAddr: `0x${address}`,
      amount: new BN(units.toQa("50", units.Units.Zil)),
      gasPrice: new BN("2000000000"),
      gasLimit: Long.fromNumber(1)
    })
  );
  console.log("fundAccount", tx.receipt);
  return tx.receipt;
}

async function registerUser(userAddress, username) {
  const tx = await deployedContract.call(
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
  console.log("registerUser", tx.receipt);
  return tx.receipt;
}

async function verifyTweet(userAddress, tweetId, tweetText, startPos, endPos) {
  const params = [
    {
      vname: "user_address",
      type: "ByStr20",
      value: userAddress
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
  zilliqa.wallet.setDefault(oracleAddress);
  const tx = await deployedContract.call("verify_tweet", params, {
    version: VERSION,
    amount: new BN(0),
    gasPrice: new BN("5000000000"),
    gasLimit: Long.fromNumber(5000)
  });
  zilliqa.wallet.setDefault(ownerAddress);
  return tx;
}

async function getBalance() {
  const balance = await zilliqa.blockchain.getBalance(ownerAddress);
  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
  console.log(balance, minGasPrice);
  return balance;
}

async function getTweetId(txnId) {
  try {
    const tx = await zilliqa.blockchain.getTransaction(txnId);
    console.log(tx);
    const { event_logs: eventLogs } = tx.receipt;

    if (!eventLogs) {
      throw new Error("No event logs for new_tweet");
    }

    const eventLog = eventLogs.find(e => e._eventname === "new_tweet");
    const tweetIdParam = eventLog.params.find(p => p.vname === "tweet_id");
    const tweetId = tweetIdParam.value;
    const senderParam = eventLog.params.find(p => p.vname === "sender");
    const sender = senderParam.value;
    return { tweetId, sender };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function getHashtag() {
  try {
    const init = await zilliqa.blockchain.getSmartContractInit(contractAddress);
    const initParam = init.result.find(
      initParam => initParam.vname === "hashtag"
    );
    const hashtagVal = initParam.value;
    return hashtagVal;
  } catch (e) {
    console.error(e);
  }
}

async function depositToContract(contract) {
  try {
    const tx = await contract.call("deposit", [], {
      version: VERSION,
      amount: new BN(units.toQa("50", units.Units.Zil)),
      gasPrice: new BN("5000000000"),
      gasLimit: Long.fromNumber(1000)
    });
    console.log(tx, tx.receipt);
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  // const hashtag = await getHashtag();
  // console.log(hashtag);
  // const contract = await deployTestContract();
  // await depositToContract(contract);
  // await registerUser(contract, oracleAddress, "kenchangh");
  // await fundAccount(contractAddress);
  // const tx = await verifyTweet(
  //   "0x2a89b69ec1d4f23e7c2109f117adcd4f415a1a0a",
  //   "1098114537063014401",
  //   "hey yolo #BuildonZIL",
  //   9,
  //   21
  // );
}
main();

module.exports = {
  fundAccount,
  registerUser,
  getTweetId,
  getHashtag,
  verifyTweet,
  depositToContract,
  deployTestContract
};
