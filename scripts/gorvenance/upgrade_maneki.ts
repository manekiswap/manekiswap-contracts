import { ethers, upgrades } from "hardhat"

async function main() {
  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")

  const contractAddr = process.env.OLD_MANEKI_ADDRESS
  const upgradedContract = await upgrades.upgradeProxy(contractAddr, factory)

  console.log("Proxy address: ", upgradedContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
