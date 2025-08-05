import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools';

export async function initServer() {
  const server = new McpServer({
    name: 'xeenon-tokens-mcp-server',
    version: '0.0.5',
    title: 'Xeenon Tokens MCP Server',
  });

  return registerTools(server);
}
