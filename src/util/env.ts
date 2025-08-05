import { z } from 'zod';

import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV || '.env', debug: false, quiet: true });

const schema = z.object({
  XEENON_API_KEY: z.string().default('xeen_'),
  SOLANA_PRIVATE_KEY: z.string().default('[]'),
  RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  XEENON_API_URL: z.string().default('https://main.public-api.xeenon.xyz'),
  CREDIEZ_ADDRESS: z
    .string()
    .default('ViSmGbBJNTSMczzEqPU2ijmAqpstphkBuM9SoYCredz'),
  MAYFLOWER_PROGRAM_ID: z
    .string()
    .default('MMkP6WPG4ySTudigPQpKNpranEYBzYRDe8Ua7Dx89Rk'),
});

export const ENV = schema.parse(process.env);
