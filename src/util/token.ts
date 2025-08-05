import { z } from 'zod';
import { ENV } from './env';
import { err, ok } from 'neverthrow';
import { PublicKey } from '@solana/web3.js';
import { MarketLinearWithMetaSdk } from '@mayflower-fi/may-sdk/build/marketLinearWithMeta';
import { getConnection } from './connection';

export type Token = z.infer<typeof tokenSchema>;

export const tokenSchema = z.object({
  name: z.string().describe('The name of the token'),
  symbol: z.string().describe('The symbol of the token'),
  image: z.string().optional().describe('The image of the token'),
  address: z.string().describe('The Solana address of the token'),
  decimals: z.number().describe('The number of decimals of the token'),
  url: z.string().describe('The URL of the token in Xeenon'),
  price: z.number().describe('The current price of the token in CREDIEZ'),
  supply: z.number().describe('The total supply of the token'),
  debt: z.number().describe('The total amount of tokens borrowed'),
  staked: z.number().describe('The total amount of tokens deposited'),
  mCap: z.number().describe('The market cap of the token in CREDIEZ'),
  volume24h: z.number().describe('The trading volume of the token in CREDIEZ'),
  change24h: z
    .number()
    .describe('The change in price of the token in the last 24 hours'),
  creatorRewardsSplit: z
    .number()
    .describe('The percentage of the rewards that goes to the creator'),
  market: z
    .object({
      mayflowerMarketAddress: z.string(),
      mayflowerMarketGroup: z.string(),
      mayflowerMarketMetaAddress: z.string(),
      xeenonMarketAddress: z.string(),
      xeenonMarketGroup: z.string(),
    })
    .describe('The Xeenon and Mayflower market addresses'),
});

export const getToken = async (tokenAddress: string) => {
  try {
    const response = await fetch(
      `${ENV.XEENON_API_URL}/tokens/${tokenAddress}`,
      {
        headers: {
          'x-api-key': ENV.XEENON_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }
    const data = await response.json();
    const token = tokenSchema.parse(data);
    return ok(token);
  } catch (error: any) {
    return err(error?.message ?? 'Failed to fetch token');
  }
};

export const tokenAddressToMarketLinearWithMetaSdk = async (token: string) => {
  const connection = getConnection();
  const tokenInfoRes = await getToken(token);
  if (tokenInfoRes.isErr()) throw new Error(tokenInfoRes.error);
  const tokenInfo = tokenInfoRes.value;
  const sdk = await MarketLinearWithMetaSdk.loadFromRpc({
    connection: connection as any,
    programId: new PublicKey(ENV.MAYFLOWER_PROGRAM_ID),
    marketGroupAddress: new PublicKey(tokenInfo.market.mayflowerMarketGroup),
    marketMetaAddress: new PublicKey(
      tokenInfo.market.mayflowerMarketMetaAddress
    ),
  });
  return sdk;
};
