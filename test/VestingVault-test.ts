import { ethers, upgrades } from "hardhat"
import { ManekiToken, VestingVault } from "../src/typechain"

import { expect, use } from "chai"
import { BN, expectEvent, expectRevert, constants } from "@openzeppelin/test-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { accounts, contract } from "@openzeppelin/test-environment"

describe("Test vesting by maneki token", async function () {
  let mnkToken: ManekiToken
  let owner: SignerWithAddress
  let admin: SignerWithAddress
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let value = ethers.utils.parseEther("12")
  let vestingContract: VestingVault
  let cap = ethers.utils.parseEther("30000002")
  let allow = ethers.utils.parseEther("1002")

  beforeEach(async function () {
    ;[owner, admin, alice, bob] = await ethers.getSigners()

    let mnkFactory = await ethers.getContractFactory("ManekiToken")
    mnkToken = (await upgrades.deployProxy(mnkFactory, [cap], {
      initializer: "initialize(uint256 cap_)",
    })) as ManekiToken
    await mnkToken.deployed()

    let vestingFactory = await ethers.getContractFactory("VestingVault")
    vestingContract = (await upgrades.deployProxy(vestingFactory, [mnkToken.address], {
      initializer: "initialize(address)",
    })) as VestingVault

    await vestingContract.deployed()

    await mnkToken.mint(owner.address, allow)

    console.log("Allowance before: ", (await mnkToken.allowance(owner.address, vestingContract.address)).toString())
    // await mnkToken.approve(vestingContract.address, allow)
    // console.log("Allowance after: ", (await mnkToken.allowance(owner.address, vestingContract.address)).toString())

    await mnkToken.increaseAllowance(vestingContract.address, allow)
    console.log("Allowance after increase allow: ", (await mnkToken.allowance(owner.address, vestingContract.address)).toString())
  })
  //

  let grant = ethers.utils.parseEther("10")
  it("should emit event on grant", async function () {
    await vestingContract.addTokenGrant(alice.address, allow, 10, 10)
    let grantAllow = await vestingContract.getGrantAmount(alice.address)
    console.log("Graned: ", grantAllow.toString())
  })
})
