import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Deposit as DepositEntity,
  LiquidityPool,
  LiquidityPool as LiquidityPoolEntity,
  Swap as SwapEntity,
  Token,
  Withdraw as WithdrawEntity,
} from "../../../../generated/schema";
import {
  BuyShares,
  DODOSwap,
  SellShares,
  Transfer,
} from "../../../../generated/templates/DVM/DVM";
import { DPP, LpFeeRateChange } from "../../../../generated/templates/DPP/DPP";

import {
  SMART_ROUTE_ADDRESSES,
  TYPE_DPP_POOL,
} from "../../../../src/common/constant";
import {
  calculateLpFee,
  convertToExp18,
  getOrCreateLpToken,
  getPMMState,
  ONE_BI,
  ZERO_BD,
} from "./helpers";

export function handleDODOSwap(event: DODOSwap): void {
  const swapID = "swap-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());
  const pair = LiquidityPoolEntity.load(
    event.address.toHexString()
  ) as LiquidityPool;
  if (!pair) {
    return;
  }
  const pmmState = getPMMState(event.address);
  if (!pmmState) {
    return;
  }

  const fromToken = Token.load(event.params.fromToken.toHexString()) as Token;
  const toToken = Token.load(event.params.toToken.toHexString()) as Token;

  const fromAmount = convertToExp18(
    event.params.fromAmount,
    fromToken.decimals
  );
  const toAmount = convertToExp18(event.params.toAmount, toToken.decimals);

  let baseToken: Token,
    quoteToken: Token,
    baseVolume: BigDecimal,
    quoteVolume: BigDecimal,
    baseLpFee: BigDecimal,
    quoteLpFee: BigDecimal;
  if (fromToken.id == pair.inputTokens[0]) {
    log.info("in", []);
    baseToken = fromToken as Token;
    quoteToken = toToken as Token;
    baseVolume = fromAmount;
    quoteVolume = toAmount;

    baseLpFee = ZERO_BD;
    quoteLpFee = calculateLpFee(quoteVolume, pair._lpFeeRate);
  } else {
    baseToken = toToken as Token;
    quoteToken = fromToken as Token;
    baseVolume = toAmount;
    quoteVolume = fromAmount;

    baseLpFee = calculateLpFee(baseVolume, pair._lpFeeRate);
    quoteLpFee = ZERO_BD;
  }
  pair._i = pmmState.i;
  pair._k = pmmState.K;
  const baseTokenBalance = convertToExp18(pmmState.B, baseToken.decimals);
  const quoteTokenBalance = convertToExp18(pmmState.Q, quoteToken.decimals);
  pair.inputTokenBalances = [
    BigInt.fromString(baseTokenBalance.toString()),
    BigInt.fromString(quoteTokenBalance.toString()),
  ];
  pair._txCount = pair._txCount.plus(ONE_BI);
  pair._volumeBaseToken = pair._volumeBaseToken.plus(baseVolume);
  pair._volumeQuoteToken = pair._volumeQuoteToken.plus(quoteVolume);
  pair._feeBase = pair._feeBase.plus(baseLpFee);
  pair._feeQuote = pair._feeQuote.plus(quoteLpFee);

  //todo:更新pair的volumeUSD，feeUSD,lastTradePrice

  let swap = SwapEntity.load(swapID);
  if (!swap) {
    swap = new SwapEntity(swapID);
    swap.hash = event.transaction.hash.toHexString();
    swap.from = event.transaction.from.toHexString();
    swap.to = event.params.trader.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap._sender = event.params.trader;
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = fromToken.id;
    swap.amountIn = BigInt.fromString(fromAmount.toString());
    swap.tokenOut = toToken.id;
    swap.amountOut = BigInt.fromString(toAmount.toString());
    swap.pool = pair.id;
    swap._feeBase = baseLpFee;
    swap._feeQuote = quoteLpFee;
    swap._baseVolume = baseVolume;
    swap._quoteVolume = quoteVolume;
    swap._volumeUSD = ZERO_BD;

    swap.protocol = pair.protocol;
    swap.blockNumber = event.block.number;
    swap.amountInUSD = ZERO_BD;
    swap.amountOutUSD = ZERO_BD;
  }
  if (SMART_ROUTE_ADDRESSES.indexOf(event.params.trader.toHexString()) == -1) {
    fromToken._txCount = fromToken._txCount.plus(ONE_BI);
    fromToken._tradeVolume = fromToken._tradeVolume.plus(fromAmount);

    toToken._txCount = toToken._txCount.plus(ONE_BI);
    toToken._tradeVolume = toToken._tradeVolume.plus(toAmount);
  }
  //save
  pair.save();
  swap.save();
  baseToken.save();
  quoteToken.save();
}

export function handleBuyShares(event: BuyShares): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const pmmState = getPMMState(event.address);
  if (!pmmState) {
    return;
  }
  const baseToken = Token.load(pair.inputTokens[0]) as Token;
  const quoteToken = Token.load(pair.inputTokens[1]) as Token;

  const lpToken = getOrCreateLpToken(
    event.address,
    pair,
    event.block.timestamp
  );

  const baseAmount = convertToExp18(pmmState.B, baseToken.decimals).minus(
    pair.inputTokenBalances[0].toBigDecimal()
  );
  const quoteAmount = convertToExp18(pmmState.Q, quoteToken.decimals).minus(
    pair.inputTokenBalances[1].toBigDecimal()
  );

  const lpAmount = convertToExp18(
    event.params.increaseShares,
    lpToken.decimals
  );
  const balance = convertToExp18(event.params.totalShares, lpToken.decimals);

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const deposit = new DepositEntity(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  deposit.hash = transactionHash;
  deposit.logIndex = logIndexI32;
  deposit.protocol = pair.protocol;
  deposit.to = event.params.to.toHexString();
  deposit.from = event.transaction.from.toHexString();
  deposit._user = event.params.to.toHexString();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.inputTokens = [pair.inputTokens[0], pair.inputTokens[1]];
  deposit.outputToken = lpToken.id;
  deposit.inputTokenAmounts = [
    BigInt.fromString(baseAmount.toString()),
    BigInt.fromString(quoteAmount.toString()),
  ];
  baseToken._txCount = baseToken._txCount.plus(ONE_BI);
  quoteToken._txCount = quoteToken._txCount.plus(ONE_BI);
  lpToken._txCount = lpToken._txCount.plus(ONE_BI);
  lpToken._totalSupply = lpToken._totalSupply.plus(
    BigInt.fromString(lpAmount.toString())
  );

  deposit.outputTokenAmount = BigInt.fromString(lpAmount.toString());
  deposit.pool = pair.id;
  deposit.amountUSD = ZERO_BD;
  const baseTokenBalance = BigInt.fromString(
    convertToExp18(pmmState.B, baseToken.decimals).toString()
  );
  const quoteTokenBalance = BigInt.fromString(
    convertToExp18(pmmState.Q, quoteToken.decimals).toString()
  );
  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];
  pair._i = pmmState.i;
  pair._k = pmmState.K;
  //save
  deposit.save();
  pair.save();
  baseToken.save();
  quoteToken.save();
  lpToken.save();
}

export function handleSellShares(event: SellShares): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const pmmState = getPMMState(event.address);
  if (!pmmState) {
    return;
  }
  const baseToken = Token.load(pair.inputTokens[0]) as Token;
  const quoteToken = Token.load(pair.inputTokens[1]) as Token;

  const baseAmount = pair.inputTokenBalances[0]
    .toBigDecimal()
    .minus(convertToExp18(pmmState.B, baseToken.decimals));
  const quoteAmount = pair.inputTokenBalances[1]
    .toBigDecimal()
    .minus(convertToExp18(pmmState.Q, quoteToken.decimals));

  const lpToken = getOrCreateLpToken(
    event.address,
    pair,
    event.block.timestamp
  );

  const lpAmount = convertToExp18(
    event.params.decreaseShares,
    lpToken.decimals
  );
  const balance = convertToExp18(event.params.totalShares, lpToken.decimals);

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const withdraw = new WithdrawEntity(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  withdraw.hash = transactionHash;
  withdraw.logIndex = logIndexI32;
  withdraw.protocol = pair.protocol;
  withdraw.to = event.params.to.toHexString();
  withdraw.from = event.transaction.from.toHexString();
  withdraw._user = event.params.payer.toHexString();
  withdraw.blockNumber = event.block.number;
  withdraw.timestamp = event.block.timestamp;
  withdraw.inputTokens = [pair.inputTokens[0], pair.inputTokens[1]];
  withdraw.outputToken = lpToken.id;
  withdraw.inputTokenAmounts = [
    BigInt.fromString(baseAmount.toString()),
    BigInt.fromString(quoteAmount.toString()),
  ];
  baseToken._txCount = baseToken._txCount.plus(ONE_BI);
  quoteToken._txCount = quoteToken._txCount.plus(ONE_BI);
  lpToken._txCount = lpToken._txCount.plus(ONE_BI);
  lpToken._totalSupply = lpToken._totalSupply.minus(
    BigInt.fromString(lpAmount.toString())
  );

  withdraw.amountUSD = ZERO_BD;
  withdraw.outputTokenAmount = BigInt.fromString(lpAmount.toString());
  withdraw.pool = pair.id;
  const baseTokenBalance = BigInt.fromString(
    convertToExp18(pmmState.B, baseToken.decimals).toString()
  );
  const quoteTokenBalance = BigInt.fromString(
    convertToExp18(pmmState.Q, quoteToken.decimals).toString()
  );
  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];

  pair._i = pmmState.i;
  pair._k = pmmState.K;
  //save
  withdraw.save();
  pair.save();
  baseToken.save();
  quoteToken.save();
  lpToken.save();
}

export function handleLpFeeRateChange(event: LpFeeRateChange): void {
  const pair = LiquidityPool.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  if (pair.name == TYPE_DPP_POOL) {
    const dpp = DPP.bind(event.address);
    pair._lpFeeRate = convertToExp18(dpp._LP_FEE_RATE_(), 18);

    const pmmState = getPMMState(event.address);
    if (!pmmState) {
      return;
    }
    const baseToken = Token.load(pair.inputTokens[0]) as Token;
    const quoteToken = Token.load(pair.inputTokens[1]) as Token;

    const baseTokenBalance = BigInt.fromString(
      convertToExp18(pmmState.B, baseToken.decimals).toString()
    );
    const quoteTokenBalance = BigInt.fromString(
      convertToExp18(pmmState.Q, quoteToken.decimals).toString()
    );
    pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];
    pair._i = pmmState.i;
    pair._k = pmmState.K;
    pair.save();
  }
}

export function handleTransfer(event: Transfer): void {
  //todo
}
