// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import {Script} from "forge-std/Script.sol";
import {SabiSafeRegistry} from "../src/SabiSafeRegistry.sol";

/**
 * Deploy without putting a private key in this repository.
 *
 * Aurora's public RPCs do not implement eth_getProof, so Forge's default fork
 * simulation cannot work. Always pass --skip-simulation.
 *
 * Hardware wallet:
 *   forge script script/Deploy.s.sol --rpc-url aurora_testnet --ledger --broadcast --skip-simulation
 *
 * Encrypted Foundry keystore:
 *   cast wallet import sabisafe --interactive   # one-time, prompts locally
 *   forge script script/Deploy.s.sol --rpc-url aurora_testnet --account sabisafe --broadcast --skip-simulation
 *
 * Or deploy the same contract from Remix using MetaMask. SabiSafe never asks
 * for a private key or recovery phrase.
 */
contract Deploy is Script {
    function run() external returns (SabiSafeRegistry registry) {
        vm.startBroadcast();
        registry = new SabiSafeRegistry();
        vm.stopBroadcast();
    }
}
