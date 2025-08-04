import {
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { getConnection } from './connection';
import { loadKeypairFromEnv } from './wallet';

export const sendAndConfirmTransactionWithPriorityFee = async (
  tx: Transaction,
  priorityFee?: PriorityFee | 'none'
) => {
  const connection = getConnection();
  const wallet = loadKeypairFromEnv();
  const latestBlockHash = await connection.getLatestBlockhash();
  if (!tx.recentBlockhash) {
    tx.recentBlockhash = latestBlockHash.blockhash;
    tx.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
  }
  if (!tx.feePayer) {
    tx.feePayer = wallet.publicKey;
  }
  try {
    if (priorityFee !== 'none') {
      await addPriorityFee(tx, priorityFee);
    }
  } catch (error) {}

  return sendAndConfirmTransaction(connection, tx, [wallet], {
    maxRetries: 3,
  });
};

type GetPriorityFeeEstimateResponse = {
  jsonrpc: '2.0';
  id: string;
  result: {
    priorityFeeLevels: {
      min: number;
      low: number;
      medium: number;
      high: number;
      veryHigh: number;
      unsafeMax: number;
    };
  };
};
export type PriorityFee =
  keyof GetPriorityFeeEstimateResponse['result']['priorityFeeLevels'];

const getPriorityFeeEstimate = async (tx: Transaction) => {
  try {
    const connection = getConnection();
    const res = await fetch(connection.rpcEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getPriorityFeeEstimate',
        params: [
          {
            transaction: bs58.encode(
              tx.serialize({ requireAllSignatures: false })
            ),
            options: {
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Failed to get priority fee estimate: ${res.statusText}`);
    }
    const data = (await res.json()) as GetPriorityFeeEstimateResponse;
    return data.result;
  } catch (error) {
    console.error('Failed to get priority fee estimate:', error);
    return null;
  }
};

export const addPriorityFee = async (
  tx: Transaction,
  selectedPriorityFee: PriorityFee = 'high'
) => {
  const feeEstimate = await getPriorityFeeEstimate(tx);

  // Add null check for feeEstimate
  if (!feeEstimate || !feeEstimate.priorityFeeLevels) {
    console.warn('Failed to get priority fee estimate, using default values');
    const defaultFee = 1000; // Default to 1000 microLamports
    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: defaultFee,
    });
    tx.add(computePriceIx);
    return;
  }

  const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: feeEstimate.priorityFeeLevels[selectedPriorityFee],
  });

  tx.add(computePriceIx);
};
