import { z } from 'zod';

const schema = z.object({
  RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  SOLANA_PRIVATE_KEY: z.string().default('[]'),
  XEENON_API_URL: z.string().default('https://main.public-api.xeenon.xyz'),
  XEENON_API_KEY: z.string().default('xeen_'),
});

export const ENV = schema.parse(process.env);
