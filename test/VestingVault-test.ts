import { ContractFactory } from "@ethersproject/contracts"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { ethers, upgrades } from "hardhat"

import { ManekiToken, VestingVault } from "../src/typechain"
import { duration, increase } from "./util"

describe("Test vesting by maneki token", async function () {
  let maneki: ManekiToken
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let vault: VestingVault
  let mnkFactory: ContractFactory
  let vestingFactory: ContractFactory
  const cap = ethers.utils.parseUnits("100000000") // 100M
  const initSupply = ethers.utils.parseUnits("15000000") // 15M

  const granted = "1000000.0"
  const durationInDays = 10
  const cliff = 2

  before(async function () {
    ;[owner, alice, bob] = await ethers.getSigners()
    mnkFactory = await ethers.getContractFactory("ManekiToken")
    vestingFactory = await ethers.getContractFactory("VestingVault")
  })

  beforeEach(async function () {
    maneki = (await upgrades.deployProxy(mnkFactory, [cap], {
      initializer: "initialize(uint256 cap_)",
    })) as ManekiToken
    await maneki.deployed()

    vault = (await upgrades.deployProxy(vestingFactory, [maneki.address], {
      initializer: "initialize(address)",
    })) as VestingVault

    await vault.deployed()

    await maneki.mint(owner.address, initSupply)
  })

  it("should NOT allow to GRANT token from vesting vault if not approved", async function () {
    await expectRevert(vault.addTokenGrant(alice.address, initSupply, 10, 10), "ERC20: transfer amount exceeds allowance")
  })

  it("should allow to GRANT token from vesting vault if approved", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrant(alice.address, initSupply.div(2), 10, 10)
    const grantForAlice = await vault.getGrantAmount(alice.address)

    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("7500000.0")

    const grantForBob = await vault.getGrantAmount(bob.address)
    expect(ethers.utils.formatUnits(grantForBob)).to.equal("0.0")
  })

  it("should allow to REVOKE granted", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrant(alice.address, initSupply.div(2), 10, 10)
    let grantForAlice = await vault.getGrantAmount(alice.address)

    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("7500000.0")

    await vault.revokeTokenGrant(alice.address)
    grantForAlice = await vault.getGrantAmount(alice.address)
    expect(ethers.utils.formatUnits(grantForAlice)).to.equal("0.0")
  })

  it("should allow to CLAIM granted when vest ALL", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrant(alice.address, ethers.utils.parseUnits(granted), durationInDays, cliff)

    const grantForAlice = await vault.getGrantAmount(alice.address)
    expect(ethers.utils.formatUnits(grantForAlice)).to.equal(granted, "should be equal granted value")

    await increase(duration.days(durationInDays))

    const beforeClaim = await maneki.balanceOf(alice.address)
    expect("0.0").to.equal(ethers.utils.formatUnits(beforeClaim), "should be zero")

    await vault.claimVestedTokens(alice.address)
    const afterClaim = await maneki.balanceOf(alice.address)
    expect(granted).to.equal(ethers.utils.formatUnits(afterClaim), "should be all the granted")
  })

  it("should allow to CLAIM during the vesting", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrant(alice.address, ethers.utils.parseUnits(granted), durationInDays, cliff)
    const grantForAlice = await vault.getGrantAmount(alice.address)

    expect(ethers.utils.formatUnits(grantForAlice)).to.equal(granted, "should be equal granted value")

    await increase(duration.days(1))
    await expectRevert(vault.claimVestedTokens(alice.address), "amountVested is 0")

    await increase(duration.days(1))
    await vault.claimVestedTokens(alice.address)

    const balance = await maneki.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(balance)).to.equal("200000.0", "Should vest 20%")
  })

  it("should allow to GRANT with start time", async function () {
    await maneki.approve(vault.address, initSupply)
    const startTime = Date.parse("2020-12-19T00:00:00.000Z").valueOf() / 1000 // in seconds

    await vault.addTokenGrantWithStartTime(startTime, alice.address, ethers.utils.parseUnits(granted), 180, 180)

    const grantForAlice = ethers.utils.formatUnits(await vault.getGrantAmount(alice.address))
    expect(grantForAlice).to.equal(granted, "should be equal granted value")

    const startTimeAlice = await vault.getGrantStartTime(alice.address)
    expect(startTimeAlice.toNumber()).to.equal(startTime, "should be equal start time")

    await vault.claimVestedTokens(alice.address)
    const balance = await maneki.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(balance)).to.equal(grantForAlice, "Should vest 100%")
  })

  it("should allow to GRANT with end time", async function () {
    await maneki.approve(vault.address, initSupply)
    const endTime = Date.parse("2021-06-18T00:00:00.000Z").valueOf() / 1000 // in seconds 1623974400

    await vault.addTokenGrantWithEndTime(endTime, alice.address, ethers.utils.parseUnits(granted), 180, 180)

    const grantForAlice = ethers.utils.formatUnits(await vault.getGrantAmount(alice.address))
    expect(grantForAlice).to.equal(granted, "should be equal granted value")

    const startTimeAlice = await vault.getGrantStartTime(alice.address)
    const expectStartTime = 1608422400
    expect(startTimeAlice.toNumber()).to.equal(expectStartTime, "should be equal start time") /// 1623974400 - (180 * 24 * 3600) => 1608422400

    await vault.claimVestedTokens(alice.address)
    const balance = await maneki.balanceOf(alice.address)
    expect(ethers.utils.formatUnits(balance)).to.equal(grantForAlice, "Should vest 100%")
  })
})
