import { ethers } from "hardhat"

import { MyERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from "../../src/typechain"
const overrides = {
  gasLimit: 9999999,
}

async function test() {
  const [owner, user1, user2] = await ethers.getSigners()
  const UNIFac = await ethers.getContractFactory("UniswapV2Factory")
  const uniFac = (await UNIFac.deploy(owner.address)) as UniswapV2Factory
  await uniFac.deployed()
}

async function main() {
  await swap()
}

async function swap() {
  const [owner, user1, user2] = await ethers.getSigners()
  const UNIFac = await ethers.getContractFactory("UniswapV2Factory")
  const uniFac = (await UNIFac.deploy(owner.address)) as UniswapV2Factory
  await uniFac.deployed()

  const v = ethers.utils.parseUnits("10000")
  const vv = v.mul(2)
  console.log("PAIR code hash", (await uniFac.pairCodeHash()).toString())
  // Deploy token
  const fac1 = await ethers.getContractFactory("MyERC20")
  const token1 = (await fac1.deploy("TOKEN1", "TK1")) as MyERC20
  const token2 = (await fac1.deploy("TOKEN2", "TK2")) as MyERC20

  const WETH9Mock = await ethers.getContractFactory("WETH9Mock")
  const weth = (await WETH9Mock.deploy()) as MyERC20
  await weth.deployed()
  //   console.log("Token 1 address is: ", token1.address)
  //   console.log("Token 2 address is: ", token2.address)
  //   console.log("Weth address is: ", weth.address)
  //   console.log("uniFac address is: ", uniFac.address)

  // Mint to account
  await token1.mint(owner.address, vv) // 100
  await token2.mint(owner.address, vv) // 100
  await token1.mint(user1.address, v.div(10)) // 10000 / 10 = 1000
  await token2.mint(user2.address, v.div(20)) // 10000 / 20 = 500

  const WET_address = weth.address
  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
  const router = (await UniswapV2Router02.deploy(uniFac.address, WET_address)) as UniswapV2Router02
  await router.deployed()

  console.log("ADD liquidity to ", owner.address)

  await token1.approve(router.address, ethers.constants.MaxUint256)
  await token2.approve(router.address, ethers.constants.MaxUint256)

  await router
    .connect(owner)
    .addLiquidity(token1.address, token2.address, vv, vv.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)

  console.log("********************************************")

  const uniPairFac = await ethers.getContractFactory("UniswapV2Pair")

  const uniPairAddr = await uniFac.getPair(token1.address, token2.address)
  console.log("++++++++++++++ ", uniPairAddr)
  const uniPair = uniPairFac.attach(uniPairAddr) as UniswapV2Pair
  console.log("getAmountIn")
  const [_a, _b, _c] = await uniPair.getReserves()
  console.log("Reserver after: ", _a.toString(), " ", _b.toString(), " ", _c.toString())

  console.log("Before swap: ")
  console.log("Amount of token 1: ", (await token1.balanceOf(user1.address)).toString())
  //   console.log("Amount of token 2: ", (await token2.balanceOf(user2.address)).toString())

  await token1.connect(user1).approve(router.address, vv)
  await token2.connect(user2).approve(router.address, vv.div(2))

  // TK1 -> TK2
  await router.swapExactTokensForTokens(
    ethers.utils.parseUnits("200"),
    ethers.utils.parseUnits("200"),
    [token2.address, token1.address],
    user1.address,
    ethers.constants.MaxUint256,
    overrides,
  )

  console.log("After swap: ")
  console.log("Amount of user1- token 1: ", (await token1.balanceOf(user1.address)).toString())
  console.log("Amount of user1- token 2: ", (await token2.balanceOf(user1.address)).toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
