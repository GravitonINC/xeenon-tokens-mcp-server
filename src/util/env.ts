import { z } from 'zod';

import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV || '.env' });

const schema = z.object({
  RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  SOLANA_PRIVATE_KEY: z.string().default('[]'),
  XEENON_API_URL: z.string().default('https://main.public-api.xeenon.xyz'),
  XEENON_API_KEY: z.string().default('xeen_'),
  CREDIEZ_ADDRESS: z
    .string()
    .default('ViSmGbBJNTSMczzEqPU2ijmAqpstphkBuM9SoYCredz'),
  MAYFLOWER_PROGRAM_ID: z
    .string()
    .default('MDKJQPtnnJob8bJhs8eNXDBuS3Q7RWsbpPNg1FjEXxv'),
});

export const ENV = schema.parse(process.env);
