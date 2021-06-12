import { ethers, upgrades } from "hardhat"

async function main() {
  const factory = await ethers.getContractFactory("ManekiToken")
  console.log("Deploying proxy...")

  let contractAddr = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  let update = await upgrades.upgradeProxy(contractAddr, factory)

  console.log("Proxy address: ", update)
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
