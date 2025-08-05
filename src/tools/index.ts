import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetTokenDetailsByAddress } from './get-token';
import { registerDonateLiquidity } from './donate-liquidity';

export const registerTools = (server: McpServer) => {
  registerGetTokenDetailsByAddress(server);
  registerDonateLiquidity(server);
  return server;
};
