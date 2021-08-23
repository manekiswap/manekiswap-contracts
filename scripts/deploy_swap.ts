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

  //   console.log("CREATE PAIR =============================")

  //   const fac1 = await ethers.getContractFactory("MyERC20")
  //   const token1 = (await fac1.deploy("TOKEN1", "TK1")) as MyERC20
  //   const token2 = (await fac1.deploy("TOKEN2", "TK2")) as MyERC20

  //   await token1.deployed()
  //   await token2.deployed()

  //   console.log("TOKEN 1: ", token1.address)
  //   console.log("TOKEN 2: ", token2.address)

  //   const user1 = signers[1]

  //   const tenK = utils.parseUnits("10000")
  //   const twentyK = tenK.mul(2)

  //   // Mint to account
  //   await token1.mint(owner.address, twentyK) // 20000
  //   await token2.mint(owner.address, twentyK) // 20000
  //   await token1.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000
  //   await token2.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000

  //   console.log("Balance token 1 of owner: ", utils.formatUnits(await token1.balanceOf(owner.address)))
  //   console.log("Balance token 2 of: ", utils.formatUnits(await token2.balanceOf(owner.address)))
  //   console.log("Balance token 1 of user1 : ", utils.formatUnits(await token1.balanceOf(user1.address)))
  //   console.log("Balance token 2 of user 2: ", utils.formatUnits(await token2.balanceOf(user1.address)))

  //   //   const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")

  //   //   const uniPairFac = await ethers.getContractFactory("UniswapV2Factory")
  //   //   const uniFactory = uniPairFac.attach(FAC_ADDRESS) as unknown as IUniswapV2Factory

  //   const tx = await uniFac.createPair(token1.address, token2.address)
  //   console.log("******* ", tx)
  //   const uniPairAddress = await uniFac.getPair(token1.address, token2.address)
  //   const pairFAC = await ethers.getContractFactory("UniswapV2Pair")
  //   const uniPair = pairFAC.attach(uniPairAddress) as IUniswapV2Factory

  //   console.log("UNI PAIR ADDRESS IS: ", uniPair.address)

  //   const [a, b, c] = await uniPair.getReserves()

  //   console.log("Reserver before  AddLiquidity: ", utils.formatUnits(a), " ", utils.formatUnits(b), " ", utils.formatUnits(c))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
