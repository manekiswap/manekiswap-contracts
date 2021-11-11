import { ethers } from "hardhat"

import { ManekiToken } from "../../src/typechain"

async function main() {
  const signers = await ethers.getSigners()
  const owner = signers[0]
  const multisig_address = process.env.MULTISIG_ADDRESS || ""
  console.log("Multisig address:  ", multisig_address)

  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")

  const maxSupply = ethers.utils.parseUnits("300000000") // 300M
  const manekiContract = (await factory.deploy(maxSupply)) as ManekiToken

  await manekiContract.deployed()
  console.log("Proxy maneki address: ", manekiContract.address)

  const defaultAdminROLE = await manekiContract.DEFAULT_ADMIN_ROLE()
  const minterROLE = await manekiContract.MINTER_ROLE()
  const pauseROLE = await manekiContract.PAUSER_ROLE()

  console.log("Granting roles to multisigAddress")
  await manekiContract.grantRole(defaultAdminROLE, multisig_address)
  await manekiContract.grantRole(minterROLE, multisig_address)
  await manekiContract.grantRole(pauseROLE, multisig_address)

  console.log("Revoking roles from deployer")
  await manekiContract.revokeRole(pauseROLE, owner.address)
  await manekiContract.revokeRole(minterROLE, owner.address)
  await manekiContract.revokeRole(defaultAdminROLE, owner.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
