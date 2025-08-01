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
    'getTokenDetailsByAddress',
    {
      title: 'Get Token Details',
      description: 'Get details for a Xeenon token',
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
