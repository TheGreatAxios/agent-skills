# Rule: agents-on-skale

## Why It Matters

Building AI agents on SKALE enables autonomous applications that can make payments, access paywalled resources, and interact with on-chain data. SKALE's zero gas fees make agent operations economically viable, while x402 protocol enables seamless payment integration.

## Agent Types

| Agent Type | Best For | Complexity |
|------------|----------|------------|
| **Basic Agent** | Simple automation, scripts, scheduled tasks | Low |
| **LangChain Agent** | AI-powered services with payment protection | Medium-High |

## Prerequisites

- Node.js and npm installed
- SKALE Chain endpoint
- Understanding of x402 protocol
- TypeScript/JavaScript familiarity
- Wallet with funds (USDC or supported token)
- Anthropic API key (for LangChain agents)

## Basic Agent

### Step 1: Install Dependencies

```bash
npm install @x402/core @x402/evm viem dotenv
```

### Step 2: Environment Variables

```bash
# .env
PRIVATE_KEY=0xYourPrivateKey
PAYMENT_TOKEN_ADDRESS=0x2e08028E3C4c2356572E096d8EF835cD5C6030bD  # Bridged USDC
PAYMENT_TOKEN_NAME="Bridged USDC (SKALE Bridge)"
```

### Step 3: Chain Configuration

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

### Step 4: Basic Agent Implementation

```typescript
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { skaleChain } from "./chain";

class BasicAgent {
    private httpClient: x402HTTPClient;
    private walletAddress: string;
    private publicClient: any;

    private constructor(
        httpClient: x402HTTPClient,
        walletAddress: string,
        publicClient: any
    ) {
        this.httpClient = httpClient;
        this.walletAddress = walletAddress;
        this.publicClient = publicClient;
    }

    static async create(): Promise<BasicAgent> {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY required");
        }

        const account = privateKeyToAccount(privateKey);
        const evmScheme = new ExactEvmScheme(account);
        const coreClient = new x402Client().register("eip155:*", evmScheme);
        const httpClient = new x402HTTPClient(coreClient);
        const publicClient = createPublicClient({
            chain: skaleChain,
            transport: http()
        });

        return new BasicAgent(httpClient, account.address, publicClient);
    }

    async accessResource(url: string): Promise<any> {
        try {
            const response = await fetch(url);

            if (response.status === 402) {
                return await this.handlePaymentRequired(response, url);
            }

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: message };
        }
    }

    private async handlePaymentRequired(
        response: Response,
        url: string
    ): Promise<any> {
        const responseBody = await response.json();

        const paymentRequired = this.httpClient.getPaymentRequiredResponse(
            (name: string) => response.headers.get(name),
            responseBody
        );

        const paymentPayload = await this.httpClient.createPaymentPayload(paymentRequired);
        const paymentHeaders = this.httpClient.encodePaymentSignatureHeader(paymentPayload);

        const paidResponse = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...paymentHeaders
            }
        });

        if (!paidResponse.ok) {
            throw new Error(`Payment failed: ${paidResponse.status}`);
        }

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

## LangChain Agent with AI

### Step 1: Install Dependencies

```bash
npm install @x402/core @x402/evm @x402/hono @langchain/anthropic @langchain/core hono @hono/node-server viem dotenv
```

### Step 2: Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=your_anthropic_api_key
PRIVATE_KEY=0xYourPrivateKey
RECEIVING_ADDRESS=0x71dc0Bc68e7f0e2c5aaCE661b0F3Fb995a80AAF4
FACILITATOR_URL=https://facilitator.dirtroad.dev
NETWORK_CHAIN_ID=324705682
PAYMENT_TOKEN_ADDRESS=0x61a26022927096f444994dA1e53F0FD9487EAfcf
PAYMENT_TOKEN_NAME="Axios USD"
PORT=3001
```

### Step 3: AI Agent Implementation

```typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

class WeatherAgent {
    private model: ChatAnthropic;

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("ANTHROPIC_API_KEY required");
        }

        this.model = new ChatAnthropic({
            model: "claude-sonnet-4-20250514",
            temperature: 0.7,
            anthropicApiKey: apiKey
        });
    }

    async getWeatherForecast(city: string): Promise<any> {
        const systemPrompt = `You are a weather forecast assistant.
        Respond ONLY with valid JSON in this format:
        {
          "city": "City Name",
          "forecast": [
            {
              "dayOfWeek": "Monday",
              "date": "December 16",
              "minTemp": 5,
              "maxTemp": 12,
              "condition": "sunny"
            }
          ]
        }

        Rules:
        - 5 days starting from today
        - dayOfWeek: full day name
        - date: "Month Day" format
        - minTemp, maxTemp: integers in Celsius
        - condition: "sunny" or "rainy"`;

        const response = await this.model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(`Get the weather forecast for ${city} for the next 5 days.`)
        ]);

        const content = response.content as string;
        return JSON.parse(content);
    }
}
```

### Step 4: Payment-Protected Server

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import type { Network } from "@x402/core/types";

const app = new Hono();
const PORT = Number(process.env.PORT) || 3001;

app.use("*", cors());

// Setup x402
const facilitatorUrl = process.env.FACILITATOR_URL;
const receivingAddress = process.env.RECEIVING_ADDRESS as `0x${string}`;
const networkChainId = process.env.NETWORK_CHAIN_ID || "324705682";
const paymentTokenAddress = process.env.PAYMENT_TOKEN_ADDRESS as `0x${string}`;
const paymentTokenName = process.env.PAYMENT_TOKEN_NAME || "Axios USD";

const network: Network = `eip155:${networkChainId}`;
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitatorClient);

resourceServer.register("eip155:*", new ExactEvmScheme());

// Protect endpoint with x402
app.use(paymentMiddleware({
    "GET /api/weather": {
        accepts: [{
            scheme: "exact",
            network: network,
            payTo: receivingAddress,
            price: {
                amount: "10000",  // 0.01 tokens
                asset: paymentTokenAddress,
                extra: {
                    name: paymentTokenName,
                    version: "1"
                }
            }
        }],
        description: "AI Weather Forecast",
        mimeType: "application/json"
    }
}, resourceServer));

// Protected weather endpoint
app.get("/api/weather", async (c) => {
    const city = "London";
    const agent = new WeatherAgent();

    try {
        const forecast = await agent.getWeatherForecast(city);
        return c.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: forecast
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return c.json({ error: message }, 500);
    }
});

// Start server
serve({
    fetch: app.fetch,
    port: PORT
}, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 5: Client Implementation

```typescript
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { skaleChain } from "./chain";

class WeatherClient {
    private httpClient: x402HTTPClient;
    private walletAddress: string;
    private baseUrl: string;

    private constructor(
        httpClient: x402HTTPClient,
        walletAddress: string,
        baseUrl: string
    ) {
        this.httpClient = httpClient;
        this.walletAddress = walletAddress;
        this.baseUrl = baseUrl;
    }

    static async create(baseUrl: string = "http://localhost:3001"): Promise<WeatherClient> {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY required");
        }

        const account = privateKeyToAccount(privateKey);
        const evmScheme = new ExactEvmScheme(account);
        const coreClient = new x402Client().register("eip155:*", evmScheme);
        const httpClient = new x402HTTPClient(coreClient);
        const publicClient = createPublicClient({
            chain: skaleChain,
            transport: http()
        });

        return new WeatherClient(httpClient, account.address, baseUrl);
    }

    async getWeather(): Promise<any> {
        const url = `${this.baseUrl}/api/weather`;

        try {
            const response = await fetch(url);

            if (response.status === 402) {
                return await this.handlePaymentRequired(response, url);
            }

            if (!response.ok) {
                return { success: false, error: `Request failed: ${response.status}` };
            }

            return { success: true, data: await response.json() };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: message };
        }
    }

    private async handlePaymentRequired(response: Response, url: string): Promise<any> {
        const responseBody = await response.json();

        const paymentRequired = this.httpClient.getPaymentRequiredResponse(
            (name: string) => response.headers.get(name),
            responseBody
        );

        const paymentPayload = await this.httpClient.createPaymentPayload(paymentRequired);
        const paymentHeaders = this.httpClient.encodePaymentSignatureHeader(paymentPayload);

        const paidResponse = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...paymentHeaders
            }
        });

        if (!paidResponse.ok) {
            return { success: false, error: `Payment failed: ${paidResponse.status}` };
        }

        const settlement = this.httpClient.getPaymentSettleResponse(
            (name: string) => paidResponse.headers.get(name)
        );

        if (settlement?.transaction) {
            console.log(`Payment settled: ${settlement.transaction}`);
        }

        return { success: true, data: await paidResponse.json() };
    }
}
```

## Common Patterns

### Multi-Agent System

```typescript
// Agent A pays Agent B for services
class AgentToAgentCommunication {
    async requestWork(agentBEndpoint: string, taskData: any) {
        // Agent A automatically pays Agent B
        const result = await agentA.accessResource(agentBEndpoint);
        return result;
    }
}
```

### Scheduled Agent Tasks

```typescript
class ScheduledAgent {
    async performScheduledTask() {
        // Agent runs every hour, pays for data access
        setInterval(async () => {
            const data = await this.accessResource(paywalledUrl);
            this.processData(data);
        }, 3600000);  // 1 hour
    }
}
```

## Best Practices

1. **Set Spending Limits**: Implement maximum payment amounts
2. **Use Environment Variables**: Never hardcode private keys or API keys
3. **Log Transactions**: Keep records of all payments for debugging
4. **Handle Errors Gracefully**: Wrap payment logic in try-catch blocks
5. **Test on Testnet**: Use SKALE testnet before production
6. **Rate Limiting**: Prevent abuse and unexpected costs
7. **Secure Key Management**: Use secrets manager for production

## Security Considerations

- Never expose private keys in client-side code
- Use dedicated wallet with limited funds for agents
- Implement rate limiting on protected endpoints
- Audit agent behavior regularly
- Validate all payment responses

## Integration Checklist

- [ ] Install required dependencies (@x402/core, @x402/evm, etc.)
- [ ] Configure wallet and payment tokens
- [ ] Implement x402 client for agents
- [ ] Add x402 middleware to protected endpoints
- [ ] Test payment flow on testnet
- [ ] Implement error handling and logging
- [ ] Set spending limits
- [ ] Deploy and monitor

## References

- [x402 Protocol Specification](https://x402.org)
- [Coinbase x402 SDK](https://github.com/coinbase/x402)
- [ERC-3009 Standard](https://eips.ethereum.org/EIPS/eip-3009)
- [LangChain Documentation](https://js.langchain.com/docs)
- [SKALE Agents Documentation](https://docs.skale.space/cookbook/agents/build-an-agent)
- [x402 on SKALE Documentation](https://docs.skale.space/get-started/agentic-builders/start-with-x402)
