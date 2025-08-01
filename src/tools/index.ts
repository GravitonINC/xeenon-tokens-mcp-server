import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetTokenDetailsByAddress } from './get-token';

export const registerTools = (server: McpServer) => {
  return registerGetTokenDetailsByAddress(server);
};
