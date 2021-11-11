import { ethers, upgrades } from "hardhat"

import { ManekiToken, VestingVault } from "../../src/typechain"

async function main() {
  const multisig_address = process.env.MULTISIG_ADDRESS || ""

  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")

  const maxSupply = ethers.utils.parseUnits("300000000") // 300M
  const manekiContract = (await upgrades.deployProxy(factory, [maxSupply, multisig_address], {
    initializer: "initialize(uint256, address)",
  })) as ManekiToken

  await manekiContract.deployed()
  console.log("Proxy maneki address: ", manekiContract.address)

  const vestingFactory = await ethers.getContractFactory("VestingVault")
  const vestingContract = (await upgrades.deployProxy(vestingFactory, [manekiContract.address], {
    initializer: "initialize(address)",
  })) as VestingVault

  await vestingContract.deployed()
  console.log("Proxy vesting address: ", vestingContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
