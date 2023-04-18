import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Conversion,
  ConversionFeeUpdate,
  ConverterContract,
  ManagerUpdate,
  OwnerUpdate as ConverterOwnerUpdate,
  PriceDataUpdate,
  UpgradeCall,
  VirtualBalancesEnable,
} from "../../generated/templates/ConverterContract/ConverterContract";
import { LiquidityPool, Swap, Token } from "../../generated/schema";
import {
  convertToExp18,
  fetchConverterConnectorTokens,
  fetchTokenBalance,
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

  const pair = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pair) {
    return;
  }
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
  }

  //save
  pair.save();
  swap.save();
  fromToken.save();
  toToken.save();
}

export function handlePriceDataUpdate(event: PriceDataUpdate): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  pool._weight = event.params._connectorWeight;
  const tokenAddress = event.params._connectorToken;
  const token = getOrCreateToken(tokenAddress) as Token;
  const index = pool.inputTokens.indexOf(tokenAddress.toHexString());
  pool.inputTokenBalances[index] = BigInt.fromString(
    convertToExp18(event.params._connectorBalance, token.decimals).toString()
  );

  const converterContract = ConverterContract.bind(Address.fromString(pool.id));
  const smartTokenAddress = converterContract.token();
  const smartToken = getOrCreateToken(smartTokenAddress) as Token;
  pool.outputTokenSupply = BigInt.fromString(
    convertToExp18(event.params._tokenSupply, smartToken.decimals).toString()
  );

  pool.save();
}

export function handleConversionFeeUpdate(event: ConversionFeeUpdate): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  pool._conversionFee = event.params._newFee;
  pool.save();
}

export function handleManagerUpdate(event: ManagerUpdate): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  pool._manager = event.params._newManager.toHexString();
  pool.save();
}

export function handleConverterOwnerUpdate(event: ConverterOwnerUpdate): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  pool._owner = event.params._newOwner.toHexString();
  pool.save();
}

export function handleUpgrade(call: UpgradeCall): void {}

export function handleVirtualBalancesEnable(
  event: VirtualBalancesEnable
): void {
  const pool = LiquidityPool.load(event.address.toHexString()) as LiquidityPool;
  if (!pool) {
    return;
  }
  fetchConverterConnectorTokens(Address.fromString(pool.id));
}
