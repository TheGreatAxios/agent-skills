# Rule: bite-conditional-transactions (Phase II - CTX)

## Why It Matters

BITE Phase II (Conditional Transactions - CTX) enables transactions that execute based on encrypted conditions. Perfect for Rock-Paper-Scissors, sealed-bid auctions, voting, and multi-party games where all parties must commit before revealing.

## Available Chains

| Chain | Chain ID | CTX Support |
|-------|----------|-------------|
| BITE V2 Sandbox 2 | 1036987955 | ✅ Only chain with CTX |
| SKALE Base | 1187947933 | ❌ |
| SKALE Base Sepolia | 324705682 | ❌ |

## Key Constants

```solidity
// Solidity
address constant BITE_SUBMIT_CTX = 0x000000000000000000000000000000000000001B;
uint256 constant CTX_GAS_LIMIT = 2_500_000;
uint256 constant CTX_GAS_PAYMENT = 0.06 ether;  // 0.06 ETH/SFUEL
```

## Compiler Requirements

| Requirement | Value |
|-------------|-------|
| Solidity | ≥ 0.8.27 |
| EVM Version | istanbul |

```toml
# foundry.toml
[profile.default]
solc_version = "0.8.27"
evm_version = "istanbul"
```

## Incorrect

```solidity
// Wrong compiler version
pragma solidity ^0.8.24;  // Need ≥0.8.27 for CTX

// Not implementing IBiteSupplicant
contract MyCTX {
    function submit(bytes calldata data) external {
        // Missing onDecrypt callback
    }
}
```

```typescript
// Not paying CTX gas
await bite.submitCTX(data);
// Fails: CTX requires 0.06 ETH payment
```

## Correct

### Solidity: IBiteSupplicant Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IBiteSupplicant } from "@skalenetwork/bite-solidity/interfaces/IBiteSupplicant.sol";
import { BITE } from "@skalenetwork/bite-solidity/BITE.sol";

/// @title SimpleSecret - Basic CTX example
contract SimpleSecret is IBiteSupplicant {
    // CTX data stored for decryption callback
    bytes public pendingSecret;
    address public secretOwner;

    event SecretRevealed(address indexed owner, string secret);

    /// @notice Submit encrypted secret for CTX
    /// @param encryptedData The encrypted secret data
    function submitSecret(bytes calldata encryptedData) external payable {
        require(msg.value >= 0.06 ether, "Insufficient CTX payment");

        pendingSecret = encryptedData;
        secretOwner = msg.sender;

        // Submit to BITE CTX precompile
        (bool success, ) = BITE.SUBMIT_CTX_ADDRESS.call{ value: msg.value }(
            abi.encodeWithSelector(
                BITE.submitCTX.selector,
                address(this),
                encryptedData
            )
        );
        require(success, "CTX submission failed");
    }

    /// @notice Called by BITE after decryption
    /// @param decryptedData The decrypted secret
    function onDecrypt(bytes calldata decryptedData) external override {
        require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Only BITE");

        string memory secret = abi.decode(decryptedData, (string));
        emit SecretRevealed(secretOwner, secret);

        // Reset state
        pendingSecret = "";
        secretOwner = address(0);
    }
}
```

### Rock-Paper-Scissors Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IBiteSupplicant } from "@skalenetwork/bite-solidity/interfaces/IBiteSupplicant.sol";
import { BITE } from "@skalenetwork/bite-solidity/BITE.sol";

contract RockPaperScissors is IBiteSupplicant {
    enum Move { None, Rock, Paper, Scissors }
    enum GameStatus { Waiting, BothCommitted, Resolved }

    struct Game {
        address player1;
        address player2;
        bytes encryptedMove1;
        bytes encryptedMove2;
        Move move1;
        Move move2;
        GameStatus status;
        address winner;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCount;

    event GameCreated(uint256 indexed gameId, address player1);
    event PlayerJoined(uint256 indexed gameId, address player2);
    event MovesCommitted(uint256 indexed gameId);
    event GameResolved(uint256 indexed gameId, address winner, Move move1, Move move2);

    /// @notice Create a new game with encrypted move
    function createGame(bytes calldata encryptedMove) external payable {
        require(msg.value >= 0.06 ether, "CTX payment required");

        uint256 gameId = ++gameCount;
        Game storage game = games[gameId];

        game.player1 = msg.sender;
        game.encryptedMove1 = encryptedMove;
        game.status = GameStatus.Waiting;

        emit GameCreated(gameId, msg.sender);
    }

    /// @notice Join game with encrypted move
    function joinGame(uint256 gameId, bytes calldata encryptedMove) external payable {
        require(msg.value >= 0.06 ether, "CTX payment required");
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");

        game.player2 = msg.sender;
        game.encryptedMove2 = encryptedMove;
        game.status = GameStatus.BothCommitted;

        emit PlayerJoined(gameId, msg.sender);
        emit MovesCommitted(gameId);

        // Trigger decryption of both moves
        _submitCTX(gameId);
    }

    function _submitCTX(uint256 gameId) internal {
        Game storage game = games[gameId];

        // Combine both encrypted moves for batch decryption
        bytes memory combinedMoves = abi.encode(gameId, game.encryptedMove1, game.encryptedMove2);

        (bool success, ) = BITE.SUBMIT_CTX_ADDRESS.call{ value: 0.06 ether }(
            abi.encodeWithSelector(
                BITE.submitCTX.selector,
                address(this),
                combinedMoves
            )
        );
        require(success, "CTX failed");
    }

    /// @notice Called by BITE after decryption
    function onDecrypt(bytes calldata decryptedData) external override {
        require(msg.sender == BITE.SUBMIT_CTX_ADDRESS, "Only BITE");

        (uint256 gameId, Move p1Move, Move p2Move) = abi.decode(decryptedData, (uint256, Move, Move));

        Game storage game = games[gameId];
        game.move1 = p1Move;
        game.move2 = p2Move;

        // Determine winner
        game.winner = _determineWinner(game.player1, game.player2, p1Move, p2Move);
        game.status = GameStatus.Resolved;

        emit GameResolved(gameId, game.winner, p1Move, p2Move);
    }

    function _determineWinner(
        address p1, address p2, Move m1, Move m2
    ) internal pure returns (address) {
        if (m1 == m2) return address(0);  // Tie

        if ((m1 == Move.Rock && m2 == Move.Scissors) ||
            (m1 == Move.Paper && m2 == Move.Rock) ||
            (m1 == Move.Scissors && m2 == Move.Paper)) {
            return p1;
        }
        return p2;
    }
}
```

## CTX Flow

```
1. Player encrypts move locally
       │
       ├───> submitGame(encryptedMove) + 0.06 ETH
       │
2. Both players committed
       │
       ├───> BITE.submitCTX() precompile
       │
3. Consensus decrypts
       │
       └───> onDecrypt(decryptedData) callback
              │
              └──> Execute game logic with revealed moves
```

## Payment Requirements

| Item | Value |
|------|-------|
| CTX Gas Limit | 2,500,000 |
| CTX Payment | 0.06 ETH/SFUEL per CTX |

## Installation

```bash
# Foundry
forge install skalenetwork/bite-solidity

# npm
npm install @skalenetwork/bite
```

## Resources

- **bite-solidity**: `github.com/skalenetwork/bite-solidity`
- **Full RPS Demo**: `github.com/TheGreatAxios/ctxs` (thegreataxios/rps branch)
- **Foundry Starter**: `github.com/thegreataxios/skale-ctxs-foundry-starter`

## Integration Checklist

- [ ] Use Solidity ≥0.8.27 with `evm_version = "istanbul"`
- [ ] Implement `IBiteSupplicant.onDecrypt()`
- [ ] Include 0.06 ETH payment with CTX submission
- [ ] Test on BITE V2 Sandbox 2 (Chain ID: 1036987955)
- [ ] Verify only BITE address can call `onDecrypt()`
