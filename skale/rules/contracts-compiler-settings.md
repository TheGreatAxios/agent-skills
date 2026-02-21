# Rule: contracts-compiler-settings

## Why It Matters

SKALE Network requires specific Solidity compiler settings based on the features you use. Using incorrect compiler settings can lead to deployment failures or unexpected behavior.

## Incorrect

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;  // Too new - not supported on SKALE
pragma solidity ^0.8.0;   // No explicit compiler setting

// Using wrong compiler for CTX
contract ConditionalTX {
    // This needs istanbul or lower compiler
}
```

```toml
# foundry.toml - Wrong settings
[profile.default]
solc_version = "0.8.25"  # Too new for SKALE
via_ir = true             # Not needed for most contracts
```

## Correct

```solidity
// Standard SKALE contracts - Shanghai compiler or lower
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;  // Recommended maximum for SKALE

contract StandardContract {
    // Standard SKALE contract
}
```

```solidity
// Conditional Transactions (CTX) - Istanbul compiler
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  // Istanbul compiler for CTX

contract ConditionalTransactions {
    // Conditional transaction logic
}
```

```solidity
// BITE Encrypted Transactions Phase I - Any compiler
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;  // Can use any supported version

contract BITEHandler {
    // BITE encrypted transaction handler
}
```

```toml
# foundry.toml - Recommended SKALE settings
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"  # Shanghai or lower for SKALE

# SKALE-specific deployment flags
# Use: forge script --legacy --slow
```

## Context

### Compiler Version Guidelines

| Feature | Compiler Version | Notes |
|---------|-----------------|-------|
| Standard contracts | Shanghai or lower (≤ 0.8.24) | Recommended: 0.8.24 |
| Conditional TX (CTX) | Istanbul (≤ 0.8.20) | CTX requires Istanbul compiler |
| BITE Phase I | Any supported version | No special requirements |
| BITE Phase II | Check documentation | May have specific requirements |

### Recommended Compiler Versions

```solidity
// For most SKALE contracts
pragma solidity ^0.8.24;  // Shanghai - latest recommended

// For CTX contracts (Istanbul compiler)
pragma solidity ^0.8.20;  // Istanbul - CTX compatible

// For maximum compatibility
pragma solidity ^0.8.0;   // Safe for all SKALE features
```

### Foundry Deployment Flags

When deploying to SKALE with Foundry, always use:

```bash
# Standard deployment
forge script script/Deploy.s.s \
  --rpc-url $SKALE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy \
  --slow

# Broadcast deployment
forge script script/Deploy.s.s \
  --rpc-url $SKALE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy \
  --slow \
  --broadcast
```

### Flag Explanations

| Flag | Purpose |
|------|---------|
| `--legacy` | Use legacy assembly for SKALE compatibility |
| `--slow` | Use slower compilation to avoid edge cases |

### Compiler Selection Pattern

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;  // CTX-compatible compiler

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 with conditional transactions
/// @notice Uses CTX which requires Istanbul compiler or lower
contract ConditionalERC20 is ERC20 {
    // CTX functionality
}
```

### Hardhat Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-foundry");

module.exports = {
  solidity: {
    version: "0.8.24",  // Shanghai or lower for SKALE
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  // ...
};
```

### Testing Compiler Versions

```typescript
// Test that contract compiles with correct version
describe("Compiler Version Check", () => {
  it("should use SKALE-compatible compiler", async () => {
    const metadata = await (await ethers.getContractFactory("MyContract"))
      .getDeploymentTransaction();

    // Check compiler version in metadata
    const solcVersion = metadata.bytecode.solcVersion;
    expect(solcVersion).to.match(/^0\.8\.(1[0-9]|2[0-4])/);  // 0.8.10-0.8.24
  });
});
```

## Best Practices

1. **Use 0.8.24** for most SKALE contracts (Shanghai compiler)
2. **Use 0.8.19 or lower** for CTX contracts
3. **Always use --legacy --slow** when deploying with Foundry
4. **Test on testnet** before mainnet deployment
5. **Verify compiler settings** in CI/CD pipeline

## Integration Checklist

- [ ] Set correct Solidity version for contract type
- [ ] Configure Foundry with SKALE-specific flags
- [ ] Test compilation locally before deployment
- [ ] Verify compiler version in deployment metadata
- [ ] Use appropriate compiler for feature (CTX vs standard)

## References

- [SKALE Documentation](https://docs.skale.space)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
