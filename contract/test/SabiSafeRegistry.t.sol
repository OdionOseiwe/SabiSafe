// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import {Test} from "forge-std/Test.sol";
import {SabiSafeRegistry} from "../src/SabiSafeRegistry.sol";

contract SabiSafeRegistryTest is Test {
    SabiSafeRegistry private registry;

    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);
    address private carol = address(0xCA201);

    event TrustedAdded(address indexed owner, address indexed account);
    event TrustedRemoved(address indexed owner, address indexed account);

    function setUp() public {
        registry = new SabiSafeRegistry();
    }

    function testVersion() public view {
        assertEq(registry.version(), "1.0.0");
    }

    function testAddAndReadTrusted() public {
        vm.expectEmit(true, true, false, false);
        emit TrustedAdded(alice, bob);

        vm.prank(alice);
        registry.addTrusted(bob);

        assertTrue(registry.isTrusted(alice, bob));
        assertEq(registry.countTrusted(alice), 1);

        address[] memory list = registry.listTrusted(alice);
        assertEq(list.length, 1);
        assertEq(list[0], bob);
    }

    function testAddingTwiceReverts() public {
        vm.startPrank(alice);
        registry.addTrusted(bob);
        vm.expectRevert(SabiSafeRegistry.AlreadyTrusted.selector);
        registry.addTrusted(bob);
        vm.stopPrank();
    }

    function testRemoveTrustedWorks() public {
        vm.startPrank(alice);
        registry.addTrusted(bob);
        registry.addTrusted(carol);

        vm.expectEmit(true, true, false, false);
        emit TrustedRemoved(alice, bob);
        registry.removeTrusted(bob);
        vm.stopPrank();

        assertFalse(registry.isTrusted(alice, bob));
        assertTrue(registry.isTrusted(alice, carol));
        assertEq(registry.countTrusted(alice), 1);
        assertEq(registry.listTrusted(alice)[0], carol);
    }

    function testRemoveUnknownReverts() public {
        vm.prank(alice);
        vm.expectRevert(SabiSafeRegistry.NotTrusted.selector);
        registry.removeTrusted(bob);
    }

    function testCannotTrustSelf() public {
        vm.prank(alice);
        vm.expectRevert(SabiSafeRegistry.SelfTrust.selector);
        registry.addTrusted(alice);
    }

    function testCannotTrustZeroAddress() public {
        vm.prank(alice);
        vm.expectRevert(SabiSafeRegistry.ZeroAddress.selector);
        registry.addTrusted(address(0));
    }

    function testListsAreSeparatePerOwner() public {
        vm.prank(alice);
        registry.addTrusted(bob);

        vm.prank(bob);
        registry.addTrusted(carol);

        assertTrue(registry.isTrusted(alice, bob));
        assertFalse(registry.isTrusted(bob, bob));
        assertTrue(registry.isTrusted(bob, carol));
        assertFalse(registry.isTrusted(alice, carol));
        assertEq(registry.countTrusted(alice), 1);
        assertEq(registry.countTrusted(bob), 1);
    }

    function testOnlyOwnerCanRemove() public {
        vm.prank(alice);
        registry.addTrusted(bob);

        vm.prank(bob);
        vm.expectRevert(SabiSafeRegistry.NotTrusted.selector);
        registry.removeTrusted(bob);

        assertTrue(registry.isTrusted(alice, bob));
    }
}
