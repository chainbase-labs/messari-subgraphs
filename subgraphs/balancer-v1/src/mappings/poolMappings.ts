import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  GulpCall,
  LOG_CALL,
  LOG_EXIT,
  LOG_JOIN,
  LOG_SWAP,
  Transfer,
} from "../../generated/templates/Pool/Pool";
import { Deposit, Swap, Withdraw } from "../../generated/schema";
import {
  decrPoolCount,
  getCrpUnderlyingPool,
  getOrCreateLiquidityPool,
  getOrCreateProtocol,
  getOrCreateTokenEntity,
  hexToDecimal,
} from "./helpers";
import {
  ConfigurableRightsPool,
  OwnershipTransferred,
} from "../../generated/Factory/ConfigurableRightsPool";
import * as constants from "../../src/common/constants";
import { BIGDECIMAL_ZERO, BIGINT_ZERO } from "../../src/common/constants";

/************************************
 ********** Pool Controls ***********
 ************************************/

export function handleSetSwapFee(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  const swapFee = hexToDecimal(event.params.data.toHexString().slice(-40), 0);

  pool._swapFee = swapFee;
  pool.save();
}

export function handleSetController(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);
  const controller = Address.fromString(
    event.params.data.toHexString().slice(-40)
  );

  pool._controller = controller;
  pool.save();
}

export function handleSetCrpController(event: OwnershipTransferred): void {
  // This event occurs on the CRP contract rather than the underlying pool so we must perform a lookup.
  const crp = ConfigurableRightsPool.bind(event.address);
  const crpPool = getCrpUnderlyingPool(crp);
  if (crpPool !== null) {
    const pool = getOrCreateLiquidityPool(crpPool, event.block);

    pool._crpController = event.params.newOwner;
    pool.save();
    // We overwrite event address so that ownership transfers can be linked to Pool entities for above reason.
    event.address = Address.fromString(pool.id);
  }
}

export function handleSetPublicSwap(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);
  const publicSwap = event.params.data.toHexString().slice(-1) == "1";

  pool._publicSwap = publicSwap;
  pool.save();
}

export function handleFinalize(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  pool._finalized = true;
  pool.symbol = "BPT";
  pool._publicSwap = true;
  pool.save();

  const factory = getOrCreateProtocol(constants.FACTORY_ADDRESS.toHexString());

  factory._finalizedPoolCount = factory._finalizedPoolCount + 1;
  factory.save();
}

export function handleRebind(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  const tokenAddress = Address.fromString(
    event.params.data.toHexString().slice(34, 74)
  );
  const inputTokens = pool.inputTokens || [];
  const idx = inputTokens.indexOf(tokenAddress.toHexString());

  const token = getOrCreateTokenEntity(tokenAddress);
  const inputTokenWeights = pool.inputTokenWeights;
  const inputTokenBalances = pool.inputTokenBalances;
  const denormWeight = hexToDecimal(
    event.params.data.toHexString().slice(138),
    0
  );
  const balance = BigInt.fromString(
    hexToDecimal(event.params.data.toHexString().slice(74, 138), 0).toString()
  );
  if (idx == -1) {
    inputTokens.push(token.id);
    inputTokenWeights.push(denormWeight);
    inputTokenBalances.push(balance);
    pool.inputTokens = inputTokens;
    pool.inputTokenWeights = inputTokenWeights;
    pool.inputTokenBalances = inputTokenBalances;
    pool._totalWeight = pool._totalWeight.plus(denormWeight);
  } else {
    const oldWeight = inputTokenWeights.at(idx);
    if (denormWeight.gt(oldWeight)) {
      pool._totalWeight = pool._totalWeight.plus(denormWeight.minus(oldWeight));
    } else {
      pool._totalWeight = pool._totalWeight.minus(
        oldWeight.minus(denormWeight)
      );
    }
    inputTokenWeights[idx] = denormWeight;
    inputTokenBalances[idx] = balance;
  }

  if (balance.equals(constants.BIGINT_ZERO)) {
    decrPoolCount(pool._active, pool._finalized, pool._crp);
    pool._active = false;
  }
  pool._tokensCount = BigInt.fromI32(inputTokens.length);
  pool.save();
}

export function handleUnbind(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  const tokenAddress = "0x" + event.params.data.toHexString().slice(-40);
  const tokensList = pool.inputTokens;
  const idx = tokensList.indexOf(tokenAddress);
  tokensList.splice(idx, 1);
  pool.inputTokens = tokensList;
  pool._tokensCount = BigInt.fromI32(tokensList.length);

  const weight = pool.inputTokenWeights.at(idx);
  pool._totalWeight = pool._totalWeight.minus(weight);
  const weights = pool.inputTokenWeights;
  weights.splice(idx, 1);
  const balances = pool.inputTokenBalances;
  balances.splice(idx, 1);
  pool.inputTokenWeights = weights;
  pool.inputTokenBalances = balances;
  pool.save();
}

export function handleGulp(call: GulpCall): void {}

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  pool._joinsCount = pool._joinsCount.plus(constants.BIGINT_ONE);
  const tokenAddress = event.params.tokenIn;
  const token = getOrCreateTokenEntity(tokenAddress);

  const idx = pool.inputTokens.indexOf(token.id);

  const tokenAmountIn = event.params.tokenAmountIn;
  const newAmount = pool.inputTokenBalances.at(idx).plus(tokenAmountIn);
  const balances = pool.inputTokenBalances;
  balances[idx] = newAmount;
  pool.inputTokenBalances = balances;
  pool.save();

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const deposit = new Deposit(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  deposit.hash = transactionHash;
  deposit.logIndex = logIndexI32;
  deposit.protocol = pool.protocol;
  deposit.to = pool.id;
  deposit.from = event.params.caller.toHexString();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.inputTokens = [token.id];
  deposit.outputToken = pool.outputToken;
  deposit.inputTokenAmounts = [tokenAmountIn];
  deposit.outputTokenAmount = BIGINT_ZERO;
  deposit.amountUSD = BIGDECIMAL_ZERO;
  deposit.pool = pool.id;

  deposit.save();
}

export function handleExitPool(event: LOG_EXIT): void {
  const poolId = event.address.toHex();
  const token = getOrCreateTokenEntity(event.params.tokenOut);
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  const tokenAmountOut = event.params.tokenAmountOut;
  const idx = pool.inputTokens.indexOf(token.id);
  const newAmount = pool.inputTokenBalances.at(idx).minus(tokenAmountOut);
  const balances = pool.inputTokenBalances;
  balances[idx] = newAmount;
  pool.inputTokenBalances = balances;
  pool._exitsCount = pool._exitsCount.plus(constants.BIGINT_ONE);
  if (newAmount.equals(constants.BIGINT_ZERO)) {
    decrPoolCount(pool._active, pool._finalized, pool._crp);
    pool._active = false;
  }
  pool.save();

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const withdrawal = new Withdraw(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  withdrawal.hash = transactionHash;
  withdrawal.logIndex = logIndexI32;
  withdrawal.protocol = pool.protocol;
  withdrawal.to = event.params.caller.toHexString();
  withdrawal.from = pool.id;
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.inputTokens = [token.id];
  withdrawal.outputToken = pool.outputToken;
  withdrawal.inputTokenAmounts = [tokenAmountOut];
  withdrawal.outputTokenAmount = BIGINT_ZERO;
  withdrawal.amountUSD = BIGDECIMAL_ZERO;
  withdrawal.pool = pool.id;

  withdrawal.save();
}

/************************************
 ************** SWAPS ***************
 ************************************/

export function handleSwap(event: LOG_SWAP): void {
  const poolId = event.address.toHex();
  const pool = getOrCreateLiquidityPool(poolId, event.block);

  const tokenIn = event.params.tokenIn.toHex();
  const tokenInIdx = pool.inputTokens.indexOf(tokenIn);
  const tokenAmountIn = event.params.tokenAmountIn;
  const newAmountIn = pool.inputTokenBalances
    .at(tokenInIdx)
    .plus(tokenAmountIn);
  const balances = pool.inputTokenBalances;
  balances[tokenInIdx] = newAmountIn;

  const tokenOut = event.params.tokenOut.toHexString();
  const tokenOutIdx = pool.inputTokens.indexOf(tokenOut);
  const tokenAmountOut = event.params.tokenAmountOut;
  const newAmountOut = pool.inputTokenBalances
    .at(tokenOutIdx)
    .minus(tokenAmountOut);
  balances[tokenOutIdx] = newAmountOut;

  pool.inputTokenBalances = balances;

  const swapId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  let swap = Swap.load(swapId);
  if (!swap) {
    swap = new Swap(swapId);
  }

  pool._swapsCount = pool._swapsCount.plus(constants.BIGINT_ONE);

  if (
    newAmountIn.equals(constants.BIGINT_ZERO) ||
    newAmountOut.equals(constants.BIGINT_ZERO)
  ) {
    decrPoolCount(pool._active, pool._finalized, pool._crp);
    pool._active = false;
  }
  pool.save();

  const tokenInEntity = getOrCreateTokenEntity(Address.fromString(tokenIn));
  const tokenOutEntity = getOrCreateTokenEntity(Address.fromString(tokenOut));
  swap.hash = event.transaction.hash.toHexString();
  swap.logIndex = event.logIndex.toI32();
  const factory = getOrCreateProtocol(constants.FACTORY_ADDRESS.toHexString());

  swap.from = event.transaction.from.toHexString();
  swap.to = pool.id;

  swap.amountInUSD = constants.BIGDECIMAL_ZERO;
  swap.amountOutUSD = constants.BIGDECIMAL_ZERO;
  swap.blockNumber = event.block.number;
  swap.protocol = factory.id;
  swap._caller = event.params.caller;
  swap.tokenIn = tokenIn;
  swap._tokenInSym = tokenInEntity.symbol;
  swap.tokenOut = tokenOut;
  swap._tokenOutSym = tokenOutEntity.symbol;
  swap.amountIn = tokenAmountIn;
  swap.amountOut = tokenAmountOut;
  swap.pool = event.address.toHex();
  swap.timestamp = event.block.timestamp;
  swap.save();
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {}
