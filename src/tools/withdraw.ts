import { z } from 'zod';
import { getToken } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { uiToBN } from '../util/big-int';
import { Transaction } from '@solana/web3.js';
import { sendAndConfirmTransactionWithPriorityFee } from '../util/tx';
import { XeenonPosition } from '../util/xeenon-position';

const withdrawParamsSchema = z.object({
  tokensAmount: z.number().describe('The amount of tokens to withdraw'),
  token: z
    .string()
    .describe(
      'The address or symbol of the token to withdraw the tokens from. Must be a token launched on Xeenon.'
    ),
});

export const withdraw = async ({
  tokensAmount,
  token,
}: z.infer<typeof withdrawParamsSchema>) => {
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;

  const xeenonPosition = new XeenonPosition(tokenInfo);
  const ixs = await xeenonPosition.withdrawTokensInstruction(
    uiToBN(tokensAmount)
  );

  const tx = new Transaction().add(...ixs);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerWithdraw = (server: McpServer) => {
  server.registerTool(
    'withdraw',
    {
      title: 'Withdraw tokens from a position',
      description: 'Withdraw/Unstake tokens from a position',
      inputSchema: withdrawParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
        txStatus: z.string().describe('The status of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const signature = await withdraw(args);
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
