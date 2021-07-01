import { ethers } from "hardhat"

async function main() {
  const factory = await ethers.getContractFactory("UniswapV2Pair")
  console.log("Deploying UniswapV2Pair...")
  const pair = await factory.deploy()
  await pair.deployed()

  console.log("Pair address: ", pair.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
