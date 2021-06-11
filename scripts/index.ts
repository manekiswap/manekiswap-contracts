// scripts/index.js
import { use } from "chai";
import { ethers } from "hardhat"
import { ManekiToken } from "../src/typechain";

async function main() {
  // Set up an ethers contract, representing our deployed Box instance
  let contractAddr = "0x0165878a594ca255338adfa4d48449f69242eb8f"
  let factory = await ethers.getContractFactory("ManekiToken");
  let contract = factory.attach(contractAddr) as ManekiToken;

  let [owner, user] = await ethers.getSigners()
  contract = contract.connect(owner);
  contract.mint(user.address, 1000, { from: owner.address });

  contract = contract.connect(user)
  let balance = await contract.balanceOf(user.address);
  console.log("Balance i: ", balance.toNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
