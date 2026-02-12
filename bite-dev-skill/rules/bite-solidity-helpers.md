# Rule: bite-solidity-helpers

## Why It Matters

The `@skalenetwork/bite-solidity` library provides Solidity interfaces and helpers for BITE Protocol integration. Using the official library ensures compatibility and reduces implementation errors.

## Installation

```bash
# Foundry
forge install skalenetwork/bite-solidity

# Add to remappings
echo "@skalenetwork/bite-solidity/=lib/bite-solidity/src/" >> remappings.txt
```

## Core Imports

```solidity
// Main BITE library
import { BITE } from "@skalenetwork/bite-solidity/BITE.sol";

// CTX Interface
import { IBiteSupplicant } from "@skalenetwork/bite-solidity/interfaces/IBiteSupplicant.sol";
```

## BITE Library Constants

```solidity
// Precompile addresses
address constant SUBMIT_CTX_ADDRESS = 0x000000000000000000000000000000000000001B;

// Gas settings
uint256 constant CTX_GAS_LIMIT = 2_500_000;
```

## IBiteSupplicant Interface

```solidity
interface IBiteSupplicant {
    /// @notice Called by BITE after decryption
    /// @param decryptedData The decrypted transaction data
    function onDecrypt(bytes calldata decryptedData) external;
}
```

## Usage Pattern

### Basic CTX Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IBiteSupplicant } from "@skalenetwork/bite-solidity/interfaces/IBiteSupplicant.sol";
import { BITE } from "@skalenetwork/bite-solidity/BITE.sol";

contract MyCTXContract is IBiteSupplicant {
    // Your state variables
    mapping(bytes32 => address) public pendingRequests;

    /// @notice Submit encrypted data for CTX
    function submit(bytes calldata encryptedData) external payable {
        require(msg.value >= 0.06 ether, "CTX payment required");

        bytes32 requestId = keccak256(encryptedData);
        pendingRequests[requestId] = msg.sender;

        // Submit to BITE precompile
        (bool success, ) = BITE.SUBMIT_CTX_ADDRESS.call{ value: msg.value }(
            abi.encodeWithSelector(
                BITE.submitCTX.selector,
                address(this),
                encryptedData
            )
        );
        require(success, "CTX submission failed");
    }

    /// @notice Handle decrypted data
    function onDecrypt(bytes calldata decryptedData) external override {
        require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Unauthorized");

        // Process decrypted data
        (address user, bytes memory payload) = abi.decode(decryptedData, (address, bytes));

        // Execute your logic
        _processDecrypted(user, payload);
    }

    function _processDecrypted(address user, bytes memory payload) internal {
        // Your business logic here
    }
}
```

## Foundry Configuration

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.27"
evm_version = "istanbul"

[dependencies]
bite-solidity = { git = "https://github.com/skalenetwork/bite-solidity" }
```

## Security Checks

Always verify the caller in `onDecrypt`:

```solidity
function onDecrypt(bytes calldata decryptedData) external override {
    // CRITICAL: Only BITE can call this
    require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Only BITE");

    // Process decrypted data
}
```

## Common Patterns

### Decode Multiple Values

```solidity
function onDecrypt(bytes calldata decryptedData) external override {
    require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Only BITE");

    // Single value
    uint256 value = abi.decode(decryptedData, (uint256));

    // Multiple values
    (address user, uint256 amount, bytes32 id) = abi.decode(
        decryptedData,
        (address, uint256, bytes32)
    );
}
```

### Emit Events for Indexing

```solidity
function onDecrypt(bytes calldata decryptedData) external override {
    require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Only BITE");

    (address user, bytes memory payload) = abi.decode(decryptedData, (address, bytes));

    emit CTXDecrypted(user, payload);
}
```

## Resources

- **GitHub**: `github.com/skalenetwork/bite-solidity`
- **Examples**: See `bite-conditional-transactions.md` for full examples
