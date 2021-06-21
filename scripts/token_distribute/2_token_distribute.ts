import { ethers, upgrades } from "hardhat"

import { ManekiToken, VestingVault } from "../../src/typechain"

const vaultAddr = "0x57d946727Ac6E0E22d8Ef7D376cbE7ca8bf30731"
const manekiAddr = "0x329F7876Fc3Fc45Afbb197727916217eD3C052b2"

const founder = "0x6722e5fafd680f15F1c4BF3D0De50338E7E015E9"
const owner = "0x916f2A376afB8fF523Ed6910217a5E0EFbF027Cc"
const treasury = "0x3C9255Ca23578dbf2401340Eb6eea4ae114E3C2c"
const community = "0x0D849AA4b74f9Ec3D59ceD55C0bB445771BcE973"
const team = "0xDCEd2BD61523C88478Fe5d9657b6DA778c81c78B"

async function main() {
  // add to vault for founder and team (aka approve for vault using this amount)
  // grant for who:
  // founder 5% * 15M , endTime 31/12, vesting 6 month, cliff 6 month
  // team 5 % 10M, endTime 31/12, vest 6 month, cliff 6 month

  const vaultFactory = await ethers.getContractFactory("VestingVault")
  const vault = vaultFactory.attach(vaultAddr) as VestingVault

  ///Sunday, June 20, 2021 4:26:29 AM => 1624163189
  // founder granted: 5% * 15M => 750K

  const endTime = Date.parse("2021-06-20T00:00:00.000Z").valueOf() / 1000
  await vault.addTokenGrantWithEndTime(endTime, team, ethers.utils.parseUnits("500000"), 180, 180) // 500K

  await vault.addTokenGrantWithEndTime(endTime, founder, ethers.utils.parseUnits("750000"), 180, 180) // 750K
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
