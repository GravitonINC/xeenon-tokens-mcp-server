import * as anchor from '@coral-xyz/anchor';
import BN from 'bn.js';

export class XeenonPda {
  constructor(private programId: anchor.web3.PublicKey) {}

  xeenonMarketGroupPda(mayflowerMarketGroup: anchor.web3.PublicKey) {
    const seeds = [
      Buffer.from('market_group'),
      mayflowerMarketGroup.toBuffer(),
    ];
    return anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      this.programId
    )[0];
  }

  xeenonMarketPda(mayflowerMarketMeta: anchor.web3.PublicKey) {
    const seeds = [Buffer.from('market'), mayflowerMarketMeta.toBuffer()];
    return anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      this.programId
    )[0];
  }

  xeenonMarketPeriodPda(
    xeenonMarket: anchor.web3.PublicKey,
    period: number | number[]
  ) {
    const periodSeed = Array.isArray(period)
      ? Buffer.from(period)
      : new BN(period).toArrayLike(Buffer, 'le', 2);
    const seeds = [
      Buffer.from('market_period'),
      xeenonMarket.toBuffer(),
      periodSeed,
    ];
    return anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      this.programId
    )[0];
  }

  xeenonPositionPda(
    xeenonMarket: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const seeds = [
      Buffer.from('position'),
      xeenonMarket.toBuffer(),
      owner.toBuffer(),
    ];
    return anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      this.programId
    )[0];
  }
}
