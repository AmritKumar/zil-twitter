const { deployTestContract, depositToContract } = require("./zilliqa");

async function main() {
  const contract = await deployTestContract();
  await depositToContract(contract);
}
main();
