import { z } from 'zod';
import { loadKeypairFromEnv } from '../util/wallet';
import { getConnection } from '../util/connection';
import { getToken } from '../util/token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { MarketLinearWithMetaSdk } from '@mayflower-fi/may-sdk/build/marketLinearWithMeta';
import { uiToBigInt } from '../util/big-int';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { sendAndConfirmTransactionWithPriorityFee } from '../util/tx';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const donateLiquidityParamsSchema = z.object({
  token: z
    .string()
    .describe(
      'The address of the token to donate to donate liquidity to. Must be a token launched on Xeenon.'
    ),
  amount: z
    .number()
    .describe(
      'The amount of CREDIEZ to donate to the token liquidity. I.e. 1.5 means 1.5 CREDIEZ'
    ),
});

const donateLiquidity = async ({
  amount,
  token,
}: z.infer<typeof donateLiquidityParamsSchema>) => {
  const wallet = loadKeypairFromEnv();
  const connection = getConnection();
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;
  const sdk = await MarketLinearWithMetaSdk.loadFromRpc({
    connection,
    programId: new PublicKey('zxc'),
    marketGroupAddress: new PublicKey(tokenInfo.market.mayflowerMarketGroup),
    marketMetaAddress: new PublicKey(
      tokenInfo.market.mayflowerMarketMetaAddress
    ),
  });
  const tokenSrc = getAssociatedTokenAddressSync(
    new PublicKey(tokenInfo.address),
    wallet.publicKey
  );

  const ix = sdk.donateLiquidityIx({
    amount: uiToBigInt(amount),
    payer: wallet.publicKey,
    tokenSrc,
  });
  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransactionWithPriorityFee(tx);
  return signature;
};

export const registerDonateLiquidity = (server: McpServer) => {
  server.registerTool(
    'donateLiquidity',
    {
      title: 'Donate backing liquidity to the token',
      description:
        "Adds CREDIEZ to the token's liquidity vault without receiving tokens in return. This creates excess liquidity that can be used to raise the floor price or improve market stability.",
      inputSchema: donateLiquidityParamsSchema.shape,
      outputSchema: z.object({
        txSignature: z.string().describe('The signature of the transaction'),
      }).shape,
    },
    async (args) => {
      try {
        const txSignature = await donateLiquidity(args);
        const structuredContent = { txSignature };
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
