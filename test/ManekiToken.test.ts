import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { constants, expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"

import { ManekiToken } from "../src/typechain"

describe("Test maneki token", async function () {
  let token: ManekiToken
  let burner: SignerWithAddress

  const value = ethers.utils.parseEther("10")

  before(async function () {
    const signers = await ethers.getSigners()
    burner = signers[1]
  })

  beforeEach(async function () {
    const factory = await ethers.getContractFactory("ManekiToken")
    const maxSupply = ethers.utils.parseEther("300000000")
    token = (await upgrades.deployProxy(factory, [maxSupply], { initializer: "initialize(uint256 cap_)" })) as ManekiToken
    await token.deployed()
  })

  it("can not override signer address", async function () {
    await expectRevert(token.transfer(constants.ZERO_ADDRESS, value, { from: burner.address }), "Contract with a Signer cannot override")
  })

  it("can not send to zero address", async function () {
    await expectRevert(token.transfer(constants.ZERO_ADDRESS, value), "ERC20: transfer to the zero address")
  })

  it("can not mint more than cap", async function () {
    const mintValue = ethers.utils.parseEther("310000000")
    await expectRevert(token.mint(burner.address, mintValue), "ERC20Capped: cap exceeded")
  })

  it("miner to burner 100 token", async function () {
    const mintValue = ethers.utils.parseEther("100")
    await token.mint(burner.address, mintValue)
    const burnerBalance = await token.balanceOf(burner.address)
    expect(burnerBalance.eq(mintValue), "Equal mint value").true
  })

  it("burner can burn 90 token", async function () {
    const mintValue = ethers.utils.parseEther("100")
    await token.mint(burner.address, mintValue)

    const burnerContract = token.connect(burner)
    await burnerContract.burn(ethers.utils.parseEther("90"))

    const burnerBalance = await token.balanceOf(burner.address)
    expect(burnerBalance.eq(ethers.utils.parseEther("10")), "Equal mint value").true
  })
})
