// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MockMemeToken
 * @notice Standard 18-decimal ERC-20 meme coin with permit support on Base (e.g. $CLANKER, $HIGHER, $DEGEN).
 */
contract MockMemeToken is ERC20, ERC20Permit {
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {}

    /**
     * @notice Open faucet mint for local tests and demo wallets.
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
