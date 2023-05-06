import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { getLiquidityPool } from "./getters";

// Upate token balances based on reserves emitted from the Sync event.
export function updateInputTokenBalances(
  event: ethereum.Event,
  poolAddress: string,
  reserve0: BigInt,
  reserve1: BigInt
): void {
  const pool = getLiquidityPool(poolAddress);
  pool.inputTokenBalances = [reserve0, reserve1];

  pool.save();
}
