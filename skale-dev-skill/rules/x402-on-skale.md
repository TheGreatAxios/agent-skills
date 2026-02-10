# Rule: x402-on-skale

## Why It Matters

x402 is an internet-native payments protocol that extends HTTP with native payment capabilities using the `402 Payment Required` status code. It enables agents to send and receive payments for services autonomously on SKALE, with zero gas fees making microtransactions economically viable.

## Core Components

### 1. Facilitator

A facilitator processes x402 payments by exposing endpoints:
- `/verify` - Validates payment signatures without executing on-chain
- `/settle` - Executes the on-chain payment settlement
- `/supported` - Discover available payment options

```typescript
import { HTTPFacilitatorClient } from "@x402/core/server";

const facilitatorClient = new HTTPFacilitatorClient({
    url: "https://facilitator.dirtroad.dev"
});

// Get supported payment options
const supported = await facilitatorClient.getSupported();
```

### 2. Payment Middleware

Middleware that protects HTTP endpoints by enforcing the x402 payment handshake:

```typescript
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const resourceServer = new x402ResourceServer(facilitatorClient);

// Register payment scheme
resourceServer.register("eip155:*", new ExactEvmScheme());

// Apply middleware to protect endpoints
app.use(paymentMiddleware({
    "GET /api/premium": {
        accepts: [{
            scheme: "exact",
            network: "eip155:324705682",  // SKALE Base Sepolia
            payTo: "0x71dc0Bc68e7f0e2c5aaCE661b0F3Fb995a80AAF4",
            price: {
                amount: "10000",  // 0.01 tokens (6 decimals)
                asset: "0x61a26022927096f444994dA1e53F0FD9487EAfcf"
            }
        }]
    }
}, resourceServer);
```

### 3. Payment Client

Client libraries that handle the x402 payment flow automatically:

```typescript
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const evmScheme = new ExactEvmScheme(account);
const coreClient = new x402Client().register("eip155:*", evmScheme);
const httpClient = new x402HTTPClient(coreClient);
```

## Incorrect

```typescript
// Not using x402 for paid services
async function callPremiumAPI() {
    const response = await fetch("https://api.example.com/premium");
    // Fails with 402, no payment handling
    return await response.json();
}
```

```typescript
// Hardcoding payment flow
async function callWithManualPayment() {
    // 1. Check if payment needed
    // 2. Manually create transaction
    // 3. Send transaction
    // 4. Wait for confirmation
    // Error-prone and complex
}
```

```typescript
// Using wrong network ID
const coreClient = new x402Client().register("eip155:1", scheme);
// Wrong network - should use SKALE chain ID
```

## Correct

```typescript
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

class X402Agent {
    private httpClient: x402HTTPClient;
    private walletAddress: string;

    constructor(privateKey: string) {
        const account = privateKeyToAccount(privateKey);
        this.walletAddress = account.address;

        // Setup EVM scheme for signing payments
        const evmScheme = new ExactEvmScheme(account);

        // Register for all EVM networks
        const coreClient = new x402Client().register("eip155:*", evmScheme);
        this.httpClient = new x402HTTPClient(coreClient);
    }

    /// Access paywalled resource with automatic payment handling
    async accessResource(url: string): Promise<any> {
        const response = await fetch(url);

        if (response.status === 402) {
            return await this.handlePaymentRequired(response, url);
        }

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return await response.json();
    }

    /// Handle 402 Payment Required response
    private async handlePaymentRequired(
        response: Response,
        url: string
    ): Promise<any> {
        const responseBody = await response.json();

        // Get payment requirements from response headers and body
        const paymentRequired = this.httpClient.getPaymentRequiredResponse(
            (name: string) => response.headers.get(name),
            responseBody
        );

        // Create signed payment payload
        const paymentPayload = await this.httpClient.createPaymentPayload(paymentRequired);

        // Encode payment signature header
        const paymentHeaders = this.httpClient.encodePaymentSignatureHeader(paymentPayload);

        // Retry request with payment
        const paidResponse = await fetch(url, {
            headers: paymentHeaders
        });

        if (!paidResponse.ok) {
            throw new Error(`Payment failed: ${paidResponse.status}`);
        }

        // Check settlement
        const settlement = this.httpClient.getPaymentSettleResponse(
            (name: string) => paidResponse.headers.get(name)
        );

        if (settlement?.transaction) {
            console.log(`Payment settled: ${settlement.transaction}`);
        }

        return await paidResponse.json();
    }
}
```

## Payment Tokens on SKALE Base

SKALE Base Sepolia testnet supports various tokens for x402 payments:

| Token | Address | Decimals |
|-------|---------|----------|
| Axios USD | `0x61a26022927096f444994dA1e53F0FD9487EAfcf` | 6 |
| Bridged USDC | `0x2e08028E3C4c2356572E096d8EF835cD5C6030bD` | 6 |

## Server Integration

### Hono Server with x402 Middleware

```typescript
import { Hono } from "hono";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = new Hono();

// Configuration
const FACILITATOR_URL = "https://facilitator.dirtroad.dev";
const RECEIVING_ADDRESS = "0x71dc0Bc68e7f0e2c5aaCE661b0F3Fb995a80AAF4";
const CHAIN_ID = "324705682";  // SKALE Base Sepolia
const PAYMENT_TOKEN = "0x61a26022927096f444994dA1e53F0FD9487EAfcf";

// Initialize facilitator
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient);

// Register scheme
resourceServer.register("eip155:*", new ExactEvmScheme());

// Protect endpoint with x402
app.use(paymentMiddleware({
    "GET /api/premium": {
        accepts: [{
            scheme: "exact",
            network: `eip155:${CHAIN_ID}`,
            payTo: RECEIVING_ADDRESS,
            price: {
                amount: "10000",  // 0.01 tokens
                asset: PAYMENT_TOKEN,
                extra: {
                    name: "Axios USD",
                    version: "1"
                }
            }
        }],
        description: "Premium API endpoint",
        mimeType: "application/json"
    }
}, resourceServer));

app.get("/api/premium", (c) => {
    return c.json({ data: "Premium content" });
});
```

## Client Usage

### Basic Agent with x402

```typescript
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

async function createAgent() {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);

    const evmScheme = new ExactEvmScheme(account);
    const coreClient = new x402Client().register("eip155:*", evmScheme);
    const httpClient = new x402HTTPClient(coreClient);

    return { httpClient, walletAddress: account.address };
}

// Use the agent
const { httpClient } = await createAgent();

async function accessProtectedResource(url: string) {
    const response = await fetch(url);

    if (response.status === 402) {
        const responseBody = await response.json();
        const paymentRequired = httpClient.getPaymentRequiredResponse(
            (name) => response.headers.get(name),
            responseBody
        );

        const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
        const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

        const paidResponse = await fetch(url, {
            headers: { ...paymentHeaders }
        });

        return await paidResponse.json();
    }

    return await response.json();
}
```

## Chain Configuration

### SKALE Base for x402

```typescript
import { defineChain } from "viem";

export const skaleChain = defineChain({
    id: 324705682,
    name: "SKALE Base Sepolia",
    nativeCurrency: {
        decimals: 18,
        name: "Credits",
        symbol: "CREDIT"
    },
    rpcUrls: {
        default: {
            http: ["https://base-sepolia-testnet.skalenodes.com/v1/base"]
        }
    }
});
```

## Environment Variables

```bash
# Wallet
PRIVATE_KEY=0xYourPrivateKey

# x402 Configuration
FACILITATOR_URL=https://facilitator.dirtroad.dev
RECEIVING_ADDRESS=0x71dc0Bc68e7f0e2c5aaCE661b0F3Fb995a80AAF4

# Network
CHAIN_ID=324705682

# Payment Token
PAYMENT_TOKEN_ADDRESS=0x61a26022927096f444994dA1e53F0FD9487EAfcf
PAYMENT_TOKEN_NAME="Axios USD"
```

## Use Cases

### Autonomous Service Access

```typescript
// Agent pays for API calls automatically
const apiData = await agent.accessResource("https://api.example.com/data");
```

### Monetize Agent Services

```typescript
// Protect your endpoint with x402
app.get("/ai/analyze", paymentMiddleware, async (c) => {
    const result = await model.analyze(c.req.query);
    return c.json(result);
});
```

### Multi-Agent Economies

```typescript
// Agent A pays Agent B for services
const result = await agentA.requestWork(agentB.endpoint, taskData);
```

## Installation

```bash
npm install @x402/core @x402/evm @x402/hono
```

## Integration Checklist

- [ ] Install x402 packages
- [ ] Configure facilitator URL
- [ ] Set up receiving address for payments
- [ ] Configure payment token addresses
- [ ] Implement payment middleware on server
- [ ] Implement x402 client in agents
- [ ] Test on SKALE Base testnet first
- [ ] Set spending limits for agents

## Best Practices

1. **Set Spending Limits**: Implement maximum payment amounts
2. **Environment Variables**: Never hardcode private keys
3. **Log Transactions**: Keep records of all payments
4. **Handle Errors Gracefully**: Wrap payment logic in try-catch
5. **Test on Testnet**: Use SKALE testnet before production

## References

- [x402 Protocol Specification](https://x402.org)
- [Coinbase x402 SDK](https://github.com/coinbase/x402)
- [ERC-3009 Standard](https://eips.ethereum.org/EIPS/eip-3009)
- [x402 Examples Repository](https://github.com/TheGreatAxios/x402-examples)
- [SKALE x402 Documentation](https://docs.skale.space/get-started/agentic-builders/start-with-x402)
