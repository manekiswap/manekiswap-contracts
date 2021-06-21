import { ethers, upgrades } from "hardhat"

import { ManekiToken, VestingVault } from "../../src/typechain"

const vaultAddr = "0x57d946727Ac6E0E22d8Ef7D376cbE7ca8bf30731"

const team = "0xDCEd2BD61523C88478Fe5d9657b6DA778c81c78B"

async function main() {
  const vaultFactory = await ethers.getContractFactory("VestingVault")
  const vault = vaultFactory.attach(vaultAddr) as VestingVault

  const amount = await vault.getGrantAmount(team)
  console.log("Amount ", amount.toString())

  await vault.claimVestedTokens(team)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
