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
  let user: SignerWithAddress
  let miner: SignerWithAddress
  let burner: SignerWithAddress
  let value = ethers.utils.parseEther("12")
  let vestingContract: VestingVault
  let cap = ethers.utils.parseEther("30000002")
  let allow = ethers.utils.parseEther("1002")

  beforeEach(async function () {
    ;[owner, admin, user, miner, burner] = await ethers.getSigners()

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
    await mnkToken.approve(vestingContract.address, allow)

    console.log("Vesting at ", vestingContract.address)
  })

  let grant = ethers.utils.parseEther("10")
  it("should emit event on grant", async function () {
    await vestingContract.addTokenGrant(user.address, grant, 10, 10)

    let allow = await vestingContract.getGrantAmount(user.address)

    console.log("Graned: ", allow)
  })
})
