// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

// Tokens & Mocks
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockMemeToken} from "../src/mocks/MockMemeToken.sol";
import {MockDEX} from "../src/mocks/MockDEX.sol";

// Privacy & Identity
import {ERC5564Announcer} from "../src/privacy/ERC5564Announcer.sol";
import {ERC6538Registry} from "../src/privacy/ERC6538Registry.sol";
import {AlloyStealthRelayer} from "../src/privacy/AlloyStealthRelayer.sol";
import {MockL2Resolver} from "../src/mocks/MockL2Resolver.sol";
import {AlloyBasenameResolver} from "../src/identity/AlloyBasenameResolver.sol";

// Router
import {AlloyHarvestRouter} from "../src/AlloyHarvestRouter.sol";

contract DeployAlloy is Script {
    function run() external {
        // Retrieve deployer private key from environment or fallback to standard Anvil key
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        console.log("==================================================");
        console.log("          ALLOY DEPLOYMENT SCRIPT                 ");
        console.log("==================================================");
        console.log("Deployer Address:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // ----------------------------------------------------
        // 1. DEPLOY TOKENIZED EQUITIES (B20 Asset Variant)
        // ----------------------------------------------------
        MockB20TokenizedStock aapl = new MockB20TokenizedStock(
            "Apple Tokenized Stock",
            "AAPLc",
            deployer
        );
        MockB20TokenizedStock nvda = new MockB20TokenizedStock(
            "Nvidia Tokenized Stock",
            "NVDAc",
            deployer
        );
        MockB20TokenizedStock coin = new MockB20TokenizedStock(
            "Coinbase Tokenized Stock",
            "COINc",
            deployer
        );

        // ----------------------------------------------------
        // 2. DEPLOY STABLECOINS (USDC, cNGN)
        // ----------------------------------------------------
        MockStablecoin usdc = new MockStablecoin("USD Coin", "USDC", 6);
        MockStablecoin cngn = new MockStablecoin("Compliant NGN", "cNGN", 6);

        // ----------------------------------------------------
        // 3. DEPLOY BASE MEME COINS ($CLANKER, $HIGHER, $DEGEN)
        // ----------------------------------------------------
        MockMemeToken clanker = new MockMemeToken("Clanker Token", "CLANKER");
        MockMemeToken higher = new MockMemeToken("Higher", "HIGHER");
        MockMemeToken degen = new MockMemeToken("Degen", "DEGEN");

        // ----------------------------------------------------
        // 4. DEPLOY MOCK DEX & CONFIGURE ORACLE PRICES
        // ----------------------------------------------------
        MockDEX dex = new MockDEX();

        // Equity spot prices (18 decimals, 1e18 = $1.00 USD)
        dex.setPrice(address(aapl), 200e18); // AAPL = $200.00
        dex.setPrice(address(nvda), 130e18); // NVDA = $130.00
        dex.setPrice(address(coin), 220e18); // COIN = $220.00

        // Stablecoin spot prices
        dex.setPrice(address(usdc), 1e18); // USDC = $1.00
        // 1 USD = 1,600 NGN -> 1 NGN = $0.000625 -> 6.25e14
        dex.setPrice(address(cngn), 625000000000000);

        // Base Meme spot prices
        dex.setPrice(address(clanker), 5e18); // $5.00
        dex.setPrice(address(higher), 1e17);  // $0.10 (1e17)
        dex.setPrice(address(degen), 2e16);   // $0.02 (2e16)

        // Seed DEX with liquidity for immediate swaps
        usdc.mint(address(dex), 10_000_000 * 1e6); // 10M USDC
        cngn.mint(address(dex), 10_000_000_000 * 1e6); // 10B cNGN
        clanker.mint(address(dex), 10_000_000 * 1e18);
        higher.mint(address(dex), 50_000_000 * 1e18);
        degen.mint(address(dex), 100_000_000 * 1e18);

        // ----------------------------------------------------
        // 5. DEPLOY PRIVACY INFRASTRUCTURE (ERC-5564 & ERC-6538)
        // ----------------------------------------------------
        ERC5564Announcer announcer = new ERC5564Announcer();
        ERC6538Registry registry = new ERC6538Registry();
        AlloyStealthRelayer relayer = new AlloyStealthRelayer();

        // ----------------------------------------------------
        // 6. DEPLOY BASENAMES IDENTITY RESOLVER
        // ----------------------------------------------------
        MockL2Resolver l2Resolver = new MockL2Resolver();
        AlloyBasenameResolver basenameResolver = new AlloyBasenameResolver(
            address(l2Resolver),
            address(registry)
        );

        // ----------------------------------------------------
        // 7. DEPLOY ALLOY HARVEST ROUTER
        // ----------------------------------------------------
        AlloyHarvestRouter router = new AlloyHarvestRouter(
            address(dex),
            address(announcer)
        );

        // ----------------------------------------------------
        // 8. SEED DEMO ASSETS & BASENAME
        // ----------------------------------------------------
        // Seed deployer wallet with initial shares
        aapl.mint(deployer, 100e18);  // 100 shares of Apple
        nvda.mint(deployer, 200e18);  // 200 shares of Nvidia
        coin.mint(deployer, 100e18);  // 100 shares of Coinbase

        // Seed demo Basename: "bob.base.eth"
        bytes32 bobNode = basenameResolver.namehashBaseSubdomain("bob");
        address bobPublicAddress = address(0xB0B01);
        l2Resolver.setAddr(bobNode, bobPublicAddress);
        l2Resolver.setText(
            bobNode,
            "stealth",
            "st:eth:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f8179802c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5"
        );

        vm.stopBroadcast();

        // ----------------------------------------------------
        // 9. LOG DEPLOYED ADDRESSES
        // ----------------------------------------------------
        console.log("--------------------------------------------------");
        console.log("DEPLOYED CONTRACTS:");
        console.log("--------------------------------------------------");
        console.log("MockB20 AAPLc:          ", address(aapl));
        console.log("MockB20 NVDAc:          ", address(nvda));
        console.log("MockB20 COINc:          ", address(coin));
        console.log("Mock USDC:              ", address(usdc));
        console.log("Mock cNGN:              ", address(cngn));
        console.log("Mock CLANKER:           ", address(clanker));
        console.log("Mock HIGHER:            ", address(higher));
        console.log("Mock DEGEN:             ", address(degen));
        console.log("Mock DEX:               ", address(dex));
        console.log("ERC5564 Announcer:      ", address(announcer));
        console.log("ERC6538 Registry:       ", address(registry));
        console.log("Mock L2Resolver:        ", address(l2Resolver));
        console.log("Alloy Basename Resolver:", address(basenameResolver));
        console.log("Alloy Stealth Relayer:  ", address(relayer));
        console.log("Alloy Harvest Router:   ", address(router));
        console.log("--------------------------------------------------");
        console.log("Seed Assets Minted to:  ", deployer);
        console.log("Demo Basename bob.base.eth registered to: ", bobPublicAddress);
        console.log("==================================================");
    }
}
