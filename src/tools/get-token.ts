import { z } from 'zod';
import { getToken, tokenSchema } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getTokenDetailsParamsSchema = z.object({
  tokenAddress: z
    .string()
    .describe(
      'The address of the token to get details for. Must be a token launched on Xeenon.'
    ),
});

export const registerGetTokenDetailsByAddress = (server: McpServer) => {
  server.registerTool(
    'getTokenDetailsByAddressOrSymbol',
    {
      title: 'Get Token Details',
      description:
        'Get details for a Xeenon token. The priority to get the token details is to use the 1. token address, 2. token symbol, 3. `$` + token symbol, 4. Token creator address or short name',
      inputSchema: getTokenDetailsParamsSchema.shape,
      outputSchema: tokenSchema.shape,
    },
    async ({ tokenAddress }) => {
      const tokenRes = await getToken(tokenAddress);
      if (tokenRes.isErr()) {
        return {
          isError: true,
          content: [{ type: 'text', text: tokenRes.error }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(tokenRes.value) }],
        isError: false,
        structuredContent: tokenRes.value,
      };
    }
  );
  return server;
};
