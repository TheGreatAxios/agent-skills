# Rule: contracts-cross-chain

## Why It Matters

SKALE supports cross-chain messaging between SKALE chains, Ethereum, and Base. Proper patterns ensure messages are delivered, processed, and secured. Incorrect implementation leads to lost messages or failed transfers.

## Incorrect

```solidity
// No message retry handling
contract BadCrossChain {
    function sendMessage(bytes calldata data) external {
        // Assumes immediate delivery - wrong!
        MessageProxy(address(0x...)).postMessage(
            targetChain,
            targetContract,
            data,
            gasLimit,
            gasPrice,
            0 // No retry strategy
        );
    }
}
```

```solidity
// Missing chain validation
contract UnsafeReceiver {
    function receiveMessage(bytes calldata data) external {
        // No sender validation - anyone can call!
        _processData(data);
    }

    function _processData(bytes calldata data) internal {
        // Process without verification
    }
}
```

```solidity
// Ignoring gas limits
contract GasHungry {
    function onMessageReceived(bytes calldata data) external {
        // Too much work, may run out of gas
        for (uint256 i = 0; i < 1000; i++) {
            heavyOperation(i);
        }
    }
}
```

## Correct

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@skale/network/contracts/MessageProxyForMainnet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Cross-chain messaging contract
/// @notice Handles secure message passing between SKALE chains
contract SKALECrossChainMessenger is Ownable, ReentrancyGuard {
    // SKALE Message Proxy address (predeployed)
    MessageProxyForMainnet public constant MESSAGE_PROXY =
        MessageProxyForMainnet(0x...);

    // Mapping of processed messages to prevent replay
    mapping(bytes32 => bool) private _processedMessages;

    // Configuration per target chain
    struct ChainConfig {
        address targetContract;
        uint256 gasLimit;
        uint256 gasPrice;
        bool enabled;
    }

    mapping(uint256 => ChainConfig) public chainConfigs;

    // Events
    event MessageSent(
        uint256 indexed targetChain,
        bytes32 indexed messageHash,
        uint256 gasLimit
    );

    event MessageReceived(
        uint256 indexed sourceChain,
        address indexed sender,
        bytes32 indexed messageHash
    );

    /// @notice Configure a target chain
    function setChainConfig(
        uint256 chainId,
        address targetContract,
        uint256 gasLimit
    ) external onlyOwner {
        chainConfigs[chainId] = ChainConfig({
            targetContract: targetContract,
            gasLimit: gasLimit,
            gasPrice: 0, // SKALE uses zero gas price
            enabled: true
        });
    }

    /// @notice Send message to another chain
    function sendMessage(
        uint256 targetChain,
        bytes calldata message
    ) external payable nonReentrant {
        ChainConfig memory config = chainConfigs[targetChain];
        require(config.enabled, "Target chain not enabled");
        require(config.targetContract != address(0), "Invalid target");

        // Create message hash for tracking
        bytes32 messageHash = keccak256(abi.encode(targetChain, message));
        require(!_processedMessages[messageHash], "Already sent");

        // Send via Message Proxy
        MESSAGE_PROXY.postMessage(
            targetChain,
            config.targetContract,
            message,
            config.gasLimit,
            0, // Gas price (0 for SKALE)
            address(this) // Refund address
        );

        _processedMessages[messageHash] = true;
        emit MessageSent(targetChain, messageHash, config.gasLimit);
    }

    /// @notice Receive message from another chain
    function postMessage(
        bytes calldata data,
        bytes32 id,
        uint256 sourceChain,
        address sender
    ) external nonReentrant {
        // Only Message Proxy can call
        require(msg.sender == address(MESSAGE_PROXY), "Unauthorized");

        // Verify sender is authorized
        require(
            chainConfigs[sourceChain].targetContract == sender,
            "Unauthorized sender"
        );

        // Check not already processed (replay protection)
        require(!_processedMessages[id], "Already processed");

        // Mark as processed BEFORE handling message (checks-effects-interactions)
        _processedMessages[id] = true;

        emit MessageReceived(sourceChain, sender, id);

        // Handle message (interface that child contracts implement)
        _handleMessage(data, sourceChain, sender);
    }

    /// @notice Override in child contracts
    function _handleMessage(
        bytes calldata data,
        uint256 sourceChain,
        address sender
    ) internal virtual {
        // Default: revert to force implementation
        revert("Must implement _handleMessage");
    }

    /// @notice Check if message was processed
    function isMessageProcessed(bytes32 messageHash) external view returns (bool) {
        return _processedMessages[messageHash];
    }
}
```

```solidity
// Example: Cross-chain token bridge
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SKALECrossChainMessenger.sol";

contract SKALETokenBridge is SKALECrossChainMessenger {
    IERC20 public token;

    // Mapping of locked tokens for pending transfers
    mapping(bytes32 => uint256) public pendingTransfers;

    event TransferInitiated(
        address indexed from,
        uint256 targetChain,
        uint256 amount,
        bytes32 messageHash
    );

    event TransferCompleted(
        address indexed to,
        uint256 sourceChain,
        uint256 amount,
        bytes32 messageHash
    );

    constructor(address _token) {
        token = IERC20(_token);
    }

    /// @notice Lock tokens and initiate transfer
    function bridgeTokens(
        uint256 targetChain,
        address recipient,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(chainConfigs[targetChain].enabled, "Target not enabled");

        // Lock tokens
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Create message
        bytes memory message = abi.encode(recipient, amount);
        bytes32 messageHash = keccak256(abi.encode(targetChain, message));

        pendingTransfers[messageHash] = amount;

        // Send cross-chain message
        _sendMessage(targetChain, message);

        emit TransferInitiated(msg.sender, targetChain, amount, messageHash);
    }

    /// @notice Receive and process transfer from another chain
    function _handleMessage(
        bytes calldata data,
        uint256 sourceChain,
        address sender
    ) internal override {
        // Decode message
        (address recipient, uint256 amount) = abi.decode(data, (address, uint256));

        bytes32 messageHash = keccak256(abi.encode(block.chainid, data));

        // Mint or release tokens to recipient
        require(token.transfer(recipient, amount), "Transfer failed");

        emit TransferCompleted(recipient, sourceChain, amount, messageHash);
    }

    function _sendMessage(uint256 targetChain, bytes memory message) internal {
        ChainConfig memory config = chainConfigs[targetChain];

        MESSAGE_PROXY.postMessage(
            targetChain,
            config.targetContract,
            message,
            config.gasLimit,
            0,
            address(this)
        );
    }
}
```

## Context

### SKALE Cross-Chain Architecture

```
┌─────────────────┐         Message Proxy         ┌─────────────────┐
│  SKALE Chain A  │ ──────────────────────────────▶│  SKALE Chain B  │
│   (Sender)      │                                │   (Receiver)    │
└─────────────────┘                                └─────────────────┘
        │                                                   │
        │                                                   │
        └───────────────────┬───────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Message Proxy  │
                    │   (Predeployed) │
                    └────────────────┘
```

### Key Components

| Component | Address | Purpose |
|-----------|---------|---------|
| MessageProxy | Predeployed | Routes messages between chains |
| AddressMapper | Predeployed | Maps contract addresses across chains |
| KeyStorage | Predeployed | Manages cross-chain signing keys |

### Gas Limit Guidelines

| Operation | Recommended Gas Limit |
|-----------|----------------------|
| Token transfer | 100,000 |
| Contract call | 200,000 |
| Complex state change | 300,000-500,000 |
| Batch operations | Calculate: base × count + buffer |

### Safety Checklist

- [ ] Validate sender in `postMessage`
- [ ] Use `msg.sender` check for Message Proxy only
- [ ] Implement replay protection (message hash tracking)
- [ ] Mark messages processed BEFORE handling
- [ ] Use ReentrancyGuard for all external handlers
- [ ] Set appropriate gas limits for target operations
- [ ] Verify chain configuration before sending
- [ ] Handle failed message scenarios

### Testing Cross-Chain

```solidity
// Test with forked SKALE chains
contract CrossChainTest is Test {
    SKALEChainA chainA;
    SKALEChainB chainB;

    function setUp() public {
        // Fork both chains
        vm.createSelectFork(SKALE_A_RPC, blockA);
        chainA = new SKALEChainA();

        vm.createSelectFork(SKALE_B_RPC, blockB);
        chainB = new SKALEChainB();
    }

    function testCrossChainMessage() public {
        // Send from Chain A
        vm.createSelectFork(SKALE_A_RPC, blockA + 1);
        chainA.sendMessage(TEST_DATA);

        // Process on Chain B
        vm.createSelectFork(SKALE_B_RPC, blockB + 1);
        // Simulate Message Proxy call
        vm.prank(MESSAGE_PROXY);
        chainB.postMessage(TEST_DATA, MESSAGE_ID, CHAIN_A_ID, address(chainA));
    }
}
```

## References

- [SKALE Message Proxy Documentation](https://docs.skale.network/cross-chain/messaging)
- [SKALE Cross-Chain Architecture](https://docs.skale.network/cross-chain/overview)
- [MessageProxyForMainnet.sol](https://github.com/skalenetwork/skale-solidity)
