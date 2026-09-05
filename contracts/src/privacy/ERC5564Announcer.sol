// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC5564Announcer} from "../interfaces/IERC5564Announcer.sol";

/**
 * @title ERC5564Announcer
 * @notice Standard implementation of the ERC-5564 stealth address broadcaster.
 * Allows anyone or any contract (like AlloyHarvestRouter) to broadcast stealth payment announcements.
 */
contract ERC5564Announcer is IERC5564Announcer {
    /**
     * @notice Broadcasts an announcement for a stealth transaction.
     * @param schemeId The stealth address scheme identifier (1 = secp256k1)
     * @param stealthAddress The one-time stealth address
     * @param ephemeralPubKey The sender's ephemeral public key
     * @param metadata Supplementary metadata including view tag
     */
    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes memory ephemeralPubKey,
        bytes memory metadata
    ) external override {
        emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
    }
}
