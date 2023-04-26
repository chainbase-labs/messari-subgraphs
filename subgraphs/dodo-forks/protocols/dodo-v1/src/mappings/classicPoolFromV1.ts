import {
  Address,
  BigDecimal,
  BigInt,
  dataSource,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";
import {
  Deposit as DepositEntity,
  LiquidityPool as LiquidityPoolEntity,
  Swap as SwapEntity,
  Token,
  Withdraw as WithdrawEntity,
} from "../../../../generated/schema";
import {
  bigDecimalExp18,
  calculateLpFee,
  createLiquidityPool,
  fetchTokenBalance,
  getOrCreateLpToken,
  getOrCreateProtocol,
  getOrCreateToken,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
} from "./helpers";
import {
  AddDODOCall,
  DODOBirth,
  RemoveDODOCall,
} from "../../../../generated/DODOZoo/DODOZoo";
import {
  BuyBaseToken,
  ChargeMaintainerFee,
  ClaimAssets,
  Deposit,
  DisableBaseDepositCall,
  DisableQuoteDepositCall,
  DisableTradingCall,
  DODO as DODOTemplate,
  EnableBaseDepositCall,
  EnableQuoteDepositCall,
  EnableTradingCall,
  SellBaseToken,
  UpdateLiquidityProviderFeeRate,
  UpdateMaintainerFeeRate,
  Withdraw,
} from "../../../../generated/templates/DODO/DODO";

import {
  CLASSIC_FACTORY_ADDRESS,
  SMART_ROUTE_ADDRESSES,
  TYPE_CLASSICAL_POOL,
} from "../../../../src/common/constant";

const POOLS_ADDRESS: string[] = [
  "0x75c23271661d9d143dcb617222bc4bec783eff34", //WETH-USDC
  "0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650", //LINK-USDC
  "0x9d9793e1e18cdee6cf63818315d55244f73ec006", //FIN-USDT
  "0xca7b0632bd0e646b0f823927d3d2e61b00fe4d80", //SNX-USDC
  "0x0d04146b2fe5d267629a7eb341fb4388dcdbd22f", //COMP-USDC
  "0x2109f78b46a789125598f5ad2b7f243751c2934d", //WBTC-USDC
  "0x1b7902a66f133d899130bf44d7d879da89913b2e", //YFI-USDC
  "0x1a7fe5d6f0bb2d071e16bdd52c863233bbfd38e9", //WETH-USDT
  "0x8876819535b48b551c9e97ebc07332c7482b4b2d", //DODO-USDT
  "0xc9f93163c99695c6526b799ebca2207fdf7d61ad", //USDT-USDC
  "0x94512fd4fb4feb63a6c0f4bedecc4a00ee260528", //AAVE-USDC
  "0x85f9569b69083c3e6aeffd301bb2c65606b5d575", //wCRES-USDT
  "0x181d93ea28023bf40c8bb94796c55138719803b4", //WOO-USDT
];

const BASE_TOKENS: string[] = [
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
  "0x514910771af9ca656af840dff83e8264ecf986ca", //LINK
  "0x054f76beed60ab6dbeb23502178c52d6c5debe40", //FIN
  "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", //SNX
  "0xc00e94cb662c3520282e6f5717214004a7f26888", //COMP
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", //WBTC
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", //YFI
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
  "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd", //DODO
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", //AAVE
  "0xa0afaa285ce85974c3c881256cb7f225e3a1178a", //wCRES
  "0x4691937a7508860f876c9c0a2a617e7d9e945d4b", //WOO
];

const QUOTE_TOKENS: string[] = [
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
  "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
];

const BASE_LP_TOKENS: string[] = [
  "0xc11eccdee225d644f873776a68a02ecd8c015697", //WETH
  "0xf03f3d2fbee37f92ec91ae927a8019cacef4b738", //LINK
  "0x7c4a6813b6af50a2aa2720d861c796a990245383", //FIN
  "0x5bd1b7d3930d7a5e8fd5aeec6b931c822c8be14e", //SNX
  "0x53cf4694b427fcef9bb1f4438b68df51a10228d0", //COMP
  "0x2ec2a42901c761b295a9e6b95200cd0bdaa474eb", //WBTC
  "0xe2852c572fc42c9e2ec03197defa42c647e89291", //YFI
  "0x1270be1bf727447270f237115f0943011e35ee3e", //WETH
  "0x3befc1f0f6cfe0ea852ae61709de370599c88bde ", //DODO
  "0x50b11247bf14ee5116c855cde9963fa376fcec86", //USDT
  "0x30ad5b6d4e531591591113b49eae2fafbc2236d5", //AAVE
  "0xcfba2e0f1bbf6ad96960d8866316b02e36ed1761", //wCRES
  "0xbf83ca9f0da7cf33da68b4cb2511885de955f094", //WOO
];

const QUOTE_LP_TOKENS: string[] = [
  "0x6a5eb3555cbbd29016ba6f6ffbccee28d57b2932",
  "0x0f769bc3ecbda8e0d78280c88e31609e899a1f78",
  "0xa62bf27fd1d64d488b609a09705a28a9b5240b9c",
  "0x1b06a22b20362b4115388ab8ca3ed0972230d78a",
  "0x51baf2656778ad6d67b19a419f91d38c3d0b87b6",
  "0x0cdb21e20597d753c90458f5ef2083f6695eb794",
  "0xd9d0bd18ddfa753d0c88a060ffb60657bb0d7a07",
  "0x3dc2eb2f59ddca985174bb20ae9141ba66cfd2d3",
  "0x1e5bfc8c1225a6ce59504988f823c44e08414a49",
  "0x05a54b466f01510e92c02d3a180bae83a64baab8",
  "0x5840a9e733960f591856a5d13f6366658535bbe5",
  "0xe236b57de7f3e9c3921391c4cb9a42d9632c0022",
  "0xa5b607d0b8e5963bbd8a2709c72c6362654e2b4b",
];

const OWNER: string[] = [
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x6dae6ae227438378c117821c51fd61661faa8893",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0 ",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x6dae6ae227438378c117821c51fd61661faa8893",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0",
  "0x9c59990ec0177d87ed7d60a56f584e6b06c639a2",
  "0x9c59990ec0177d87ed7d60a56f584e6b06c639a2",
];

const createTime: i32[] = [
  1596787200, 1598180006, 1602236520, 1598613764, 1598702967, 1599011490,
  1599011463, 1599011490, 1601348330, 1603302872, 1604862756, 1606415616,
  1603911960,
];

export function insertAllPairs4V1Mainnet(event: ethereum.Event): void {
  for (let i = 0; i < POOLS_ADDRESS.length; i++) {
    if (!LiquidityPoolEntity.load(POOLS_ADDRESS[i].toString())) {
      const lpFeeRate = BigDecimal.fromString("0.003").times(bigDecimalExp18());
      const pair = createLiquidityPool(
        Address.fromString(POOLS_ADDRESS[i]),
        Address.fromString(BASE_TOKENS[i]),
        Address.fromString(QUOTE_TOKENS[i]),
        Address.fromString(BASE_LP_TOKENS[i]),
        Address.fromString(QUOTE_LP_TOKENS[i]),
        BigInt.fromI32(createTime[i]),
        event.block.number,
        lpFeeRate,
        TYPE_CLASSICAL_POOL
      ) as LiquidityPoolEntity;
      //tokens
      pair._creator = OWNER[i];
      pair._isDepositBaseAllowed = false;
      pair._isDepositQuoteAllowed = false;
      pair.save();
    }
  }
}

export function handleDODOBirth(event: DODOBirth): void {
  insertAllPairs4V1Mainnet(event);
  const pair = LiquidityPoolEntity.load(event.params.newBorn.toHexString());
  if (!pair) {
    const dodo = DODOTemplate.bind(event.params.newBorn);
    const baseLpToken = dodo._BASE_CAPITAL_TOKEN_();
    const quoteLpToken = dodo._QUOTE_CAPITAL_TOKEN_();
    const lpFeeRate = dodo._LP_FEE_RATE_();
    createLiquidityPool(
      event.params.newBorn,
      event.params.baseToken,
      event.params.quoteToken,
      baseLpToken,
      quoteLpToken,
      event.block.timestamp,
      event.block.number,
      lpFeeRate.toBigDecimal(),
      TYPE_CLASSICAL_POOL
    );
  }
}

export function handleDeposit(event: Deposit): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const baseToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[0]),
    event.block.timestamp
  );
  const quoteToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[1]),
    event.block.timestamp
  );

  const baseLpToken = getOrCreateLpToken(
    Address.fromString(pair._baseLpToken!),
    pair,
    event.block.timestamp
  );
  const quoteLpToken = getOrCreateLpToken(
    Address.fromString(pair._quoteLpToken!),
    pair,
    event.block.timestamp
  );

  const amount = event.params.amount;
  const lpAmount = event.params.lpTokenAmount;

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const deposit = new DepositEntity(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  deposit.hash = transactionHash;
  deposit.logIndex = logIndexI32;
  deposit.protocol = CLASSIC_FACTORY_ADDRESS;
  deposit.to = event.params.receiver.toHexString();
  deposit.from = event.transaction.from.toHexString();
  deposit._user = event.params.receiver.toHexString();
  deposit.blockNumber = event.block.number;
  deposit.timestamp = event.block.timestamp;
  deposit.inputTokens = [pair.inputTokens[0], pair.inputTokens[1]];
  if (event.params.isBaseToken) {
    deposit.outputToken = pair._baseLpToken;
    deposit.amountUSD = ZERO_BD;
    deposit.inputTokenAmounts = [BigInt.fromString(amount.toString()), ZERO_BI];
    baseToken._txCount = baseToken._txCount.plus(ONE_BI);
    baseLpToken._txCount = baseLpToken._txCount.plus(ONE_BI);
    baseToken._totalSupply = baseToken._totalSupply.plus(
      BigInt.fromString(amount.toString())
    );
    baseLpToken._totalSupply = baseLpToken._totalSupply.plus(
      BigInt.fromString(lpAmount.toString())
    );
  } else {
    deposit.outputToken = pair._quoteLpToken;
    deposit.amountUSD = ZERO_BD;
    deposit.inputTokenAmounts = [ZERO_BI, BigInt.fromString(amount.toString())];
    quoteToken._txCount = quoteToken._txCount.plus(ONE_BI);
    quoteLpToken._txCount = quoteLpToken._txCount.plus(ONE_BI);
    quoteToken._totalSupply = quoteToken._totalSupply.plus(
      BigInt.fromString(amount.toString())
    );
    quoteLpToken._totalSupply = quoteLpToken._totalSupply.plus(
      BigInt.fromString(lpAmount.toString())
    );
  }
  deposit.outputTokenAmount = BigInt.fromString(lpAmount.toString());
  deposit.pool = pair.id;
  const baseTokenBalance = fetchTokenBalance(
    Address.fromString(baseToken.id),
    event.address
  );
  const quoteTokenBalance = fetchTokenBalance(
    Address.fromString(quoteToken.id),
    event.address
  );

  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];
  //save
  deposit.save();
  pair.save();
  baseToken.save();
  quoteToken.save();
  baseLpToken.save();
  quoteLpToken.save();
}

export function handleWithdraw(event: Withdraw): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const baseToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[0]),
    event.block.timestamp
  );
  const quoteToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[1]),
    event.block.timestamp
  );

  const baseLpToken = getOrCreateLpToken(
    Address.fromString(pair._baseLpToken!),
    pair,
    event.block.timestamp
  );
  const quoteLpToken = getOrCreateLpToken(
    Address.fromString(pair._quoteLpToken!),
    pair,
    event.block.timestamp
  );

  // update exchange info (except balances, sync will cover that)
  const amount = event.params.amount;
  const lpAmount = event.params.lpTokenAmount;

  const logIndexI32 = event.logIndex.toI32();
  const transactionHash = event.transaction.hash.toHexString();
  const withdrawal = new WithdrawEntity(
    transactionHash.concat("-").concat(event.logIndex.toString())
  );

  withdrawal.hash = transactionHash;
  withdrawal.logIndex = logIndexI32;
  withdrawal.protocol = CLASSIC_FACTORY_ADDRESS;
  withdrawal.to = event.params.receiver.toHexString();
  withdrawal.from = event.transaction.from.toHexString();
  withdrawal._user = event.params.receiver.toHexString();
  withdrawal.blockNumber = event.block.number;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.inputTokens = [pair.inputTokens[0], pair.inputTokens[1]];
  if (event.params.isBaseToken) {
    withdrawal.outputToken = pair._baseLpToken;
    withdrawal.amountUSD = ZERO_BD;
    withdrawal.inputTokenAmounts = [
      BigInt.fromString(amount.toString()),
      ZERO_BI,
    ];
    baseToken._txCount = baseToken._txCount.plus(ONE_BI);
    baseToken._totalSupply = baseToken._totalSupply.minus(
      BigInt.fromString(amount.toString())
    );
    baseLpToken._txCount = baseLpToken._txCount.plus(ONE_BI);
    baseLpToken._totalSupply = baseLpToken._totalSupply.minus(
      BigInt.fromString(lpAmount.toString())
    );
  } else {
    withdrawal.outputToken = pair._quoteLpToken;
    withdrawal.amountUSD = ZERO_BD;
    withdrawal.inputTokenAmounts = [
      ZERO_BI,
      BigInt.fromString(amount.toString()),
    ];
    quoteToken._txCount = quoteToken._txCount.plus(ONE_BI);
    quoteToken._totalSupply = quoteToken._totalSupply.minus(
      BigInt.fromString(amount.toString())
    );
    quoteLpToken._txCount = quoteLpToken._txCount.plus(ONE_BI);
    quoteLpToken._totalSupply = quoteLpToken._totalSupply.minus(
      BigInt.fromString(lpAmount.toString())
    );
  }

  withdrawal.outputTokenAmount = BigInt.fromString(lpAmount.toString());
  withdrawal.pool = pair.id;
  const baseTokenBalance = fetchTokenBalance(
    Address.fromString(baseToken.id),
    event.address
  );
  const quoteTokenBalance = fetchTokenBalance(
    Address.fromString(quoteToken.id),
    event.address
  );

  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];
  //save
  withdrawal.save();
  pair.save();
  baseToken.save();
  quoteToken.save();
  baseLpToken.save();
  quoteLpToken.save();
}

export function handleSellBaseToken(event: SellBaseToken): void {
  const swapID = "swap-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const baseToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[0]),
    event.block.timestamp
  ) as Token;
  const quoteToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[1]),
    event.block.timestamp
  ) as Token;

  const fromToken = baseToken;
  const toToken = quoteToken;
  const fromAmount = event.params.payBase;
  const toAmount = event.params.receiveQuote;

  const baseVolume = fromAmount.toBigDecimal();
  const quoteVolume = toAmount.toBigDecimal();
  const baseLpFee = ZERO_BD;
  const quoteLpFee = calculateLpFee(quoteVolume, pair._lpFeeRate);

  pair._txCount = pair._txCount.plus(ONE_BI);
  pair._volumeBaseToken = pair._volumeBaseToken.plus(baseVolume);
  pair._volumeQuoteToken = pair._volumeQuoteToken.plus(quoteVolume);
  pair._feeBase = pair._feeBase.plus(baseLpFee);
  pair._feeQuote = pair._feeQuote.plus(quoteLpFee);

  const baseTokenBalance = pair.inputTokenBalances[0].plus(
    BigInt.fromString(baseVolume.toString())
  );
  const quoteTokenBalance = pair.inputTokenBalances[1].minus(
    BigInt.fromString(quoteVolume.toString())
  );
  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];

  //todo:更新pair的volumeUSD，feeUSD,lastTradePrice

  let swap = SwapEntity.load(swapID);
  if (!swap) {
    swap = new SwapEntity(swapID);
    swap.hash = event.transaction.hash.toHexString();
    swap.from = event.transaction.from.toHexString();
    swap.to = event.params.seller.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap._sender = event.params.seller;
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

    swap.protocol = getOrCreateProtocol().id;
    swap.blockNumber = event.block.number;
    swap.amountInUSD = ZERO_BD;
    swap.amountOutUSD = ZERO_BD;
  }
  if (SMART_ROUTE_ADDRESSES.indexOf(event.params.seller.toHexString()) == -1) {
    fromToken._txCount = fromToken._txCount.plus(ONE_BI);
    fromToken._tradeVolume = fromToken._tradeVolume.plus(
      fromAmount.toBigDecimal()
    );

    toToken._txCount = toToken._txCount.plus(ONE_BI);
    toToken._tradeVolume = toToken._tradeVolume.plus(toAmount.toBigDecimal());
  }
  //save
  pair.save();
  swap.save();
  baseToken.save();
  quoteToken.save();
}

export function handleBuyBaseToken(event: BuyBaseToken): void {
  //base data
  const swapID = "swap-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  const baseToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[0]),
    event.block.timestamp
  ) as Token;
  const quoteToken = getOrCreateToken(
    Address.fromString(pair.inputTokens[1]),
    event.block.timestamp
  ) as Token;

  const fromToken = quoteToken;
  const toToken = baseToken;

  const fromAmount = event.params.payQuote;
  const toAmount = event.params.receiveBase;
  const baseVolume = toAmount.toBigDecimal();
  const quoteVolume = fromAmount.toBigDecimal();
  const baseLpFee = calculateLpFee(baseVolume, pair._lpFeeRate);
  const quoteLpFee = ZERO_BD;

  pair._txCount = pair._txCount.plus(ONE_BI);
  pair._volumeBaseToken = pair._volumeBaseToken.plus(baseVolume);
  pair._volumeQuoteToken = pair._volumeQuoteToken.plus(quoteVolume);
  pair._feeBase = pair._feeBase.plus(baseLpFee);
  pair._feeQuote = pair._feeQuote.plus(quoteLpFee);
  const baseTokenBalance = pair.inputTokenBalances[0].minus(
    BigInt.fromString(baseVolume.toString())
  );
  const quoteTokenBalance = pair.inputTokenBalances[1].plus(
    BigInt.fromString(quoteVolume.toString())
  );
  pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];

  //todo:更新pair的volumeUSD，feeUSD,lastTradePrice

  let swap = SwapEntity.load(swapID);
  if (!swap) {
    swap = new SwapEntity(swapID);
    swap.hash = event.transaction.hash.toHexString();
    swap.from = event.transaction.from.toHexString();
    swap.to = event.params.buyer.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap._sender = event.params.buyer;
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

    swap.protocol = getOrCreateProtocol().id;
    swap.blockNumber = event.block.number;
    swap.amountInUSD = ZERO_BD;
    swap.amountOutUSD = ZERO_BD;
  }
  if (SMART_ROUTE_ADDRESSES.indexOf(event.params.buyer.toHexString()) == -1) {
    fromToken._txCount = fromToken._txCount.plus(ONE_BI);
    fromToken._tradeVolume = fromToken._tradeVolume.plus(
      fromAmount.toBigDecimal()
    );

    toToken._txCount = toToken._txCount.plus(ONE_BI);
    toToken._tradeVolume = toToken._tradeVolume.plus(toAmount.toBigDecimal());
  }
  //save
  pair.save();
  swap.save();
  baseToken.save();
  quoteToken.save();
}

export function handleUpdateLiquidityProviderFeeRate(
  event: UpdateLiquidityProviderFeeRate
): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (!pair) {
    return;
  }
  pair._lpFeeRate = event.params.newLiquidityProviderFeeRate.toBigDecimal();
  pair.save();
}

export function handleDisableTrading(call: DisableTradingCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isTradeAllowed = false;
  }
  pair.save();
}

export function handleEnableTrading(call: EnableTradingCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isTradeAllowed = true;
  }
  pair.save();
}

export function handleDisableQuoteDeposit(call: DisableQuoteDepositCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isDepositQuoteAllowed = false;
  }
  pair.save();
}

export function handleEnableQuoteDeposit(call: EnableQuoteDepositCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isDepositQuoteAllowed = true;
  }
  pair.save();
}

export function handleDisableBaseDeposit(call: DisableBaseDepositCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isDepositBaseAllowed = false;
  }
  pair.save();
}

export function handleEnableBaseDeposit(call: EnableBaseDepositCall): void {
  const pairAddress = dataSource.address().toHexString();
  const pair = LiquidityPoolEntity.load(pairAddress);
  if (!pair) {
    return;
  }
  if (pair) {
    pair._isDepositBaseAllowed = true;
  }
  pair.save();
}

export function handleClaimAssets(event: ClaimAssets): void {
  const pair = LiquidityPoolEntity.load(dataSource.address().toHexString());
  if (pair != null) {
    const baseToken = Token.load(pair.inputTokens[0]) as Token;
    const quoteToken = Token.load(pair.inputTokens[1]) as Token;
    const baseTokenBalance = fetchTokenBalance(
      Address.fromString(baseToken.id),
      event.address
    );
    const quoteTokenBalance = fetchTokenBalance(
      Address.fromString(quoteToken.id),
      event.address
    );
    pair.inputTokenBalances = [baseTokenBalance, quoteTokenBalance];
    pair.save();
  }
}

export function handleChargeMaintainerFee(event: ChargeMaintainerFee): void {
  //todo
}

export function handleUpdateMaintainerFeeRate(
  event: UpdateMaintainerFeeRate
): void {
  const pair = LiquidityPoolEntity.load(event.address.toHexString());
  if (pair) {
    pair._mtFeeRate = event.params.newMaintainerFeeRate;
    pair.save();
  }
}

export function handleRemoveDODO(call: RemoveDODOCall): void {
  const pair = LiquidityPoolEntity.load(call.inputs.dodo.toHexString());
  if (pair) {
    store.remove("LiquidityPool", call.inputs.dodo.toHexString());
  }
}

export function handleAddDODO(call: AddDODOCall): void {
  const pair = LiquidityPoolEntity.load(call.inputs.dodo.toHexString());

  if (!pair) {
    const dodo = DODOTemplate.bind(call.inputs.dodo);
    const baseToken = dodo._BASE_TOKEN_();
    const quoteToken = dodo._QUOTE_TOKEN_();
    const baseLpToken = dodo._BASE_CAPITAL_TOKEN_();
    const quoteLpToken = dodo._QUOTE_CAPITAL_TOKEN_();
    const lpFeeRate = dodo._LP_FEE_RATE_();
    createLiquidityPool(
      call.inputs.dodo,
      baseToken,
      quoteToken,
      baseLpToken,
      quoteLpToken,
      call.block.timestamp,
      call.block.number,
      lpFeeRate.toBigDecimal(),
      TYPE_CLASSICAL_POOL
    );
  }
}
