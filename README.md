# TheGreatAxios Agent SKILLs

The following are a collection of skills, compatible with the [Agent Skills](https://agentskills.io/home) format.

## Available Skills

### skale-dev-skill

SKALE Network Developer best practices and guidance to speed up development and deployment of Solidity smart contracts, privacy applications, and agentic applications on SKALE.

### bite-dev-skill

BITE Protocol development for encrypted and conditional transactions on SKALE. Use for privacy features, threshold encryption, CTX, and Rock-Paper-Scissors style games.

### skale-docs-skill

Search and reference SKALE documentation. Use when looking up API references, chain configurations, or BITE Protocol details.

### arktype-skill

TypeScript type validation and runtime schema library. Use for type definitions, validation, scopes, generics, pattern matching, JSON Schema conversion, and Attest testing.

## Installation

Install all skills:

```shell
npx skills add thegreataxios/agent-skills
```

Or install specific skills:

```shell
# SKALE development
npx skills add thegreataxios/agent-skills --skill skale-dev

# BITE Protocol
npx skills add thegreataxios/agent-skills --skill bite-dev

# Documentation search
npx skills add thegreataxios/agent-skills --skill skale-docs

# ArkType validation
npx skills add thegreataxios/agent-skills --skill arktype
```

## License

MIT
