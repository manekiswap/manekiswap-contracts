import { ethers, upgrades } from "hardhat"

async function main() {
  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")
  let cap = ethers.utils.parseUnits("100000000")
  let contract = await upgrades.deployProxy(factory, [cap], { initializer: "initialize(uint256)" })

  await contract.deployed()
  console.log("Proxy maneki address: ", contract.address)

  let vestingFactory = await ethers.getContractFactory("VestingVault")
  let vestingContract = await upgrades.deployProxy(vestingFactory, [contract.address], {
    initializer: "initialize(address)",
  })
  await vestingContract.deployed()

  console.log("Proxy vesting address: ", vestingContract.address)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
