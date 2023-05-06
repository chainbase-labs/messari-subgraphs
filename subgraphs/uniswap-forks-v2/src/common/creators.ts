// import { log } from "@graphprotocol/graph-ts";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { NetworkConfigs } from "../../configurations/configure";
import {
  Deposit,
  LiquidityPool,
  Swap as SwapEvent,
  Token,
  Withdraw,
} from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import {
  BIGDECIMAL_FIFTY_PERCENT,
  BIGINT_NEG_ONE,
  BIGINT_ZERO,
  INT_ONE,
  INT_ZERO,
} from "./constants";
import {
  getLiquidityPool,
  getOrCreateLPToken,
  getOrCreateToken,
  getOrCreateTransfer,
} from "./getters";

/**
 * Create the fee for a pool depending on the the protocol and network specific fee structure.
 * Specified in the typescript configuration file.
 */

// Create a liquidity pool from PairCreated event emission.
export function createLiquidityPool(
  event: ethereum.Event,
  poolAddress: string,
  token0Address: string,
  token1Address: string
): void {
  // create the tokens and tokentracker
  const token0 = getOrCreateToken(event, token0Address);
  const token1 = getOrCreateToken(event, token1Address);
  const LPtoken = getOrCreateLPToken(poolAddress, token0, token1);

  const pool = new LiquidityPool(poolAddress);
  pool.name = NetworkConfigs.getProtocolName() + " " + LPtoken.symbol;
  pool.symbol = LPtoken.symbol;
  pool.inputTokens = [token0.id, token1.id];
  pool.outputToken = LPtoken.id;
  pool.isSingleSided = false;
  pool.createdTimestamp = event.block.timestamp;
  pool.createdBlockNumber = event.block.number;
  pool.inputTokenBalances = [BIGINT_ZERO, BIGINT_ZERO];
  pool.inputTokenWeights = [BIGDECIMAL_FIFTY_PERCENT, BIGDECIMAL_FIFTY_PERCENT];
  pool.outputTokenSupply = BIGINT_ZERO;

  // Create and track the newly created pool contract based on the template specified in the subgraph.yaml file.
  PairTemplate.create(Address.fromString(poolAddress));

  pool.save();
  token0.save();
  token1.save();
  LPtoken.save();
}

// Create a Deposit entity and update deposit count on a Mint event for the specific pool..
export function createDeposit(
  event: ethereum.Event,
  amount0: BigInt,
  amount1: BigInt
): void {
  const transfer = getOrCreateTransfer(event);

  const pool = getLiquidityPool(event.address.toHexString());

  const token0 = getOrCreateToken(event, pool.inputTokens[INT_ZERO]);
  const token1 = getOrCreateToken(event, pool.inputTokens[INT_ONE]);

  token0.save();
  token1.save();

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const deposit = new Deposit(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  deposit.hash = transactionHash;
  deposit.logIndex = logIndexI32;
  deposit.to = pool.id;
  deposit.from = transfer.sender!;
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.inputTokens = [pool.inputTokens[INT_ZERO], pool.inputTokens[INT_ONE]];
  deposit.outputToken = pool.outputToken;
  deposit.inputTokenAmounts = [amount0, amount1];
  deposit.outputTokenAmount = transfer.liquidity;
  deposit.pool = pool.id;
  deposit._walletAddress = transfer.sender!;

  deposit.save();
}

// Create a Withdraw entity on a Burn event for the specific pool..
export function createWithdraw(
  event: ethereum.Event,
  amount0: BigInt,
  amount1: BigInt
): void {
  const transfer = getOrCreateTransfer(event);

  const pool = getLiquidityPool(event.address.toHexString());

  const token0 = getOrCreateToken(event, pool.inputTokens[INT_ZERO]);
  const token1 = getOrCreateToken(event, pool.inputTokens[INT_ONE]);

  token0.save();
  token1.save();

  // update exchange info (except balances, sync will cover that)
  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const withdrawal = new Withdraw(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  withdrawal.hash = transactionHash;
  withdrawal.logIndex = logIndexI32;
  withdrawal.to = transfer.sender!;
  withdrawal.from = pool.id;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.inputTokens = [
    pool.inputTokens[INT_ZERO],
    pool.inputTokens[INT_ONE],
  ];
  withdrawal.outputToken = pool.outputToken;
  withdrawal.inputTokenAmounts = [amount0, amount1];
  withdrawal.outputTokenAmount = transfer.liquidity;
  withdrawal.pool = pool.id;
  withdrawal._walletAddress = transfer.sender!;

  withdrawal.save();
}

// Handle swaps data and update entities volumes and fees
export function createSwapHandleVolumeAndFees(
  event: ethereum.Event,
  to: string,
  sender: string,
  amount0In: BigInt,
  amount1In: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt
): void {
  if (amount0Out.gt(BIGINT_ZERO) && amount1Out.gt(BIGINT_ZERO)) {
    // If there are two output tokens with non-zero values, this is an invalid swap. Ignore it.
    log.error(
      "Two output tokens - Invalid Swap: amount0Out: {} amount1Out: {}",
      [amount0Out.toString(), amount1Out.toString()]
    );
    return;
  }

  const pool = getLiquidityPool(event.address.toHexString());

  const token0 = getOrCreateToken(event, pool.inputTokens[0]);
  const token1 = getOrCreateToken(event, pool.inputTokens[1]);

  // Gets the tokenIn and tokenOut payload based on the amounts
  const swapTokens = getSwapTokens(
    token0,
    token1,
    amount0In,
    amount0Out,
    amount1In,
    amount1Out
  );

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const swap = new SwapEvent(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  // update swap event
  swap.hash = transactionHash;
  swap.logIndex = logIndexI32;
  swap.to = to;
  swap.from = sender;
  swap.blockNumber = event.block.number;
  swap.timestamp = event.block.timestamp;
  swap.tokenIn = swapTokens.tokenIn.id;
  swap.amountIn = swapTokens.amountIn;
  swap.tokenOut = swapTokens.tokenOut.id;
  swap.amountOut = swapTokens.amountOut;
  swap.pool = pool.id;
  swap._walletAddress = to;

  swap.save();
}

class SwapTokens {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: BigInt;
  amountOut: BigInt;
}

// The purpose of this function is to identity input and output tokens for a swap event
export function getSwapTokens(
  token0: Token,
  token1: Token,
  amount0In: BigInt,
  amount0Out: BigInt,
  amount1In: BigInt,
  amount1Out: BigInt
): SwapTokens {
  let tokenIn: Token;
  let tokenOut: Token;
  let amountIn: BigInt;
  let amountOut: BigInt;

  if (amount0Out.gt(BIGINT_ZERO)) {
    tokenIn = token1;
    tokenOut = token0;
    amountIn = amount1In.minus(amount1Out);
    amountOut = amount0In.minus(amount0Out).times(BIGINT_NEG_ONE);
  } else {
    tokenIn = token0;
    tokenOut = token1;
    amountIn = amount0In.minus(amount0Out);
    amountOut = amount1In.minus(amount1Out).times(BIGINT_NEG_ONE);
  }

  return {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
  };
}
