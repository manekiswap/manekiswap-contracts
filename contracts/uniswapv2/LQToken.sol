// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LQToken is ERC20 {
  constructor() ERC20("LiquidityToken", "LQT") {}
}
