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
  const MANEKI = await ethers.getContractFactory("ManekiToken")
  const contract = MANEKI.attach(manekiAddr) as ManekiToken

  // tranfer to fouder
  // mint to treasury  25%  * 100M => 25M
  // mint to community 35% => 35M
  // mint to owner address 25% (founder (15M) + team(10M)) =< 25M
  // mint to team 5% => 5M
  // not mint yet: 10% => 10M remain (investor)

  const txTreasury = await contract.mint(treasury, ethers.utils.parseUnits("25000000")) // 25M
  console.log("TX Treasury: ", txTreasury)

  const txCommunity = await contract.mint(community, ethers.utils.parseUnits("35000000")) // 35M
  console.log("TX Community: ", txCommunity)

  const txTeam = await contract.mint(team, ethers.utils.parseUnits("5000000")) // 5M
  console.log("TX Team: ", txTeam)

  const vaultAmount = "25000000"
  const txOwner = await contract.mint(owner, ethers.utils.parseUnits(vaultAmount)) // 25M
  console.log("TX Owner: ", txOwner)

  await contract.approve(vaultAddr, ethers.utils.parseUnits(vaultAmount))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })