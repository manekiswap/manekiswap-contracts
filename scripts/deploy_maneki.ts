
import { ethers, upgrades } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("ManekiToken");
  console.log("Deploying proxy...");
  let cap = ethers.utils.parseEther('30000000')
  let contract = await upgrades.deployProxy(factory, [cap], { initializer: 'initialize(uint256 cap_)' })
  console.log("Proxy address: ", contract.address);

  await contract.deployed();
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });