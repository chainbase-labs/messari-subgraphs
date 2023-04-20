import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Conversion,
  ConversionFeeUpdate,
  LiquidityAdded,
  LiquidityRemoved,
} from "../../generated/templates/Converter/ConverterBase";
import {
  Deposit,
  LiquidityPool,
  Swap,
  Token,
  Withdraw,
} from "../../generated/schema";
import {
  convertToExp18,
  fetchTokenBalance,
  getOrCreateLiquidityPool,
  getOrCreateToken,
  ZERO_BD,
} from "./helper";

// Converter events
export function handleConversion(event: Conversion): void {
  const swapID = "swap-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());

  const fromToken = getOrCreateToken(event.params._fromToken) as Token;
  const toToken = getOrCreateToken(event.params._toToken) as Token;

  const fromAmount = convertToExp18(event.params._amount, fromToken.decimals);
  const toAmount = convertToExp18(event.params._return, toToken.decimals);

  const poolAddress = event.address;
  let pair = LiquidityPool.load(poolAddress.toHexString());
  if (!pair) {
    log.warning(
      "When Swap, Pool not exist in store,pool: {}, blockNumber: {}, txHash: {}, logIndex: {}",
      [
        poolAddress.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.logIndex.toString(),
      ]
    );
  }
  pair = getOrCreateLiquidityPool(
    Address.zero().toHexString(),
    poolAddress,
    event.block.timestamp,
    event.block.number
  );

  const tokens = pair.inputTokens;
  const fromIndex = tokens.indexOf(fromToken.id);
  const toIndex = tokens.indexOf(toToken.id);
  const fromBalanceAfterSwap = convertToExp18(
    fetchTokenBalance(
      Address.fromString(fromToken.id),
      Address.fromString(pair.id)
    ),
    fromToken.decimals
  );
  const toBalanceAfterSwap = convertToExp18(
    fetchTokenBalance(
      Address.fromString(toToken.id),
      Address.fromString(pair.id)
    ),
    toToken.decimals
  );
  const balances = pair.inputTokenBalances;
  balances[fromIndex] = BigInt.fromString(fromBalanceAfterSwap.toString());
  balances[toIndex] = BigInt.fromString(toBalanceAfterSwap.toString());
  pair.inputTokenBalances = balances;

  const fromBalancebeforSwap = fromBalanceAfterSwap.plus(fromAmount);
  const toBalancebeforeSwap = toBalanceAfterSwap.minus(toAmount);
  const originlPrice = fromBalancebeforSwap.div(toBalancebeforeSwap);
  const actualPrice = fromAmount.div(toAmount);
  const slippage = originlPrice.minus(actualPrice).div(originlPrice);

  let swap = Swap.load(swapID);
  if (!swap) {
    swap = new Swap(swapID);
    swap.hash = event.transaction.hash.toHexString();
    swap.from = event.transaction.from.toHexString();
    swap.to = event.params._trader.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap._trader = event.transaction.from.toHexString();
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = fromToken.id;
    swap.amountIn = BigInt.fromString(fromAmount.toString());
    swap.tokenOut = toToken.id;
    swap.amountOut = BigInt.fromString(toAmount.toString());
    swap.pool = pair.id;
    swap._conversionFee = event.params._conversionFee;
    swap._price = actualPrice;
    swap._inversePrice = toAmount.div(fromAmount);
    swap._slippage = slippage;

    swap.protocol = pair.protocol;
    swap.blockNumber = event.block.number;
    swap.amountInUSD = ZERO_BD;
    swap.amountOutUSD = ZERO_BD;
    swap._isBancorNetwork = false;
  }
  //save
  pair.save();
  swap.save();
  fromToken.save();
  toToken.save();
}

export function handleConversionFeeUpdate(event: ConversionFeeUpdate): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  // pool.fees[] = event.params._newFee;
  // pool.save();
}

export function handleLiquidityAdded(event: LiquidityAdded): void {
  const poolAddress = event.address;
  let pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    log.warning(
      "When Deposit, Pool not exist in store,pool: {}, blockNumber: {}, txHash: {}, logIndex: {}",
      [
        poolAddress.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.logIndex.toString(),
      ]
    );
  }
  pool = getOrCreateLiquidityPool(
    Address.zero().toHexString(),
    poolAddress,
    event.block.timestamp,
    event.block.number
  );
  const tokenAddress = event.params._reserveToken;
  const token = getOrCreateToken(tokenAddress) as Token;

  const amount = convertToExp18(event.params._amount, token.decimals);

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const depositId = transactionHash
    .concat("-")
    .concat(event.logIndex.toString());
  let deposit = Deposit.load(depositId);
  let tokens: Array<string> = [];
  let amounts: Array<BigInt> = [];
  if (!deposit) {
    deposit = new Deposit(depositId);
    deposit.hash = transactionHash;
    deposit.logIndex = logIndexI32;
    deposit.protocol = pool.protocol;
    deposit.blockNumber = event.block.number;
    deposit.timestamp = event.block.timestamp;
    deposit.to = pool.id;
    deposit.from = event.params._provider.toHexString();
    deposit.outputToken = pool.outputToken;
    deposit.outputTokenAmount = event.params._newSupply;
    pool.outputTokenSupply = pool.outputTokenSupply!.plus(
      event.params._newSupply
    );
    deposit.amountUSD = ZERO_BD;
    deposit.pool = pool.id;
  } else {
    tokens = deposit.inputTokens;
    amounts = deposit.inputTokenAmounts;
  }
  tokens.push(token.id);
  amounts.push(BigInt.fromString(amount.toString()));
  deposit.inputTokens = tokens;
  deposit.inputTokenAmounts = amounts;

  const idx = pool.inputTokens.indexOf(token.id);
  const balances = pool.inputTokenBalances;
  balances[idx] = BigInt.fromString(
    convertToExp18(event.params._newBalance, token.decimals).toString()
  );
  pool.inputTokenBalances = balances;

  deposit.save();
  pool.save();
}

export function handleLiquidityRemoved(event: LiquidityRemoved): void {
  const poolAddress = event.address;
  let pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    log.warning(
      "When Withdraw, Pool not exist in store,pool: {}, blockNumber: {}, txHash: {}, logIndex: {}",
      [
        poolAddress.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.logIndex.toString(),
      ]
    );
  }
  pool = getOrCreateLiquidityPool(
    Address.zero().toHexString(),
    poolAddress,
    event.block.timestamp,
    event.block.number
  );

  const tokenAddress = event.params._reserveToken;
  const token = getOrCreateToken(tokenAddress) as Token;

  const amount = convertToExp18(event.params._amount, token.decimals);

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const withdrawalId = transactionHash
    .concat("-")
    .concat(event.logIndex.toString());
  let withdrawal = Withdraw.load(withdrawalId);
  let tokens: Array<string> = [];
  let amounts: Array<BigInt> = [];
  if (!withdrawal) {
    withdrawal = new Withdraw(withdrawalId);
    withdrawal.hash = transactionHash;
    withdrawal.logIndex = logIndexI32;
    withdrawal.protocol = pool.protocol;
    withdrawal.blockNumber = event.block.number;
    withdrawal.timestamp = event.block.timestamp;
    withdrawal.from = pool.id;
    withdrawal.to = event.params._provider.toHexString();
    withdrawal.outputToken = pool.outputToken;
    withdrawal.outputTokenAmount = event.params._newSupply;
    pool.outputTokenSupply = pool.outputTokenSupply!.minus(
      event.params._newSupply
    );
    withdrawal.amountUSD = ZERO_BD;
    withdrawal.pool = pool.id;
  } else {
    tokens = withdrawal.inputTokens;
    amounts = withdrawal.inputTokenAmounts;
  }
  tokens.push(token.id);
  amounts.push(BigInt.fromString(amount.toString()));
  withdrawal.inputTokens = tokens;
  withdrawal.inputTokenAmounts = amounts;

  const idx = pool.inputTokens.indexOf(token.id);
  const balances = pool.inputTokenBalances;
  balances[idx] = BigInt.fromString(
    convertToExp18(event.params._newBalance, token.decimals).toString()
  );
  pool.inputTokenBalances = balances;

  withdrawal.save();
  pool.save();
}
