import { Connection } from '@solana/web3.js';
import { ENV } from './env';

export const getConnection = () => {
  if (!ENV.RPC_URL) {
    throw new Error('RPC_URL is not set');
  }
  return new Connection(ENV.RPC_URL, 'confirmed');
};
