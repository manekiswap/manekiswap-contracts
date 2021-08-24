import { utils } from "ethers"
import { ethers } from "hardhat"

import { IUniswapV2Factory, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from "../src/typechain"

//Wrapped Ether: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
async function main() {
  const signers = await ethers.getSigners()
  const owner = signers[0]

  const V2FACTORY = await ethers.getContractFactory("UniswapV2Factory")
  const uniFac = (await V2FACTORY.deploy(owner.address)) as unknown as UniswapV2Factory
  await uniFac.deployed()
  console.log("UNISWAPV2 FACTORY ADDRESS:", uniFac.address)

  console.log("PAIR code hash", (await uniFac.pairCodeHash()).toString())
  const pair = await (await ethers.getContractFactory("UniswapV2Pair")).deploy()
  await pair.deployed()

  console.log("PAIR ADDRESS:", uniFac.address)

  const WETH9Mock = await ethers.getContractFactory("WETH9Mock")
  const weth = await WETH9Mock.deploy()
  await weth.deployed()
  console.log("WETH9Mock ADDRESS:", weth.address)

  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
  const router = (await UniswapV2Router02.deploy(uniFac.address, weth.address)) as unknown as UniswapV2Router02
  await router.deployed()

  console.log("UniswapV2Router02 ADDRESS:", router.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
