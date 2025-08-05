import { MayflowerPda } from '@mayflower-fi/may-sdk';
import { PublicKey } from '@solana/web3.js';
import { Token } from './token';
import { ENV } from './env';
import { loadKeypairFromEnv } from './wallet';
import { XeenonPda } from './xeenon-pda';

export type TokenPdas = ReturnType<typeof getTokenPdas>;

export const getTokenPdas = (token: Token) => {
  const payer = loadKeypairFromEnv().publicKey;
  const mayflowerProgramId = new PublicKey(ENV.MAYFLOWER_PROGRAM_ID);
  const xeenonProgramId = new PublicKey(ENV.XEENON_PROGRAM_ID);
  const mayflowerMarketMeta = new PublicKey(
    token.market.mayflowerMarketMetaAddress
  );
  const xeenonMarket = new PublicKey(token.market.xeenonMarketAddress);
  const xeenonMarketGroup = new PublicKey(token.market.xeenonMarketGroup);
  const mayflowerMarketGroup = new PublicKey(token.market.mayflowerMarketGroup);

  const mayflowerPda = new MayflowerPda(mayflowerProgramId);
  const xeenonPda = new XeenonPda(xeenonProgramId);

  const xeenonPosition = xeenonPda.xeenonPositionPda(xeenonMarket, payer);

  const mayflowerPosition: PublicKey = mayflowerPda.personalPosition({
    marketMetaAddress: mayflowerMarketMeta,
    owner: xeenonPosition,
  });

  const escrow: PublicKey = mayflowerPda.personalPositionEscrow({
    personalPositionAddress: mayflowerPosition,
  });

  const mintToken = new PublicKey(token.address);
  const mayflowerMarketAddress = new PublicKey(
    token.market.mayflowerMarketAddress
  );
  const mintOptions: PublicKey = mayflowerPda.mintOptions({
    marketMetaAddress: mayflowerMarketMeta,
  });
  const liqVaultMain: PublicKey = mayflowerPda.liqVaultMain({
    marketMetaAddress: mayflowerMarketMeta,
  });
  const revEscrowGroup: PublicKey = mayflowerPda.revEscrowGroup({
    marketMetaAddress: mayflowerMarketMeta,
  });
  const revEscrowTenant: PublicKey = mayflowerPda.revEscrowTenant({
    marketMetaAddress: mayflowerMarketMeta,
  });

  const mintMain = new PublicKey(ENV.CREDIEZ_ADDRESS);

  const tenant = new PublicKey(ENV.TENANT_ADDRESS);

  return {
    escrow,
    mintOptions,
    liqVaultMain,
    revEscrowGroup,
    revEscrowTenant,
    mayflowerPosition,
    xeenonPosition,
    xeenonMarket,
    mayflowerMarketMeta,
    mayflowerProgramId,
    xeenonProgramId,
    mayflowerMarketAddress,
    mintToken,
    xeenonMarketGroup,
    mintMain,
    mayflowerMarketGroup,
    tenant,
    xeenonPda,
    payer,
  };
};
