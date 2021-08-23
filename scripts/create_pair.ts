import { utils } from "ethers"
import { ethers } from "hardhat"

import { IUniswapV2Factory, IUniswapV2Pair, MyERC20, UniswapV2Factory, UniswapV2Pair, UniswapV2Router02 } from "../src/typechain"

//Wrapped Ether: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
const FAC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const WETH_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
async function main() {
  const fac1 = await ethers.getContractFactory("MyERC20")
  const token1 = (await fac1.deploy("TOKEN1", "TK1")) as MyERC20
  const token2 = (await fac1.deploy("TOKEN2", "TK2")) as MyERC20

  await token1.deployed()
  await token2.deployed()

  console.log("TOKEN 1: ", token1.address)
  console.log("TOKEN 2: ", token2.address)

  const signers = await ethers.getSigners()
  const owner = signers[0]
  const user1 = signers[1]

  const tenK = utils.parseUnits("10000")
  const twentyK = tenK.mul(2)

  // Mint to account
  await token1.mint(owner.address, twentyK) // 20000
  await token2.mint(owner.address, twentyK) // 20000
  await token1.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000
  await token2.mint(user1.address, tenK.div(10)) // 10000 / 10 = 1000

  console.log("Balance token 1 of owner: ", utils.formatUnits(await token1.balanceOf(owner.address)))
  console.log("Balance token 2 of: ", utils.formatUnits(await token2.balanceOf(owner.address)))
  console.log("Balance token 1 of user1 : ", utils.formatUnits(await token1.balanceOf(user1.address)))
  console.log("Balance token 2 of user 2: ", utils.formatUnits(await token2.balanceOf(user1.address)))

  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
  const router = (await UniswapV2Router02.deploy(FAC_ADDRESS, WETH_ADDRESS)) as unknown as UniswapV2Router02
  await router.deployed()
  console.log("ROUTER ADDRESS IS: ", router.address)

  const uniPairFac = await ethers.getContractFactory("UniswapV2Factory")
  const uniFactory = uniPairFac.attach(FAC_ADDRESS) as unknown as IUniswapV2Factory

  await uniFactory.createPair(token1.address, token2.address)
  const pairAddr = await uniFactory.getPair(token1.address, token2.address)
  const uniPairFACTORY = await ethers.getContractFactory("UniswapV2Pair")
  const uniPair = uniPairFACTORY.attach(pairAddr) as unknown as IUniswapV2Pair

  console.log("UNI PAIR ADDRESS IS: ", uniPair.address)

  let reserve = await uniPair.getReserves()

  console.log(
    "Reserver before  AddLiquidity: ",
    utils.formatUnits(reserve[0]),
    " ",
    utils.formatUnits(reserve[1]),
    " ",
    utils.formatUnits(reserve[2]),
  )

  await token1.approve(router.address, ethers.constants.MaxUint256)
  await token2.approve(router.address, ethers.constants.MaxUint256)

  await router
    .connect(owner)
    .addLiquidity(token1.address, token2.address, twentyK, twentyK.div(2), 0, 0, owner.address, ethers.constants.MaxUint256)
  console.log("2 TK1 = 1 TK2")

  reserve = await uniPair.getReserves()

  console.log(
    "Reserver after  AddLiquidity: ",
    utils.formatUnits(reserve[0]),
    " ",
    utils.formatUnits(reserve[1]),
    " ",
    utils.formatUnits(reserve[2]),
  )

  // TK1 -> TK2
  await router.swapExactTokensForTokens(
    utils.parseUnits("100"),
    utils.parseUnits("195"),
    [token2.address, token1.address],
    user1.address,
    ethers.constants.MaxUint256,
  )

  console.log("Balance token 1 of owner: ", utils.formatUnits(await token1.balanceOf(owner.address)))
  console.log("Balance token 2 of: ", utils.formatUnits(await token2.balanceOf(owner.address)))
  console.log("Balance token 1 of user1 : ", utils.formatUnits(await token1.balanceOf(user1.address)))
  console.log("Balance token 2 of user 2: ", utils.formatUnits(await token2.balanceOf(user1.address)))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
