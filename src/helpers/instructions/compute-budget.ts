import { 
  TransactionInstruction,
  ComputeBudgetProgram
} from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BASE_COMPUTE_UNITS, LAMPORTS_TO_MICROLAMPORTS } from '../constants';


/**
 * Creates compute budget instructions with appropriate unit limit and price
 * @param priorityFeeSol - Priority fee in SOL
 * @returns Array of compute budget instructions
 */
export const createComputeBudgetInstructions = (priorityFeeSol: number): TransactionInstruction[] => {
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
    units: BASE_COMPUTE_UNITS 
  });

  const feeLamports = priorityFeeSol * LAMPORTS_PER_SOL;
  const unitPriceLamports = feeLamports / BASE_COMPUTE_UNITS;
  // Round to the nearest integer to avoid passing fractional microLamports,
  // which would cause BigInt conversion errors inside web3.js
  const computeUnitPrice = Math.round(unitPriceLamports * LAMPORTS_TO_MICROLAMPORTS);
  
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
    microLamports: computeUnitPrice
  });

  return [modifyComputeUnits, addPriorityFee];
}

