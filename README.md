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
        "WALLET_KEYPAIR": "[1,2,3,4,5,6,7,8,9,10]"
      }
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
          "WALLET_KEYPAIR": "[1,2,3,4,5,6,7,8,9,10]"
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
        "-e", "WALLET_KEYPAIR",
        "gravitonxyz/xeenon-tokens-mcp-server"
      ],
      "env": {
        "RPC_URL": "https://api.mainnet-beta.solana.com",
        "WALLET_KEYPAIR": "[1,2,3,4,5,6,7,8,9,10]"
      }
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
        "WALLET_KEYPAIR=[1,2,3,4,5,6,7,8,9,10]",
        "gravitonxyz/xeenon-tokens-mcp-server"
      ]
    }
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
