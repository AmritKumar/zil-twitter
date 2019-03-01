const { Zilliqa } = require("@zilliqa-js/zilliqa");
const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");

// Initialize a contract instance
const contract = zilliqa.contracts.at(contractAddress);
