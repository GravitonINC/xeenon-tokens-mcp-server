# Xeenon Tokens MCP Server



![Xeenon Tokens MCP Server](docs/images/xeenon.png)

This project implements an [MCP server](https://spec.modelcontextprotocol.io/) for the [Xeenon Tokens Program](https://xeenon.xyz/token-scope) in Solana.


### Installation

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

### Examples

1. Get a quote to buy 1000 $TROY tokens
2. Buy 1000 $TROY tokens
3. Donate 100 $CREDIEZ to $TROY's liquidity


### Development

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
| quote_buy_with_exact_cash_in | ✅ | Get quote for buying tokens with exact cash amount | RPC |
| buy_with_exact_cash_in | ✅ | Buy tokens with exact cash amount | Private key, RPC, CREDIEZ Balance |
| quote_sell_with_exact_token_in | ✅ | Get quote for selling tokens with exact token amount | RPC |
| sell_with_exact_token_in | ✅ | Sell tokens with exact token amount | Private key, RPC, Token Balance |
| claim_creator_rewards | ❌ | Claim rewards as a token creator | Private key, RPC |
| claim_staker_rewards | ❌ | Claim rewards as a token staker | Private key, RPC |
| deposit_token | ✅ | Deposit tokens into a position | Private key, RPC, Balance |
| withdraw_token | ❌ | Withdraw tokens from a position | Private key, RPC, Balance |
| borrow | ❌ | Borrow against deposited tokens | Private key, RPC, Balance |
| repay | ❌ | Repay borrowed amount | Private key, RPC, Balance |
| donate_liquidity | ✅ | Donate tokens to liquidity pool | Private key, RPC, CREDIEZBalance |