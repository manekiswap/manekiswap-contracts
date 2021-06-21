import { ethers, upgrades } from "hardhat"

async function main() {
  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")
  const cap = ethers.utils.parseUnits("100000000")
  const contract = await upgrades.deployProxy(factory, [cap], { initializer: "initialize(uint256)" })

  await contract.deployed()
  console.log("Proxy maneki address: ", contract.address)

  const vestingFactory = await ethers.getContractFactory("VestingVault")
  const vestingContract = await upgrades.deployProxy(vestingFactory, [contract.address], {
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
