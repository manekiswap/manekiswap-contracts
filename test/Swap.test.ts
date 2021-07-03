import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { utils } from "ethers"
import { ethers } from "hardhat"

import { MyERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from "../src/typechain"

describe("Test forking of uniswapV2", async function () {
  const overrides = {
    gasLimit: 9999999,
  }
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let router: UniswapV2Router02
  let token1: MyERC20
  let token2: MyERC20
  let uniPair: UniswapV2Pair
  const tenK = utils.parseUnits("10000")
  const twentyK = tenK.mul(2)
  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0]
    user1 = signers[1]
  })

  beforeEach(async function () {
    const UNIFac = await ethers.getContractFactory("UniswapV2Factory")
    const uniFac = (await UNIFac.deploy(owner.address)) as UniswapV2Factory
    await uniFac.deployed()

    console.log("PAIR code hash", (await uniFac.pairCodeHash()).toString())
    // Deploy token
    const fac1 = await ethers.getContractFactory("MyERC20")
    token1 = (await fac1.deploy("TOKEN1", "TK1")) as MyERC20
    token2 = (await fac1.deploy("TOKEN2", "TK2")) as MyERC20

    const WETH9Mock = await ethers.getContractFactory("WETH9Mock")
    const weth = (await WETH9Mock.deploy()) as MyERC20
    await weth.deployed()

    // Mint to account
    await token1.mint(owner.address, twentyK) // 20000
    await token2.mint(owner.address, twentyK) // 20000
    await token1.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000
    await token2.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000

    const WET_address = weth.address
    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
    router = (await UniswapV2Router02.deploy(uniFac.address, WET_address)) as UniswapV2Router02
    await router.deployed()

    await token1.approve(router.address, ethers.constants.MaxUint256)
    await token2.approve(router.address, ethers.constants.MaxUint256)

    const uniPairFac = await ethers.getContractFactory("UniswapV2Pair")
    await uniFac.createPair(token1.address, token2.address)
    const uniPairAddr = await uniFac.getPair(token1.address, token2.address)
    uniPair = uniPairFac.attach(uniPairAddr) as UniswapV2Pair
    const [a, b, c] = await uniPair.getReserves()

    console.log("Reserver before  AddLiquidity: ", utils.formatUnits(a), " ", utils.formatUnits(b), " ", utils.formatUnits(c))

    console.log("************AddLiquidity*****************")
  })

  it("UniswapV2 swap addLiquidity", async function () {
    await router
      .connect(owner)
      .addLiquidity(token1.address, token2.address, twentyK, twentyK.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)
    console.log("2 TK1 = 1 TK2")

    console.log("********************************************")
    const [_a, _b] = await uniPair.getReserves()
    expect(utils.formatUnits(_b)).to.equal("20000.0", "Should be equal to vv ")
    expect(utils.formatUnits(_a)).to.equal("10000.0", "Should be equal to vv /2")
  })

  it("UniswapV2 swap swapExactTokensForTokens success", async function () {
    await router
      .connect(owner)
      .addLiquidity(token1.address, token2.address, twentyK, twentyK.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)
    console.log("2 TK1 = 1 TK2")

    let token1Balance = await token1.balanceOf(user1.address)
    let token2Balance = await token2.balanceOf(user1.address)

    console.log("Before swap: Amount of user1- token 1: ", utils.formatUnits(token1Balance))
    console.log("Before swap: Amount of user1- token 2: ", utils.formatUnits(token2Balance))

    // TK1 -> TK2
    await router.swapExactTokensForTokens(
      utils.parseUnits("100"),
      utils.parseUnits("195"),
      [token2.address, token1.address],
      user1.address,
      ethers.constants.MaxUint256,
      overrides,
    )

    token1Balance = await token1.balanceOf(user1.address)
    token2Balance = await token2.balanceOf(user1.address)

    console.log("After swap: Amount of user1- token 1: ", utils.formatUnits(token1Balance))
    console.log("After swap: Amount of user1- token 2: ", utils.formatUnits(token2Balance))
  })

  it("UniswapV2 swap swapExactTokensForTokens Revert", async function () {
    await router
      .connect(owner)
      .addLiquidity(token1.address, token2.address, twentyK, twentyK.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)
    console.log("2 TK1 = 1 TK2")

    await expectRevert(
      router.swapExactTokensForTokens(
        utils.parseUnits("100"),
        utils.parseUnits("200"),
        [token2.address, token1.address],
        user1.address,
        ethers.constants.MaxUint256,
        overrides,
      ),
      "INSUFFICIENT_OUTPUT_AMOUNT",
    )
  })

  it.only("Test amount in out", async function () {
    await router
      .connect(owner)
      .addLiquidity(token1.address, token2.address, twentyK, twentyK.div(2), 0, 0, owner.address, ethers.constants.MaxUint256, overrides)

    const amountTk = await uniPair.balanceOf(owner.address)
    console.log("Amount token is: ", utils.formatUnits(amountTk))
    const amountOut = utils.parseUnits("100")
    const amountIn = await router.getAmountIn(amountOut, tenK, tenK.sub(amountOut))

    console.log("Amount in: ", utils.formatUnits(amountIn))
  })
})
