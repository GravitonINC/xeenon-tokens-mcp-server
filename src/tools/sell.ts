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

const sellParamsSchema = z.object({
  tokenAmount: z.number().describe('The amount of tokens to sell'),
  token: z
    .string()
    .describe(
      'The address of the token to sell. Must be a token launched on Xeenon.'
    ),
  minOutAmount: z
    .number()
    .describe(
      'The minimum amount of CREDIEZ to receive. If the trade results in less than this amount, the transaction will fail.'
    )
    .optional()
    .default(0),
});

export const sell = async ({
  tokenAmount,
  token,
  minOutAmount,
}: z.infer<typeof sellParamsSchema>) => {
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;

  const xeenonProgram = getXeenonProgram();
  const rawAmountIn = uiToBN(tokenAmount);
  const rawMinAmountOut = uiToBN(minOutAmount);
  const pdas = getTokenPdas(tokenInfo);

  const payer = loadKeypairFromEnv();

  const mainAta = getAssociatedTokenAddressSync(pdas.mintMain, payer.publicKey);
  const tokenAta = getAssociatedTokenAddressSync(
    pdas.mintToken,
    payer.publicKey
  );
  const { ata: mainDst, ix: mainDstIx } = await createATAInstruction(
    pdas.mintMain,
    payer.publicKey
  );

  const ix = await xeenonProgram.methods
    .sellWithExactTokenIn(rawAmountIn, rawMinAmountOut)
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
      tokenSrc: tokenAta,
      mintToken: pdas.mintToken,
      mainDst,
    })
    .instruction();
  const tx = new Transaction().add(mainDstIx, ix);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerSell = (server: McpServer) => {
  server.registerTool(
    'sell',
    {
      title: 'Sell a token',
      description: 'Sell a token for CREDIEZ',
      inputSchema: sellParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
        txStatus: z.string().describe('The status of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const signature = await sell(args);
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
