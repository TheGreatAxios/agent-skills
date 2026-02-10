# Rule: chain-naming

## Why It Matters

Consistent naming ("SKALE" not "skale") maintains brand integrity and professional appearance. Inconsistent naming (skale, Skale, SKALe, etc.) creates confusion and looks unprofessional in codebases, documentation, and UI.

## Incorrect

```typescript
// Wrong casing
const skaleChain = "0x727cd5b7...";
const skaleRpc = "https://rpc...";
const isSkale = true;

// Variable names
function connectToSkale() { }

// Comments
// This interacts with the skale network
```

```typescript
// File names
// skale-provider.ts
// skale-utils.ts
// skale-config.ts

// UI strings
<h1>Connect to skale</h1>
<p>Building on skale network</p>
```

```solidity
// Solidity contracts
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract skaleToken { }
interface IskaleBridge { }
```

```json
// Package.json
{
  "name": "my-skale-dapp",
  "description": "A skale network application"
}
```

## Correct

```typescript
// Correct: always "SKALE" in code
const SKALE_CHAIN = "0x727cd5b7...";
const SKALE_RPC = "https://rpc...";
const isSKALE = true;

// Only camelCase for variable names, but "SKALE" in constants
function connectToSKALE() { }
const skaleProvider = new Provider(); // OK: variable can be camelCase

// Comments use proper capitalization
// This interacts with the SKALE Network
```

```typescript
// File names: use kebab-case with proper capitalization
// skale-provider.ts  (OK: file systems are case-insensitive on some OS)
// But prefer explicit naming where possible:
// skale-config.ts (acceptable for technical reasons)
// In documentation: Always write "SKALE"

// Alternative: use prefix pattern
// providers/skale.ts
// utils/skale.ts
// config/chains.ts (with SKALE exports)
```

```typescript
// UI strings: Always "SKALE" in user-facing text
<h1>Connect to SKALE</h1>
<p>Building on SKALE Network</p>
<button>Deploy on SKALE</button>

// Helper function ensures consistency
function formatChainName(name: string): string {
    const map: Record<string, string> = {
        skale: "SKALE",
        ethereum: "Ethereum",
        base: "Base"
    };
    return map[name.toLowerCase()] ?? name;
}
```

```solidity
// Solidity: Use SKALE for contract names/interfaces
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SKALEToken { }  // Correct
interface ISKALEBridge { }  // Correct

// Internal variables can be camelCase
bytes32 private constant SKALE_CHAIN_ID = 0x...;
```

```json
// Package.json: user-facing description uses proper case
{
  "name": "my-skale-dapp",  // OK: npm packages are lowercase convention
  "description": "A SKALE Network application"
}
```

```typescript
// Config exports with consistent naming
// config/chains.ts
export const CHAINS = {
    SKALE_EUROPA: {
        id: "0x727cd5b7...",
        name: "SKALE Europa"
    },
    SKALE_CALYPSO: {
        id: "0x...",
        name: "SKALE Calypso"
    }
} as const;
```

## Context

### Naming Rules Summary

| Context | Correct Usage | Notes |
|---------|---------------|-------|
| Constants | `SKALE_RPC`, `SKALE_CHAIN` | Always caps |
| Variables | `skaleProvider`, `isSKALE` | CamelCase, but SKALE caps in compound words |
| Functions | `connectToSKALE()` | PascalCase functions, SKALE caps |
| File names | `skale.ts` (acceptable) | Technical limitation |
| UI text | "SKALE Network" | Always full caps |
| Comments | "On SKALE..." | Always full caps |
| Contracts | `SKALEToken` | PascalCase with SKALE caps |
| npm packages | `my-skale-package` | Lowercase by npm convention |

### Why This Matters

1. **Brand Recognition**: "SKALE" is the official brand spelling
2. **Searchability**: Consistent naming improves documentation search
3. **Professionalism**: Mixed case looks like a mistake
4. **Auto-linking**: Docs and parsers can link "SKALE" properly

### Linting Rule

Add to ESLint to enforce:

```javascript
// .eslintrc.js
module.exports = {
    rules: {
        'no-restricted-syntax': [
            'error',
            {
                selector: 'Identifier[name=/\\bskale\\b/]',
                message: 'Use SKALE (all caps) except in lowercase-required contexts'
            }
        ]
    }
};
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
# Check for incorrect "skale" in comments/strings
if git diff --cached --name-only | grep -E "\.(ts|tsx|sol)$"; then
    if git diff --cached | grep -E '(\+.*["'"'"'])[sS][kK][aA][lL][eE]|//.*[sS][kK][aA][lL][eE]'; then
        echo "Warning: 'skale' found. Use 'SKALE' instead."
        echo "Run: git diff --cached to review"
    fi
fi
```

## References

- [SKALE Brand Guidelines](https://skale.network/brand)
- [SKALE Editorial Guide](https://docs.skale.network/contributing/editorial)
