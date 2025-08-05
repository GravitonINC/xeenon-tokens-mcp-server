import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetTokenDetailsByAddress } from './get-token';
import { registerDonateLiquidity } from './donate-liquidity';
import { registerQuoteBuy } from './quote-buy';
import { registerQuoteSell } from './quote-sell';

export const registerTools = (server: McpServer) => {
  registerGetTokenDetailsByAddress(server);
  registerDonateLiquidity(server);
  registerQuoteBuy(server);
  registerQuoteSell(server);
  return server;
};
