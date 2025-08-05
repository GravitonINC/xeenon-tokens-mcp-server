import { z } from 'zod';
import { tokenAddressToMarketLinearWithMetaSdk } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const quoteBuyParamsSchema = z.object({
  crediezAmount: z
    .number()
    .describe('The amount of CREDIEZ to use to buy the token'),
  token: z
    .string()
    .describe(
      'The address of the token to buy. Must be a token launched on Xeenon.'
    ),
});

export const quoteBuy = async ({
  crediezAmount,
  token,
}: z.infer<typeof quoteBuyParamsSchema>) => {
  const sdk = await tokenAddressToMarketLinearWithMetaSdk(token);

  const quote = sdk.quoteBuyWithFee(crediezAmount);

  return quote;
};

export const registerQuoteBuy = (server: McpServer) => {
  server.registerTool(
    'quoteBuy',
    {
      title: 'Get a quote to buy a token',
      description: 'Get a quote to buy a token with a given amount of CREDIEZ',
      inputSchema: quoteBuyParamsSchema.shape,
      outputSchema: z.object({
        fee: z
          .number()
          .describe(
            'Represents the trading fee in CREDIEZ that goes to the protocol/tenants'
          ),
        netCrediez: z
          .number()
          .describe("Net CREDIEZ change from the trader's perspective."),
        netToken: z
          .number()
          .describe("Net token change from the trader's perspective."),
        priceImpact: z
          .number()
          .describe(
            'Price impact ratio as a decimal (e.g., 0.05 for 5% impact). This measures how much the trade affects the market price. Higher values indicate larger trades that move the price more significantly. A value of 0.01 means the trade moves the price by 1%.'
          ),
        averageFillPrice: z
          .number()
          .describe(
            'Average fill price for the trade. This is the effective price per token for the entire trade, calculated as the total CREDIEZ amount divided by the total token amount.'
          ),
      }).shape,
    },
    async (args) => {
      try {
        const quote = await quoteBuy(args);
        const structuredContent = {
          fee: quote.feeCash,
          netCrediez: quote.netCash,
          netToken: quote.netToken,
          priceImpact: quote.priceImpact,
          averageFillPrice: quote.averageFillPrice,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
          isError: false,
          structuredContent,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return {
          isError: true,
          content: [{ type: 'text', text: errorMessage }],
        };
      }
    }
  );
  return server;
};
