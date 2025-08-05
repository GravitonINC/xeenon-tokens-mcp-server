import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetTokenDetailsByAddress } from './get-token';
import { registerDonateLiquidity } from './donate-liquidity';
import { registerQuoteBuy } from './quote-buy';
import { registerQuoteSell } from './quote-sell';
import { registerBuy } from './buy';
import { registerSell } from './sell';
import { registerDeposit } from './deposit';
import { registerWithdraw } from './withdraw';

export const registerTools = (server: McpServer) => {
  registerGetTokenDetailsByAddress(server);
  registerDonateLiquidity(server);
  registerQuoteBuy(server);
  registerQuoteSell(server);
  registerBuy(server);
  registerSell(server);
  registerDeposit(server);
  registerWithdraw(server);
  return server;
};
