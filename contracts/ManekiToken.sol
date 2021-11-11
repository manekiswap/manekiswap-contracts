// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract ManekiToken is ERC20PresetMinterPauser {
  using SafeMath for uint256;

  uint256 private _cap;

  /**
   * @dev Sets the value of the `cap`. This value is immutable, it can only be
   * set once during construction.
   */
  constructor(uint256 cap_) ERC20PresetMinterPauser("ManekiToken", "MNK") {
    require(cap_ > 0, "ERC20Capped: cap is 0");
    _cap = cap_;
  }

  /**
   * @dev Returns the cap on the token's total supply.
   */
  function cap() public view virtual returns (uint256) {
    return _cap;
  }

  /**
   * @dev See {ERC20-_beforeTokenTransfer}.
   *
   * Requirements:
   *
   * - minted tokens must not cause the total supply to go over the cap.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);

    if (from == address(0)) {
      // When minting tokens
      require(totalSupply().add(amount) <= cap(), "ERC20Capped: cap exceeded");
    }
  }
}
