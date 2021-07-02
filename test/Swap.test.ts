import { expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { utils } from "ethers"
import { ethers } from "hardhat"

import { MyERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from "../src/typechain"

describe.only("Test forking of uniswapV2", async function () {
  const overrides = {
    gasLimit: 9999999,
  }
  it("UniswapV2 swap token for token", async function () {
    const [owner, user1] = await ethers.getSigners()
    const UNIFac = await ethers.getContractFactory("UniswapV2Factory")
    const uniFac = (await UNIFac.deploy(owner.address)) as UniswapV2Factory
    await uniFac.deployed()

    const v = utils.parseUnits("10000")
    const vv = v.mul(2)
    console.log("PAIR code hash", (await uniFac.pairCodeHash()).toString())
    // Deploy token
    const fac1 = await ethers.getContractFactory("MyERC20")
    const token1 = (await fac1.deploy("TOKEN1", "TK1")) as MyERC20
    const token2 = (await fac1.deploy("TOKEN2", "TK2")) as MyERC20

    const WETH9Mock = await ethers.getContractFactory("WETH9Mock")
    const weth = (await WETH9Mock.deploy()) as MyERC20
    await weth.deployed()

    // Mint to account
    await token1.mint(owner.address, vv) // 20000
    await token2.mint(owner.address, vv) // 20000
    await token1.mint(user1.address, v.div(10)) // 10000 / 10 = 1000
    await token2.mint(user1.address, v.div(10)) // 10000 / 10 = 1000

    const WET_address = weth.address
    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
    const router = (await UniswapV2Router02.deploy(uniFac.address, WET_address)) as UniswapV2Router02
    await router.deployed()

    console.log("ADD liquidity to ", owner.address)
    await token1.approve(router.address, ethers.constants.MaxUint256)
    await token2.approve(router.address, ethers.constants.MaxUint256)

    const uniPairFac = await ethers.getContractFactory("UniswapV2Pair")
    await uniFac.createPair(token1.address, token2.address)
    const uniPairAddr = await uniFac.getPair(token1.address, token2.address)
    const uniPair = uniPairFac.attach(uniPairAddr) as UniswapV2Pair
    const [a, b, c] = await uniPair.getReserves()

    console.log("Reserver before  AddLiquidity: ", utils.formatUnits(a), " ", utils.formatUnits(b), " ", utils.formatUnits(c))

    console.log("************AddLiquidity*****************")
    await router
      .connect(owner)
      .addLiquidity(token1.address, token2.address, vv, vv.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)

    console.log("********************************************")
    const [_a, _b, _c] = await uniPair.getReserves()

    console.log("Reserver after AddLiquidity: ", utils.formatUnits(_a), " ", utils.formatUnits(_b), " ", _c)

    let token1Balance = await token1.balanceOf(user1.address)
    const token2Balance = await token2.balanceOf(user1.address)

    console.log("Before swap: Amount of user1- token 1: ", utils.formatUnits(token1Balance))
    console.log("Before swap: Amount of user1- token 2: ", utils.formatUnits(token2Balance))

    // TK1 -> TK2
    await router.swapExactTokensForTokens(
      utils.parseUnits("200"),
      utils.parseUnits("200"),
      [token2.address, token1.address],
      user1.address,
      ethers.constants.MaxUint256,
      overrides,
    )

    token1Balance = await token1.balanceOf(user1.address)
    console.log("After swap: Amount of user1- token 1: ", utils.formatUnits(token1Balance))
    console.log("After swap: Amount of user1- token 2: ", utils.formatUnits(token2Balance))
  })
})
