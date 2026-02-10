# Rule: contracts-solidity-patterns

## Why It Matters

Smart contracts on SKALE follow Solidity best practices but have unique considerations due to zero gas fees, cross-chain messaging, and SKALE-specific features. Following `solidity-dev-tips` ensures secure, efficient contracts.

## Incorrect

```solidity
// Missing SKALE-specific considerations
contract TokenSale {
    mapping(address => uint256) public balances;

    function buy() external payable {
        // Problem: This assumes gas costs on Ethereum
        // On SKALE, users pay zero gas, but this logic is still wrong
        require(msg.value >= 0.01 ether, "Min 0.01 ETH");
        balances[msg.sender] += msg.value;
    }

    // Missing chain ID validation
    function withdraw() external {
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender] = 0;
    }
}
```

```solidity
// Not using Solidity Dev Tips patterns
contract BadContract {
    // No NatSpec comments
    // No reentrancy guards
    // No overflow protection (pre-0.8.0)
    // No access control

    mapping(address => uint256) public userBalances;

    function updateBalance(address user, uint256 amount) public {
        // No checks-effects-interactions pattern
        userBalances[user] = amount;
    }

    function withdrawAll() external {
        // Reentrancy vulnerable
        payable(msg.sender).transfer(userBalances[msg.sender]);
        userBalances[msg.sender] = 0;
    }
}
```

## Correct

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@skale/network/contracts/PredeployedAddressMapper.sol"; // SKALE-specific

/// @title SKALE Token Sale
/// @notice Token sale contract optimized for SKALE Network
/// @dev Implements checks-effects-interactions pattern
contract SKALETokenSale is ReentrancyGuard, Ownable {
    // Using solidity-dev-tips patterns

    // Constants
    uint256 private constant MIN_PURCHASE = 0; // SKALE has zero gas, can reduce minimums
    uint256 private constant MAX_PURCHASE = 100 ether;

    // State variables
    mapping(address => uint256) private balances;
    uint256 public totalRaised;

    // Events (NatSpec pattern)
    /// @notice Emitted when a purchase is made
    /// @param buyer Address of the purchaser
    /// @param amount Amount of tokens purchased
    event Purchased(address indexed buyer, uint256 amount);

    /// @notice Purchase tokens with ETH
    /// @dev Uses checks-effects-interactions pattern
    /// @param amount Amount to purchase
    function purchase(uint256 amount) external payable nonReentrant {
        // Checks
        require(amount >= MIN_PURCHASE, "Below minimum");
        require(amount <= MAX_PURCHASE, "Above maximum");
        require(msg.value >= amount, "Insufficient payment");

        // Effects
        balances[msg.sender] += amount;
        totalRaised += amount;

        emit Purchased(msg.sender, amount);
    }

    /// @notice Withdraw purchased tokens
    /// @dev Uses ReentrancyGuard, checks-effects-interactions
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // Effects first
        balances[msg.sender] = 0;

        // Interactions last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // SKALE-specific: Chain validation for cross-chain deployments
    modifier onlySKALEChain() {
        require(
            block.chainid == 0x727cd5b7a84dc..., // Europa Mainnet
            "Not a SKALE chain"
        );
        _;
    }
}
```

```solidity
// Using solidity-dev-tips recommended patterns
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { solidityDevTips } from "./solidity-dev-tips.sol";

contract OptimizedContract {
    using solidityDevTips for *;

    // Pattern: Use custom errors for gas savings
    error InsufficientBalance(uint256 requested, uint256 available);
    error InvalidChain(uint256 currentChain, uint256 expectedChain);

    // Pattern: Use immutable for constants set at deployment
    address public immutable CREATOR;
    uint256 public immutable CHAIN_ID;

    // Pattern: Use unchecked for safe operations (Solidity 0.8+)
    function increment(uint256 x) public pure returns (uint256) {
        unchecked {
            return x + 1;
        }
    }

    // Pattern: Cache array length in loops
    function sumArray(uint256[] memory arr) public pure returns (uint256) {
        uint256 total;
        uint256 length = arr.length; // Cache
        for (uint256 i = 0; i < length; ) {
            total += arr[i];
            unchecked { ++i; }
        }
        return total;
    }

    // Pattern: Use modifiers for reusable checks
    modifier validChain() {
        if (block.chainid != CHAIN_ID) {
            revert InvalidChain(block.chainid, CHAIN_ID);
        }
        _;
    }

    constructor() {
        CREATOR = msg.sender;
        CHAIN_ID = block.chainid;
    }
}
```

## Context

### Key Solidity Dev Tips to Apply

| Pattern | Description | SKALE Consideration |
|---------|-------------|---------------------|
| NatSpec | Document all functions/public vars | Include SKALE-specific notes |
| Custom Errors | Gas-efficient error handling | Zero gas makes this less critical but still best practice |
| Checks-Effects-Interactions | Prevent reentrancy | Essential for all chains |
| Immutable Variables | Gas-optimized constants | Use for chain IDs, config |
| Unchecked Blocks | Safe overflow operations | Useful for loops |
| ReentrancyGuard | Protect external calls | Use OpenZeppelin implementation |

### SKALE-Specific Imports

```solidity
// SKALE Network predeployed contracts
import "@skale/network/contracts/MessageProxy.sol";        // Cross-chain messaging
import "@skale/network/contracts/PredeployedAddressMapper.sol";
import "@skale/network/contracts/KeyStorage.sol";           // Key management

// When using Foundry
// remappings.txt
@skale/network/=lib/skale-solidity/contracts/
```

### Foundry Configuration

```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200

# SKALE testnet configuration
[rpc_endpoints]
skale_testnet = "${SKALE_TESTNET_RPC}"
skale_mainnet = "${SKALE_MAINNET_RPC}"

[doc]
out = "docs"
```

### Testing Pattern

```solidity
// test/MyContract.t.sol
import "forge-std/Test.sol";
import "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract target;

    function setUp() public {
        // Fork SKALE testnet
        vm.createSelectFork(vm.envString("SKALE_TESTNET_RPC"));
        target = new MyContract();
    }

    function testDeployment() public {
        assertEq(target.CHAIN_ID(), block.chainid);
    }
}
```

## References

- [Solidity Dev Tips](https://github.com/transmissions11/solcurity)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [SKALE Solidity SDK](https://github.com/skalenetwork/skale-solidity)
- [Foundry Book](https://book.getfoundry.sh/)
