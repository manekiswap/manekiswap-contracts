import { ethers, upgrades } from "hardhat"
import { ManekiToken, VestingVault } from "../src/typechain"
import { increase, duration } from "./util"

import { expect, use } from "chai"
import { BN, expectEvent, expectRevert, constants } from "@openzeppelin/test-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe.only("Test vesting by maneki token", async function () {
  let mnkToken: ManekiToken
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let vestingContract: VestingVault
  let cap = ethers.utils.parseUnits("100000000")
  let initSupply = ethers.utils.parseUnits("15000000")

  beforeEach(async function () {
    ;[owner, alice, bob] = await ethers.getSigners()

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

    await mnkToken.mint(owner.address, initSupply)
  })

  it("should NOT allow to grant token from vesting vault", async function () {
    expectRevert(vestingContract.addTokenGrant(alice.address, initSupply, 10, 10), "ERC20: transfer amount exceeds allowance")
  })

  it("should allow to GRANT token from vesting vault", async function () {
    await mnkToken.approve(vestingContract.address, initSupply)
    await vestingContract.addTokenGrant(alice.address, initSupply.div(2), 10, 10)
    let grantForAlice = await vestingContract.getGrantAmount(alice.address)

    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("7500000.0")

    let grantForBob = await vestingContract.getGrantAmount(bob.address)
    expect(ethers.utils.formatUnits(grantForBob)).to.equal("0.0")
  })

  it("should allow to REVOKE granted", async function () {
    await mnkToken.approve(vestingContract.address, initSupply)
    await vestingContract.addTokenGrant(alice.address, initSupply.div(2), 10, 10)
    let grantForAlice = await vestingContract.getGrantAmount(alice.address)

    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("7500000.0")

    await vestingContract.revokeTokenGrant(alice.address)
    grantForAlice = await vestingContract.getGrantAmount(alice.address)
    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("0.0")
  })

  it("should allow to claims granted", async function () {
    await mnkToken.approve(vestingContract.address, initSupply)
    await vestingContract.addTokenGrant(alice.address, initSupply.div(2), 10, 10)
    let grantForAlice = await vestingContract.getGrantAmount(alice.address)

    let granted = "7500000.0"
    expect(ethers.utils.formatUnits(grantForAlice)).to.equal(granted)

    await increase(duration.days(4))

    vestingContract = vestingContract.connect(alice)
    expectRevert(vestingContract.claimVestedTokens(), "Vested is 0")

    let beforeVested = await mnkToken.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(beforeVested)).to.equal("0.0")

    await increase(duration.days(6))

    await vestingContract.claimVestedTokens()
    let afterVested = await mnkToken.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(afterVested)).to.equal("750000.0")

    await increase(duration.days(10))

    await vestingContract.claimVestedTokens()
    afterVested = await mnkToken.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(afterVested)).to.equal("7500000.0")
  })
})
