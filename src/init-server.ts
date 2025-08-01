import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export async function initServer() {
  const server = new McpServer({
    name: 'xeenon-tokens-mcp-server',
    version: '0.0.1',
  });

  return server;
}
