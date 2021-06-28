import { ethers } from "hardhat"

import { VestingVault } from "../../src/typechain"

const vaultAddr = "0x57d946727Ac6E0E22d8Ef7D376cbE7ca8bf30731"

const founder = "0x6722e5fafd680f15F1c4BF3D0De50338E7E015E9"
const team = "0xDCEd2BD61523C88478Fe5d9657b6DA778c81c78B"

async function main() {
  // founder 5% * 15M , endTime 31/12, vesting 6 month, cliff 6 month
  // team 5 % 10M, endTime 31/12, vest 6 month, cliff 6 month

  const vaultFactory = await ethers.getContractFactory("VestingVault")
  const vault = vaultFactory.attach(vaultAddr) as VestingVault

  // team granted: 5% * 15M => 750K
  const endTime = Date.parse("2021-06-20T00:00:00.000Z").valueOf() / 1000
  await vault.addTokenGrantWithEndTime(endTime, team, ethers.utils.parseUnits("500000"), 180, 180) // 0.5M => 5.5M

  await vault.addTokenGrantWithEndTime(endTime, founder, ethers.utils.parseUnits("750000"), 180, 180) // 0.75M
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
