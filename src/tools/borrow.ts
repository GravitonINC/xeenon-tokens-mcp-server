import { z } from 'zod';
import { getToken } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { uiToBN } from '../util/big-int';
import { Transaction } from '@solana/web3.js';
import { sendAndConfirmTransactionWithPriorityFee } from '../util/tx';
import { XeenonPosition } from '../util/xeenon-position';

const borrowParamsSchema = z.object({
  borrowAmount: z.number().describe('The amount of CREDIEZ to borrow'),
  token: z
    .string()
    .describe(
      'The address or symbol of the token to borrow the CREDIEZ against. Must be a token launched on Xeenon.'
    ),
});

export const borrow = async ({
  borrowAmount,
  token,
}: z.infer<typeof borrowParamsSchema>) => {
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;

  const xeenonPosition = new XeenonPosition(tokenInfo);
  const ixs = await xeenonPosition.borrowInstruction(uiToBN(borrowAmount));

  const tx = new Transaction().add(...ixs);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerBorrow = (server: McpServer) => {
  server.registerTool(
    'borrow',
    {
      title: 'Borrow CREDIEZ using a position as collateral',
      description: 'Borrow CREDIEZ using a position as collateral',
      inputSchema: borrowParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
        txStatus: z.string().describe('The status of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const signature = await borrow(args);
        const structuredContent = {
          txSignature: signature,
          txStatus: `Transaction sent but not confirmed, visit https://solscan.io/tx/${signature} to see the current status`,
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
