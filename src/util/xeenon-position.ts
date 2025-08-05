import { TransactionInstruction } from '@solana/web3.js';
import { Token } from './token';
import { getTokenPdas, TokenPdas } from './token-pdas';
import { loadKeypairFromEnv } from './wallet';
import { getXeenonProgram, XeenonPositionAccount } from './xeenon-program';
import BN from 'bn.js';
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { createATAInstruction } from './token-account';

export class XeenonPosition {
  readonly payer = loadKeypairFromEnv();
  readonly xeenonProgram = getXeenonProgram();
  readonly pdas: TokenPdas;
  constructor(readonly token: Token) {
    this.pdas = getTokenPdas(token);
  }

  /**
   * Creates the instructions to deposit tokens into the position, including the instructions to create or update the position.
   * @param tokensAmount The amount of tokens to deposit.
   * @returns The instructions to deposit tokens into the position.
   */
  async depositTokensInstruction(tokensAmount: BN) {
    const payerAta = getAssociatedTokenAddressSync(
      this.pdas.mintToken,
      this.payer.publicKey
    );
    const depositIx = await this.xeenonProgram.methods
      .depositToken(tokensAmount)
      .accounts({
        mayflowerMarket: this.pdas.mayflowerMarketAddress,
        mayflowerMarketMeta: this.pdas.mayflowerMarketMeta,
        payer: this.payer.publicKey,
        mintToken: this.pdas.mintToken,
        escrow: this.pdas.escrow,
        mayflowerPersonalPosition: this.pdas.mayflowerPosition,
        payerTokenAccount: payerAta,
        xeenonMarketGroup: this.pdas.xeenonMarketGroup,
        xeenonPosition: this.pdas.xeenonPosition,
        // Xeenon marked is supposed to be inferred, but it fails to do so the first time because the position is not created yet
        ...({ xeenonMarket: this.pdas.xeenonMarket } as any),
      })
      .instruction();
    const otherIxs = await this.createOrUpdatePositionInstruction();
    return [...otherIxs, depositIx];
  }

  /**
   * Creates the instructions to withdraw tokens from the position, including the instructions to update the position.
   * @param tokensAmount The amount of tokens to withdraw.
   * @returns The instructions to withdraw tokens from the position.
   */
  async withdrawTokensInstruction(tokensAmount: BN) {
    const position = await this.loadPosition();
    if (!position) throw new Error('Position not found');
    const { ata: payerTokenAccount, ix: payerTokenAccountIx } =
      await createATAInstruction(this.pdas.mintToken, this.payer.publicKey);
    const depositIx = await this.xeenonProgram.methods
      .withdrawToken(tokensAmount)
      .accounts({
        escrow: this.pdas.escrow,
        mayflowerMarket: this.pdas.mayflowerMarketAddress,
        mayflowerMarketMeta: this.pdas.mayflowerMarketMeta,
        mayflowerPersonalPosition: this.pdas.mayflowerPosition,
        mintToken: this.pdas.mintToken,
        xeenonPosition: this.pdas.xeenonPosition,
        payer: this.payer.publicKey,
        xeenonMarketGroup: this.pdas.xeenonMarketGroup,
        payerTokenAccount,
        // Xeenon marked is supposed to be inferred, but it fails to do so the first time because the position is not created yet
        ...({ xeenonMarket: this.pdas.xeenonMarket } as any),
      })
      .instruction();
    const otherIxs = await this.updatePositionInstruction(position);
    return [...otherIxs, payerTokenAccountIx, depositIx];
  }

  /**
   * Creates the instructions to borrow CREDIEZ using the position as collateral.
   * @param borrowAmount The amount of CREDIEZ to borrow.
   * @returns The instructions to borrow CREDIEZ using the position as collateral.
   */
  async borrowInstruction(borrowAmount: BN) {
    const { ata: payerTokenAccount, ix: payerTokenAccountIx } =
      await createATAInstruction(this.pdas.mintMain, this.payer.publicKey);
    const depositIx = await this.xeenonProgram.methods
      .borrow(borrowAmount)
      .accounts({
        mayflowerMarket: this.pdas.mayflowerMarketAddress,
        mayflowerMarketMeta: this.pdas.mayflowerMarketMeta,
        xeenonPosition: this.pdas.xeenonPosition,
        payer: this.payer.publicKey,
        liqVaultMain: this.pdas.liqVaultMain,
        mintMain: this.pdas.mintMain,
        tokenProgramMain: TOKEN_PROGRAM_ID,
        mayflowerPersonalPosition: this.pdas.mayflowerPosition,
        payerTokenAccount,
        mayflowerMarketGroup: this.pdas.mayflowerMarketGroup,
        mayflowerTenant: this.pdas.tenant,
        revEscrowGroup: this.pdas.revEscrowGroup,
        revEscrowTenant: this.pdas.revEscrowTenant,
        // Xeenon market is supposed to be inferred, but it fails to do so the first time because the position is not created yet
        ...({
          xeenonMarket: this.pdas.xeenonMarket,
        } as any),
      })
      .instruction();

    return [payerTokenAccountIx, depositIx];
  }

  /**
   * Creates the instructions to repay a CREDIEZ loan.
   * @param repayAmount The amount of CREDIEZ to repay.
   * @returns The instructions to repay a CREDIEZ loan.
   */
  async repayInstruction(repayAmount: BN) {
    const { ata: payerTokenAccount, ix: payerTokenAccountIx } =
      await createATAInstruction(this.pdas.mintMain, this.payer.publicKey);
    const depositIx = await this.xeenonProgram.methods
      .repay(repayAmount)
      .accounts({
        mayflowerMarket: this.pdas.mayflowerMarketAddress,
        mayflowerMarketMeta: this.pdas.mayflowerMarketMeta,
        xeenonPosition: this.pdas.xeenonPosition,
        payer: this.payer.publicKey,
        liqVaultMain: this.pdas.liqVaultMain,
        mintMain: this.pdas.mintMain,
        tokenProgramMain: TOKEN_PROGRAM_ID,
        mayflowerPersonalPosition: this.pdas.mayflowerPosition,
        payerTokenAccount,
        // Xeenon market is supposed to be inferred, but it fails to do so the first time because the position is not created yet
        ...({
          xeenonMarket: this.pdas.xeenonMarket,
        } as any),
      })
      .instruction();

    return [payerTokenAccountIx, depositIx];
  }

  async createOrUpdatePositionInstruction() {
    const position = await this.loadPosition();
    if (!position) {
      const createPositionIx = await this.createPositionInstruction();
      return [createPositionIx];
    }
    return this.updatePositionInstruction(position);
  }

  async updatePositionInstruction(
    userPosition: XeenonPositionAccount['account']
  ) {
    const market = await this.xeenonProgram.account.xeenonMarket.fetch(
      this.pdas.xeenonMarket
    );
    const currentPeriod = new BN(market.currentPeriod, 10, 'le').toNumber();

    const positionPeriod = new BN(
      userPosition.lastSeenPeriod,
      10,
      'le'
    ).toNumber();

    if (positionPeriod >= currentPeriod) return [];
    const instructions: TransactionInstruction[] = [];
    // Update position period
    for (let i = positionPeriod; i < currentPeriod; i++) {
      const marketPeriod = this.pdas.xeenonPda.xeenonMarketPeriodPda(
        this.pdas.xeenonMarket,
        i
      );
      const positionIx = await this.xeenonProgram.methods
        .accruePositionRewards(i)
        .accounts({
          payer: this.payer.publicKey,
          xeenonPosition: this.pdas.xeenonPosition,
          marketPeriod,
          ...({
            xeenonMarket: this.pdas.xeenonMarket,
          } as any),
        })
        .instruction();
      instructions.push(positionIx);
    }
    return instructions;
  }

  async createPositionInstruction() {
    const positionIx = await this.xeenonProgram.methods
      .initXeenonPosition()
      .accounts({
        mayflowerMarketMeta: this.pdas.mayflowerMarketMeta,
        xeenonMarket: this.pdas.xeenonMarket,
        payer: this.payer.publicKey,
        escrow: this.pdas.escrow,
        mayflowerPersonalPosition: this.pdas.mayflowerPosition,
        mintToken: this.pdas.mintToken,
      })
      .instruction();
    return positionIx;
  }

  async loadPosition() {
    try {
      const position = await this.xeenonProgram.account.xeenonPosition.fetch(
        this.pdas.xeenonPosition
      );
      return position;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Account does not exist')
      ) {
        return null;
      }
      throw error;
    }
  }
}
