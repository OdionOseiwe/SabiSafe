// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title SabiSafeRegistry
 * @notice A small, user-owned trusted-recipient registry on Aurora.
 *
 * Each wallet owns its own list. Mutations are keyed on msg.sender, so no other
 * contract or administrator can write to a list on someone else's behalf. The
 * contract holds no funds and has no owner, upgrade proxy, or admin key.
 */
contract SabiSafeRegistry {
    mapping(address owner => address[] accounts) private _trustedLists;
    mapping(address owner => mapping(address account => bool trusted)) private _trusted;

    event TrustedAdded(address indexed owner, address indexed account);
    event TrustedRemoved(address indexed owner, address indexed account);

    error ZeroAddress();
    error SelfTrust();
    error AlreadyTrusted();
    error NotTrusted();

    /// @notice Add an address to the caller's trusted list.
    function addTrusted(address account) external {
        if (account == address(0)) revert ZeroAddress();
        if (account == msg.sender) revert SelfTrust();
        if (_trusted[msg.sender][account]) revert AlreadyTrusted();

        _trusted[msg.sender][account] = true;
        _trustedLists[msg.sender].push(account);

        emit TrustedAdded(msg.sender, account);
    }

    /// @notice Remove an address from the caller's trusted list.
    function removeTrusted(address account) external {
        if (!_trusted[msg.sender][account]) revert NotTrusted();

        _trusted[msg.sender][account] = false;

        address[] storage list = _trustedLists[msg.sender];
        uint256 length = list.length;
        for (uint256 i = 0; i < length; ++i) {
            if (list[i] == account) {
                list[i] = list[length - 1];
                list.pop();
                break;
            }
        }

        emit TrustedRemoved(msg.sender, account);
    }

    /// @notice Whether `owner` has approved `account`.
    function isTrusted(address owner, address account) external view returns (bool) {
        return _trusted[owner][account];
    }

    /// @notice The full trusted list for `owner`.
    function listTrusted(address owner) external view returns (address[] memory) {
        return _trustedLists[owner];
    }

    /// @notice Number of addresses `owner` has approved.
    function countTrusted(address owner) external view returns (uint256) {
        return _trustedLists[owner].length;
    }

    /// @notice Contract interface version, useful for clients.
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
