import { ContractFactory } from "@ethersproject/contracts"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expectRevert } from "@openzeppelin/test-helpers"
import { expect } from "chai"
import { Contract } from "ethers"
import { mnemonicToEntropy } from "ethers/lib/utils"
import { ethers, upgrades } from "hardhat"

import { MyERC20, UniswapV2Factory, UniswapV2Pair } from "../src/typechain"
import { duration, increase } from "./util"

describe.only("Test BPH contract", async function () {
  it("Test UniswapV2 contract ", async function () {
    const [owner, user1, user2] = await ethers.getSigners()
    const UNIFac = await ethers.getContractFactory("UniswapV2Factory")
    const uniFac = (await UNIFac.deploy(owner.address)) as UniswapV2Factory

    await uniFac.deployed()

    const fac1 = await ethers.getContractFactory("MyERC20")
    const token1 = fac1.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as MyERC20
    const token2 = fac1.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as MyERC20

    console.log("Token 1 address is: ", token1.address)
    console.log("Token 2 address is: ", token2.address)

    const v = ethers.utils.parseUnits("10000")
    // token1.mint(user1.address, v)
    // token2.mint(user2.address, v)

    console.log("Amount of token 1: ", (await token1.balanceOf(user1.address)).toString())
    console.log("Amount of token 2: ", (await token2.balanceOf(user2.address)).toString())

    const pair = await uniFac.getPair(token1.address, token2.address)

    const UNIPAIRFAC = await ethers.getContractFactory("UniswapV2Pair")
    const uniPair = UNIPAIRFAC.attach(pair) as UniswapV2Pair

    // uniPair.connect().swap(v, v, user2.address, null)
  })
})
