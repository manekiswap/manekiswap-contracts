import { ethers } from "hardhat"

import { UniswapV2Factory, UniswapV2Router02 } from "../src/typechain"

const WMATIC = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"

async function main() {
  const signers = await ethers.getSigners()
  const owner = signers[0]

  const V2FACTORY = await ethers.getContractFactory("UniswapV2Factory")

  const uniFac = (await V2FACTORY.deploy(owner.address)) as unknown as UniswapV2Factory
  await uniFac.deployed()
  console.log("UNISWAPV2 FACTORY ADDRESS:", uniFac.address)

  const pair = await (await ethers.getContractFactory("UniswapV2Pair")).deploy()
  await pair.deployed()

  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
  const router = (await UniswapV2Router02.deploy(uniFac.address, WMATIC)) as unknown as UniswapV2Router02
  await router.deployed()

  console.log("UniswapV2Router02 ADDRESS:", router.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
