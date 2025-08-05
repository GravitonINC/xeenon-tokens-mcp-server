import { z } from 'zod';
import { getToken } from '../util/token';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getXeenonProgram } from '../util/xeenon-program';
import { uiToBN } from '../util/big-int';
import { getTokenPdas } from '../util/token-pdas';
import { loadKeypairFromEnv } from '../util/wallet';
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { createATAInstruction } from '../util/token-account';
import { Transaction } from '@solana/web3.js';
import { sendAndConfirmTransactionWithPriorityFee } from '../util/tx';

const quoteBuyParamsSchema = z.object({
  crediezAmount: z
    .number()
    .describe('The amount of CREDIEZ to use to buy the token'),
  token: z
    .string()
    .describe(
      'The address of the token to buy. Must be a token launched on Xeenon.'
    ),
  minOutAmount: z
    .number()
    .describe(
      'The minimum amount of tokens to buy. If the trade results in less than this amount, the transaction will fail.'
    )
    .optional()
    .default(0),
});

export const buy = async ({
  crediezAmount,
  token,
  minOutAmount,
}: z.infer<typeof quoteBuyParamsSchema>) => {
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;

  const xeenonProgram = getXeenonProgram();
  const rawAmountIn = uiToBN(crediezAmount);
  const rawMinAmountOut = uiToBN(minOutAmount);
  const pdas = getTokenPdas(tokenInfo);

  const payer = loadKeypairFromEnv();

  const mainAta = getAssociatedTokenAddressSync(pdas.mintMain, payer.publicKey);

  const { ata: mintAta, ix: mintAtaIx } = await createATAInstruction(
    pdas.mintToken,
    payer.publicKey
  );

  const ix = await xeenonProgram.methods
    .buyWithExactCashIn(rawAmountIn, rawMinAmountOut)
    .accounts({
      mayflowerMarket: pdas.mayflowerMarketAddress,
      mayflowerMarketMeta: pdas.mayflowerMarketMeta,
      payer: payer.publicKey,
      liqVaultMain: pdas.liqVaultMain,
      mintMain: pdas.mintMain,
      tokenProgramMain: TOKEN_PROGRAM_ID,
      mayflowerTenant: pdas.tenant,
      mayflowerMarketGroup: pdas.mayflowerMarketGroup,
      xeenonMarket: pdas.xeenonMarket,
      revEscrowGroup: pdas.revEscrowGroup,
      revEscrowTenant: pdas.revEscrowTenant,
      mainAta,
      tokenDst: mintAta,
      mintToken: pdas.mintToken,
    })
    .instruction();
  const tx = new Transaction().add(mintAtaIx, ix);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerBuy = (server: McpServer) => {
  server.registerTool(
    'buy',
    {
      title: 'Buy a token',
      description: 'Buy a token with a given amount of CREDIEZ',
      inputSchema: quoteBuyParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
        txStatus: z.string().describe('The status of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const signature = await buy(args);
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
