// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC5564Announcer} from "../src/privacy/ERC5564Announcer.sol";
import {IERC5564Announcer} from "../src/interfaces/IERC5564Announcer.sol";

contract ERC5564AnnouncerTest is Test {
    ERC5564Announcer public announcer;

    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    function setUp() public {
        announcer = new ERC5564Announcer();
    }

    function test_AnnounceEmitsCorrectEvent() public {
        address stealthAddress = address(0x1234);
        bytes memory ephemeralPubKey = hex"0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
        bytes memory metadata = hex"42"; // 1-byte view tag

        vm.expectEmit(true, true, true, true);
        emit Announcement(1, stealthAddress, address(this), ephemeralPubKey, metadata);

        announcer.announce(1, stealthAddress, ephemeralPubKey, metadata);
    }
}
