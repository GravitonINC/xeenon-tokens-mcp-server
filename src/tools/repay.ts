import { z } from 'zod';
import { getToken } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { uiToBN } from '../util/big-int';
import { Transaction } from '@solana/web3.js';
import { sendAndConfirmTransactionWithPriorityFee } from '../util/tx';
import { XeenonPosition } from '../util/xeenon-position';

const repayParamsSchema = z.object({
  repayAmount: z.number().describe('The amount of CREDIEZ to repay'),
  token: z
    .string()
    .describe(
      'The address of the token to repay the borrowed CREDIEZ against. Must be a token launched on Xeenon.'
    ),
});

export const repay = async ({
  repayAmount,
  token,
}: z.infer<typeof repayParamsSchema>) => {
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;

  const xeenonPosition = new XeenonPosition(tokenInfo);
  const ixs = await xeenonPosition.repayInstruction(uiToBN(repayAmount));

  const tx = new Transaction().add(...ixs);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerRepay = (server: McpServer) => {
  server.registerTool(
    'repay',
    {
      title: 'Repay a CREDIEZ loan',
      description: 'Repay a CREDIEZ loan',
      inputSchema: repayParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
        txStatus: z.string().describe('The status of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const signature = await repay(args);
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
