import { ethers, upgrades } from "hardhat"
import { ManekiToken, VestingVaultUnsafe } from "../src/typechain"
import { increase, duration } from "./util"

import { expect, use } from "chai"
import { BN, expectEvent, expectRevert, constants } from "@openzeppelin/test-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ContractFactory } from "@ethersproject/contracts"

describe("Test vesting unsafe", async function () {
  let maneki: ManekiToken
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let vault: VestingVaultUnsafe
  let cap = ethers.utils.parseUnits("100000000") // 100M
  let initSupply = ethers.utils.parseUnits("15000000") // 15M

  let granted = "1000000.0"
  let durationInDays = 10
  let cliff = 2
  let mnkFactory: ContractFactory
  let vestingFactory: ContractFactory
  before(async function () {
    ;[owner, alice, bob] = await ethers.getSigners()
    mnkFactory = await ethers.getContractFactory("ManekiToken")
    vestingFactory = await ethers.getContractFactory("VestingVaultUnsafe")
  })

  beforeEach(async function () {
    maneki = (await upgrades.deployProxy(mnkFactory, [cap], {
      initializer: "initialize(uint256 cap_)",
    })) as ManekiToken
    await maneki.deployed()

    vault = (await upgrades.deployProxy(vestingFactory, [maneki.address], {
      initializer: "initialize(address)",
    })) as VestingVaultUnsafe

    await vault.deployed()

    await maneki.mint(owner.address, initSupply)
  })

  it("should allow to granted more than supply of maneki token using unsafe grant", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrantUnsafe(alice.address, initSupply.mul(2), durationInDays, cliff)
    let grantForAlice = await vault.getGrantAmount(alice.address)

    expect("30000000.0").to.equal(ethers.utils.formatUnits(grantForAlice), "should be double init value")

    await increase(duration.days(durationInDays))
    await expectRevert(vault.claimVestedTokens(alice.address), "ERC20: transfer amount exceeds balance")

    await maneki.mint(owner.address, initSupply)
    await maneki.approve(vault.address, initSupply.mul(2))

    let tx = await vault.claimVestedTokensUnsafe(alice.address)
  })

  it("should NOT allow to granted more than supply of maneki token using unsafe ", async function () {
    await maneki.approve(vault.address, initSupply)
    await vault.addTokenGrantUnsafe(alice.address, initSupply, durationInDays, cliff)
    await vault.addTokenGrantUnsafe(bob.address, initSupply, durationInDays, cliff)

    await increase(duration.days(durationInDays))

    let tx = await vault.claimVestedTokensUnsafe(alice.address)
    await expectRevert(vault.claimVestedTokensUnsafe(bob.address), "ERC20: transfer amount exceeds balance")
  })
})
