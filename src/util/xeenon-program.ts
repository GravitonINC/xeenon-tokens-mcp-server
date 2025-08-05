import { IdlAccounts, ProgramAccount } from '@coral-xyz/anchor';
import { Tokens, getTokensIdl } from '@graviton-inc/xeenon-tokens-program-idl';
import * as anchor from '@coral-xyz/anchor';
import { loadKeypairFromEnv } from './wallet';
import { getConnection } from './connection';
import { ENV } from './env';

export type XeenonMarketAccount = IdlAccounts<Tokens>['xeenonMarket'];
export type XeenonMarketGroupAccount = IdlAccounts<Tokens>['xeenonMarketGroup'];
export type XeenonPositionAccount = ProgramAccount<
  IdlAccounts<Tokens>['xeenonPosition']
>;

export const getXeenonProgram = () => {
  const keypair = loadKeypairFromEnv();
  const wallet = new anchor.Wallet(keypair);
  const connection = getConnection();

  const provider: anchor.Provider = new anchor.AnchorProvider(
    connection,
    wallet
  );

  const idl = getTokensIdl({
    xeenonProgramId: ENV.XEENON_PROGRAM_ID,
    mayflowerProgramId: ENV.MAYFLOWER_PROGRAM_ID,
  });
  return new anchor.Program<Tokens>(idl, provider);
};
