import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export const createATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  payer?: PublicKey
) => {
  const ata = await getAssociatedTokenAddress(tokenMint, owner, true);

  const ix = createAssociatedTokenAccountIdempotentInstruction(
    payer || owner,
    ata,
    owner,
    tokenMint
  );
  return { ata, ix };
};
