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
    value: "#BuiltWithZil"
  }
];

async function deployTestContract() {
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
      toAddr: address,
      amount: new BN(units.toQa("300", units.Units.Zil)),
      gasPrice: myGasPrice,
      gasLimit: Long.fromNumber(1)
    })
  );
  return tx.receipt;
}

async function registerUser(address) {
  const tx = await zilliqa.blockchain.createTransaction(
    zilliqa.transactions.new({})
  );
}

async function getBalance() {
  const balance = await zilliqa.blockchain.getBalance(ownerAddress);
  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
  console.log(balance, minGasPrice);
  return balance;
}

async function main() {
  // await deployTestContract();
  await fundAccount(oracleAddress);
}
main();

module.exports = { fundAccount };
