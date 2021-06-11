import { ethers, upgrades } from 'hardhat'
import { ManekiToken, VestingVault } from '../src/typechain'

import { expect, use } from 'chai'
import { BN, expectEvent, expectRevert, constants } from '@openzeppelin/test-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe.only('Test vesting by maneki token', async function () {
  let mvkToken: ManekiToken
  let owner: SignerWithAddress
  let admin: SignerWithAddress
  let user: SignerWithAddress
  let miner: SignerWithAddress
  let burner: SignerWithAddress
  let value = ethers.utils.parseEther('10')
  let vestingContract: VestingVault
  beforeEach(async function () {
    [owner, admin, user, miner, burner] = await ethers.getSigners()

    let mnkFactory = await ethers.getContractFactory('ManekiToken')

    let cap = ethers.utils.parseEther('30000000')

    mvkToken = (await upgrades.deployProxy(mnkFactory, [cap], {
      initializer: 'initialize(uint256 cap_)',
    })) as ManekiToken

    await mvkToken.deployed()

    let vestingFactory = await ethers.getContractFactory('VestingVault')
    vestingContract = (await vestingFactory.deploy(mvkToken.address)) as VestingVault

    await vestingContract.deployed()
    console.log("Vesting at ", vestingContract.address);
  })

  it('Vest ', async function () {
    await vestingContract.addTokenGrant(owner.address, value, 1, 1);
  })
})
