# Xeenon Tokens MCP Server



![Xeenon Tokens MCP Server](docs/images/xeenon.png)

This project implements an [MCP server](https://spec.modelcontextprotocol.io/) for the [Xeenon Tokens Program](https://xeenon.xyz/token-scope) in Solana. It serves both as a fully functional MCP server for interacting with the Xeenon tokens program and as an example demonstrating how to programmatically interact with the it.

## Requirements

- **Node.js**: Version 18.0.0 or higher
- **Solana Wallet**: Private key for transaction signing
- **Xeenon API Key**: Required for accessing Xeenon token data
- **RPC Endpoint**: Solana RPC URL (mainnet or devnet)

## Environment Variables

The following environment variables are required for the MCP server to function properly:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XEENON_API_KEY` | ✅ | `xeen_` | Your Xeenon API key for accessing token data. Go to [https://xeenon.xyz](https://xeenon.xyz) to get one. |
| `SOLANA_PRIVATE_KEY` | ✅ | `[]` | Your Solana wallet private key for signing transactions |
| `RPC_URL` | ✅ | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint URL |
| `XEENON_API_URL` | ❌ | `https://main.public-api.xeenon.xyz` | Xeenon API base URL |
| `CREDIEZ_ADDRESS` | ❌ | `ViSmGbBJNTSMczzEqPU2ijmAqpstphkBuM9SoYCredz` | CREDIEZ token mint address |
| `MAYFLOWER_PROGRAM_ID` | ❌ | `MMkP6WPG4ySTudigPQpKNpranEYBzYRDe8Ua7Dx89Rk` | Mayflower program ID |
| `XEENON_PROGRAM_ID` | ❌ | `XEENqbVXt8y94cH7WMwYyQSuDgkvzZTzEzpsWLZu7Jf` | Xeenon program ID |
| `TENANT_ADDRESS` | ❌ | `655W5GfTcnAtUkietVLonp89xtCFPfWx6GzFTcXTfp4r` | Tenant address for Xeenon operations |

### Private Key Formats

The `SOLANA_PRIVATE_KEY` environment variable supports multiple formats:

- **JSON Array**: `[123,45,67,89,...]` (64 numbers, 0-255)
- **Base58**: `3QqJ7s8KxC2BvF9G...` (87-88 characters)
- **Seed Phrase**: `"word1 word2 word3..."` (12 or 24 words)
- **Hex String**: `a1b2c3d4e5f6...` (64 or 128 characters)
- **Comma-separated**: `123,45,67,...` (without brackets)

### Getting Your API Key

To obtain a Xeenon API key:
1. Visit [https://xeenon.xyz](https://xeenon.xyz)
2. Sign up or log in to your account
3. Navigate to the API section
4. Generate a new API key (format: `xeen_...`)

## Installation

#### 1. Adding MCP config to your client:

##### Using npm:

**Cursor & Claude:**

Add the following to your `.cursor/mcp.json` or `claude_desktop_config.json` (MacOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`)

```javascript
{
  "mcpServers": {
    "xeenon-tokens-mcp-server": {
      "command": "npx",
      "args": ["-y", "@graviton-inc/xeenon-tokens-mcp-server@latest"],
      "env": {
        "RPC_URL": "https://api.mainnet-beta.solana.com",
        "SOLANA_PRIVATE_KEY": "[1,2,3,4,5,6,7,8,9,10]",
        "XEENON_API_KEY": "xeen_abcdef"
      },
      "toolCallTimeoutMillis": 120000
    }
  }
}
```

**Zed**

Add the following to your `settings.json`

```json
{
  "context_servers": {
    "xeenon-tokens-mcp-server": {
      "command": {
        "path": "npx",
        "args": ["-y", "@graviton-inc/xeenon-tokens-mcp-server@latest"],
        "env": {
          "RPC_URL": "https://api.mainnet-beta.solana.com",
          "SOLANA_PRIVATE_KEY": "[1,2,3,4,5,6,7,8,9,10]",
          "XEENON_API_KEY": "xeen_abcdef"
        }
      },
      "settings": {}
    }
  }
}
```

##### Using Docker:

There are two options for running the MCP server with Docker:

###### Option 1: Using the official Docker Hub image:

Add the following to your `.cursor/mcp.json` or `claude_desktop_config.json`:

```javascript
{
  "mcpServers": {
    "xeenon-tokens-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "RPC_URL",
        "-e", "SOLANA_PRIVATE_KEY",
        "gravitonxyz/xeenon-tokens-mcp-server"
      ],
      "env": {
        "RPC_URL": "https://api.mainnet-beta.solana.com",
        "SOLANA_PRIVATE_KEY": "[1,2,3,4,5,6,7,8,9,10]",
        "XEENON_API_KEY": "xeen_abcdef"
      },
      "toolCallTimeoutMillis": 120000
    }
  }
}
```

This approach:
- Uses the official Docker Hub image
- Properly handles JSON escaping via environment variables
- Provides a more reliable configuration method

###### Option 2: Building the Docker image locally:

You can also build and run the Docker image locally. First, build the Docker image:

```bash
docker-compose build
```

Then, add the following to your `.cursor/mcp.json` or `claude_desktop_config.json`:

```javascript
{
  "mcpServers": {
    "xeenon-tokens-mcp-server": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "RPC_URL=https://api.mainnet-beta.solana.com",
        "SOLANA_PRIVATE_KEY=[1,2,3,4,5,6,7,8,9,10]",
        "XEENON_API_KEY=xeen_abcdef",
        "gravitonxyz/xeenon-tokens-mcp-server"
      ]
    },
    "toolCallTimeoutMillis": 120000
  }
}
```


#### Installing via Smithery

[![smithery badge](https://smithery.ai/badge/@GravitonINC/xeenon-tokens-mcp-server)](https://smithery.ai/server/@GravitonINC/xeenon-tokens-mcp-server)

To install Xeenon Tokens MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@GravitonINC/xeenon-tokens-mcp-server):

```bash
npx -y @smithery/cli install @GravitonINC/xeenon-tokens-mcp-server --client claude
```

## Examples

Here are some example operations you can perform with the MCP server:

### 1. Get Token Details
```typescript
// Get information about a Xeenon token
getTokenDetailsByAddressOrSymbol({
  tokenAddressOrSymbol: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})
```

### 2. Quote and Buy Tokens
```typescript
// Get a quote for buying tokens with CREDIEZ
quoteBuy({
  crediezAmount: 1000,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})

// Buy tokens with exact CREDIEZ amount
buy({
  crediezAmount: 1000,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN",
  minOutAmount: 0  // Optional slippage protection
})
```

### 3. Position Management
```typescript
// Deposit tokens into a position
deposit({
  amount: 500,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})

// Borrow CREDIEZ against your position
borrow({
  borrowAmount: 100,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})

// Repay your CREDIEZ loan
repay({
  repayAmount: 50,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})
```

### 4. Liquidity Operations
```typescript
// Donate CREDIEZ to a token's liquidity pool
donateLiquidity({
  amount: 100,
  token: "UPh8qUNj3p5NSN4fTdHX1kubBSQph4PwxBZdV44XEEN"
})
```

## Troubleshooting

### Common Issues

**1. "Environment variable SOLANA_PRIVATE_KEY is not set"**
- Ensure your private key is properly set in the environment variables
- Check that your private key format is supported (see Private Key Formats above)

**2. "Unable to detect keypair format"**
- Verify your private key is in one of the supported formats
- Remove any extra whitespace or characters
- For JSON arrays, ensure all 64 numbers are between 0-255

**3. "Insufficient funds" errors**
- Check your CREDIEZ balance for buying/repaying operations
- Verify you have enough SOL for transaction fees
- Ensure you have the required token balance for selling/depositing

**4. "Transaction failed" or timeout errors**
- Try using a different RPC endpoint (Helius, QuickNode, etc.)
- Increase the `toolCallTimeoutMillis` in your MCP configuration
- Check Solana network status at [status.solana.com](https://status.solana.com)

**5. "Invalid API key" errors**
- Verify your `XEENON_API_KEY` starts with `xeen_`
- Ensure the API key is active and hasn't expired
- Check that you're using the correct API key for your environment

### Debug Mode

To enable debug logging, you can run the server with additional environment variables:
```bash
DEBUG=1 npm run dev
```

## Development

Build

```
npm run build
```

Execute

```
npx -y --prefix /path/to/local/xeenon-tokens-mcp-server @graviton-inc/xeenon-tokens-mcp-server
```

Publish

```
npm publish --access public
```


## Supported tools

| Operation | Implemented | Description | Requirements |
|-----------|-------------|-------------|--------------|
| getTokenDetailsByAddressOrSymbol | ✅ | Get details for a Xeenon token by address or symbol | API Key |
| quoteBuy | ✅ | Get quote for buying tokens with exact cash amount | API Key, RPC |
| buy | ✅ | Buy tokens with exact cash amount | API Key, Private key, RPC, CREDIEZ Balance |
| quoteSell | ✅ | Get quote for selling tokens with exact token amount | API Key, RPC |
| sell | ✅ | Sell tokens with exact token amount | API Key, Private key, RPC, Token Balance |
| deposit | ✅ | Deposit tokens into a position | API Key, Private key, RPC, Token Balance |
| withdraw | ✅ | Withdraw tokens from a position | API Key, Private key, RPC, Position Balance |
| borrow | ✅ | Borrow CREDIEZ against deposited tokens | API Key, Private key, RPC, Position Balance |
| repay | ✅ | Repay a CREDIEZ loan | API Key, Private key, RPC, CREDIEZ Balance, Loan Balance |
| donateLiquidity | ✅ | Donate tokens to liquidity pool | API Key, Private key, RPC, CREDIEZ Balance |

## Network Support

This MCP server supports both **Solana Mainnet** and **Devnet**:

- **Mainnet**: Use `https://main.public-api.xeenon.xyz` for production operations
- **Devnet**: Use `https://dev.public-api.xeenon.xyz` for testing (requires devnet tokens)

For better performance and reliability, consider using dedicated RPC providers like:
- [Helius](https://helius.xyz/)
- [QuickNode](https://quicknode.com/)
- [Alchemy](https://alchemy.com/)

## Security Notes

- **Never commit private keys** to version control
- Use environment variables or secure key management systems
- Consider using a dedicated wallet for automated operations
- Monitor your wallet's SOL balance for transaction fees
- Regularly rotate API keys for enhanced security