import { ContractFactory } from "@ethersproject/contracts"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { assert } from "console"
import { ethers, upgrades } from "hardhat"

import { ManekiToken, VestingVault } from "../src/typechain"
import { duration, increase } from "./util"

describe.only("Test access control", async function () {
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
    this.signers = await ethers.getSigners()
    owner = this.signers[0]
    alice = this.signers[1]
    bob = this.signers[2]

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

  it("owner should be default admin role", async function () {
    const minerROLE = await maneki.MINTER_ROLE()
    const defaultAdminROLE = await maneki.DEFAULT_ADMIN_ROLE()
    const pauseROLE = await maneki.PAUSER_ROLE()

    const isOwnerHasMinnerRole = await maneki.hasRole(minerROLE, owner.address)
    expect(isOwnerHasMinnerRole).true

    const isDefaultAdmin = await maneki.hasRole(defaultAdminROLE, owner.address)
    expect(isDefaultAdmin).true

    const isPauseRole = await maneki.hasRole(pauseROLE, owner.address)
    expect(isPauseRole).true

    expect(await maneki.hasRole(defaultAdminROLE, alice.address)).true
    await maneki.grantRole(defaultAdminROLE, alice.address)
    expect(await maneki.hasRole(defaultAdminROLE, alice.address)).true

    const a = await maneki.getRoleAdmin(minerROLE)
    console.log("Admin of miner ", a, " owner: ", owner.address)
    // expect(await maneki.hasRole(defaultAdminROLE, owner.address)).false
  })
})
