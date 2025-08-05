import BN from 'bn.js';
import { Decimal } from 'decimal.js';

/** CREDIEZ and XEENON tokens use 6 decimals */
const TOKEN_DECIMALS = 6;

export const bigIntToUI = (
  bigInt: bigint | string | number | BN,
  decimals = TOKEN_DECIMALS
) => {
  const decimal = new Decimal(bigInt.toString());
  const denom = new Decimal(10 ** decimals);
  return decimal.div(denom).toNumber();
};

export const uiToBigInt = (
  value: number | string | BN,
  decimals = TOKEN_DECIMALS
) => {
  const n = new Decimal(value.toString());
  const scale = new Decimal(10).pow(decimals);
  const total = n.mul(scale).toDecimalPlaces(0).toString();
  return BigInt(total);
};

export const uiToBN = (
  value: number | string | BN,
  decimals = TOKEN_DECIMALS
) => {
  const total = uiToBigInt(value, decimals);
  return new BN(total.toString());
};
