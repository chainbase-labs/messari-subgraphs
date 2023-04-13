/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  DexAmmProtocol,
  LiquidityPool,
  Token,
} from "../../../../generated/schema";
import {
  ADDRESS_ZERO,
  BASE_COIN,
  CHAIN_BASE_COIN_NAME,
  CHAIN_BASE_COIN_SYMBOL,
  Network,
  ProtocolType,
  STABLE_ONE_ADDRESS,
  TYPE_CLASSICAL_POOL,
} from "../../../../src/common/constant";
import { Versions } from "../../../../src/versions";
import { DODOLpToken as DODOLpTokenTemplate } from "../../../../generated/templates";
import { ERC20 } from "../../../../generated/DPPFactory/ERC20";
import { ERC20SymbolBytes } from "../../../../generated/DPPFactory/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../../../generated/DPPFactory/ERC20NameBytes";
import {
  DVM,
  DVM__getPMMStateResultStateStruct,
} from "../../../../generated/templates/DVM/DVM";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

//subgraph dosen't support indexOf() now
export function getAddressFirstIndex(
  addresses: string[],
  address: string
): BigInt {
  let index = BigInt.fromI32(-1);
  let length = addresses.length;

  for (let i = 0; i < length; i++) {
    if (addresses[i] == address) {
      index = BigInt.fromI32(i);
      break;
    }
  }
  return index;
}

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return scale;
}

export function convertToExp18(
  amount: BigInt,
  exchangeDecimals: i32
): BigDecimal {
  return convertTokenToDecimal(amount, exchangeDecimals).times(
    exponentToBigDecimal(18)
  );
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString("1000000000000000000");
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18));
}

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: i32
): BigDecimal {
  if (exchangeDecimals == 0) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString());
  const zero = parseFloat(ZERO_BD.toString());
  if (zero == formattedVal) {
    return true;
  }
  return false;
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

export function calculateLpFee(
  volume: BigDecimal,
  lpFeeRate: BigDecimal
): BigDecimal {
  return volume
    .div(bigDecimalExp18())
    .times(lpFeeRate.div(bigDecimalExp18()))
    .times(bigDecimalExp18());
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  // hard coded overrides
  if (
    tokenAddress.toHexString() == "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"
  ) {
    return "DGD";
  }
  if (
    tokenAddress.toHexString() == "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
  ) {
    return "AAVE";
  }
  if (
    tokenAddress.toHexString() == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  ) {
    return "USDC";
  }

  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  // hard coded overrides
  if (
    tokenAddress.toHexString() == "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"
  ) {
    return "DGD";
  }
  if (
    tokenAddress.toHexString() == "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
  ) {
    return "Aave Token";
  }

  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  if (tokenAddress.toHexString() == BASE_COIN) {
    return BigInt.fromI32(0);
  }
  let contract = ERC20.bind(tokenAddress);
  let totalSupplyResult = contract.try_totalSupply();
  if (totalSupplyResult.reverted) {
    return BigInt.fromI32(0);
  }
  return totalSupplyResult.value;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  // hardcode overrides
  if (
    tokenAddress.toHexString() == "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
  ) {
    return 18;
  }
  if (tokenAddress.toHexString() == BASE_COIN) {
    return 18;
  }

  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue as i32;
}

export function fetchTokenBalance(
  tokenAddress: Address,
  user: Address
): BigInt {
  if (tokenAddress.toHexString() == BASE_COIN) {
    return BigInt.fromI32(0);
  }
  let contract = ERC20.bind(tokenAddress);
  let balanceResult = contract.try_balanceOf(user);
  if (balanceResult.reverted) {
    return BigInt.fromI32(0);
  }

  return balanceResult.value;
}

export function getOrCreateProtocol(
  address: string,
  name: string,
  slug: string
): DexAmmProtocol {
  let dodoZoo = DexAmmProtocol.load(address);
  if (!dodoZoo) {
    dodoZoo = new DexAmmProtocol(address);
    dodoZoo.name = name;
    dodoZoo.slug = slug;
    dodoZoo.network = Network.MAINNET;
    dodoZoo.type = ProtocolType.EXCHANGE;
    dodoZoo.totalValueLockedUSD = ZERO_BD;
    dodoZoo.cumulativeVolumeUSD = ZERO_BD;
    dodoZoo.cumulativeSupplySideRevenueUSD = ZERO_BD;
    dodoZoo.cumulativeProtocolSideRevenueUSD = ZERO_BD;
    dodoZoo.cumulativeTotalRevenueUSD = ZERO_BD;
    dodoZoo.cumulativeUniqueUsers = 0;
    dodoZoo.totalPoolCount = 0;

    dodoZoo._tokenCount = ZERO_BI;
    dodoZoo._crowdpoolingCount = ZERO_BI;
    dodoZoo._volumeUSD = ZERO_BD;
    dodoZoo._feeUSD = ZERO_BD;
    dodoZoo._maintainerFeeUSD = ZERO_BD;
    dodoZoo._DIP3MaintainerFeeUSD = ZERO_BD;
    dodoZoo._uniqueUsersCount = ZERO_BI;
  }
  dodoZoo.schemaVersion = Versions.getSchemaVersion();
  dodoZoo.subgraphVersion = Versions.getSubgraphVersion();
  dodoZoo.methodologyVersion = Versions.getMethodologyVersion();
  dodoZoo.save();
  return dodoZoo as DexAmmProtocol;
}

export function createLiquidityPool(
  factoryAddress: string,
  protocolName: string,
  protocolSlug: string,
  pairAddress: Address,
  baseTokenAddress: Address,
  quoteTokenAddress: Address,
  baseLpTokenAddress: Address | null,
  quoteLpTokenAddress: Address | null,
  timestamp: BigInt,
  blockNumber: BigInt,
  lpFeeRate: BigDecimal,
  name: string
): LiquidityPool {
  //tokens
  let pair = new LiquidityPool(pairAddress.toHexString()) as LiquidityPool;

  const protocol = getOrCreateProtocol(
    factoryAddress,
    protocolName,
    protocolSlug
  );
  pair.protocol = protocol.id;
  let baseToken = getOrCreateToken(factoryAddress, baseTokenAddress, timestamp);
  let quoteToken = getOrCreateToken(
    factoryAddress,
    quoteTokenAddress,
    timestamp
  );
  if (baseLpTokenAddress) {
    let baseLpToken = getOrCreateLpToken(baseLpTokenAddress, pair, timestamp);
    pair._baseLpToken = baseLpToken.id;
    baseLpToken.save();
    DODOLpTokenTemplate.create(Address.fromString(baseLpToken.id));
  }
  if (quoteLpTokenAddress) {
    let quoteLpToken = getOrCreateLpToken(quoteLpTokenAddress, pair, timestamp);
    pair._quoteLpToken = quoteLpToken.id;
    quoteLpToken.save();
    DODOLpTokenTemplate.create(Address.fromString(quoteLpToken.id));
  }

  pair.inputTokens = [baseToken.id, quoteToken.id];
  pair.inputTokenBalances = [ZERO_BI, ZERO_BI];
  pair.inputTokenBalances = [ZERO_BI, ZERO_BI];
  pair.name = name;
  pair.symbol = baseToken.symbol + "-" + quoteToken.symbol;
  pair.createdTimestamp = timestamp;
  pair.createdBlockNumber = blockNumber;
  pair.isSingleSided = true;
  pair.totalValueLockedUSD = ZERO_BD;
  pair.cumulativeTotalRevenueUSD = ZERO_BD;
  pair.cumulativeProtocolSideRevenueUSD = ZERO_BD;
  pair.cumulativeSupplySideRevenueUSD = ZERO_BD;
  pair.cumulativeVolumeUSD = ZERO_BD;
  pair.inputTokenWeights = [bigDecimalExp18(), bigDecimalExp18()];
  pair.outputTokenSupply = ZERO_BI;
  pair.outputTokenPriceUSD = ZERO_BD;
  pair.stakedOutputTokenAmount = ZERO_BI;
  pair.rewardTokenEmissionsAmount = [ZERO_BI];
  pair.rewardTokenEmissionsUSD = [ZERO_BD];

  pair._lastTradePrice = ZERO_BD;
  pair._txCount = ZERO_BI;
  pair._volumeBaseToken = ZERO_BD;
  pair._volumeQuoteToken = ZERO_BD;
  pair._liquidityProviderCount = ZERO_BI;
  pair._untrackedBaseVolume = ZERO_BD;
  pair._untrackedQuoteVolume = ZERO_BD;
  pair._feeBase = ZERO_BD;
  pair._feeQuote = ZERO_BD;
  pair._traderCount = ZERO_BI;
  pair._isTradeAllowed = true;
  pair._isDepositBaseAllowed = true;
  pair._isDepositQuoteAllowed = true;
  pair._volumeUSD = ZERO_BD;
  pair._feeUSD = ZERO_BD;

  pair._i = ZERO_BI;
  pair._k = ZERO_BI;

  pair._lpFeeRate = lpFeeRate;

  pair._mtFeeRateModel = Address.fromString(ADDRESS_ZERO);
  pair._maintainer = Address.fromString(ADDRESS_ZERO);
  pair._mtFeeRate = ZERO_BI;
  pair._mtFeeBase = ZERO_BD;
  pair._mtFeeQuote = ZERO_BD;
  pair._mtFeeUSD = ZERO_BD;

  baseToken.save();
  quoteToken.save();

  pair.save();

  protocol.totalPoolCount += 1;
  protocol.save();
  return pair;
}

export function getOrCreateToken(
  factoryAddress: string,
  address: Address,
  timestamp: BigInt
): Token {
  let token = Token.load(address.toHexString());
  if (!token) {
    token = new Token(address.toHexString());
    if (address.toHexString() == BASE_COIN) {
      token.symbol = CHAIN_BASE_COIN_SYMBOL;
      token.name = CHAIN_BASE_COIN_NAME;
    } else {
      token.symbol = fetchTokenSymbol(address);
      token.name = fetchTokenName(address);
    }
    let decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token._totalSupply = BigInt.fromString(
      convertToExp18(fetchTokenTotalSupply(address), decimal).toString()
    );
    token._tradeVolume = ZERO_BD;
    token._totalLiquidityOnDODO = ZERO_BD;
    token.lastPriceUSD = ZERO_BD;
    token._volumeUSDBridge = ZERO_BD;
    token._tradeVolumeBridge = ZERO_BD;
    token._txCount = ZERO_BI;
    token._untrackedVolume = ZERO_BD;
    token._timestamp = timestamp;
    token._volumeUSD = ZERO_BD;
    token._traderCount = ZERO_BI;

    if (address.toHexString() == STABLE_ONE_ADDRESS) {
      token.lastPriceUSD = convertTokenToDecimal(ONE_BI, 0);
    }
    token.save();
  }

  //for V1 classical hardcode pools
  if (token.symbol == "unknown") {
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    let decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token._totalSupply = BigInt.fromString(
      convertToExp18(fetchTokenTotalSupply(address), decimal).toString()
    );
    token.save();
  }

  const protocol = getOrCreateProtocol(factoryAddress, "", "");
  protocol._tokenCount.plus(ONE_BI);
  protocol.save();
  return token as Token;
}

export function getOrCreateLpToken(
  address: Address,
  pool: LiquidityPool,
  timestamp: BigInt
): Token {
  let lpToken = Token.load(address.toHexString());

  if (!lpToken) {
    lpToken = new Token(address.toHexString());

    lpToken.decimals = fetchTokenDecimals(address);
    lpToken.name = fetchTokenName(address);
    lpToken.symbol = fetchTokenSymbol(address);
    lpToken._totalSupply = ZERO_BI;
    lpToken._pool = pool.id;
  }

  //for V1 classical hardcode pools
  if (lpToken.symbol == "unknown") {
    lpToken.symbol = fetchTokenSymbol(address);
    let decimal = fetchTokenDecimals(address);
    lpToken.decimals = decimal;
    lpToken._totalSupply = BigInt.fromString(
      convertToExp18(fetchTokenTotalSupply(address), decimal).toString()
    );
    lpToken.name = fetchTokenName(address);
  }
  lpToken._tradeVolume = ZERO_BD;
  lpToken._totalLiquidityOnDODO = ZERO_BD;
  lpToken.lastPriceUSD = ZERO_BD;
  lpToken._volumeUSDBridge = ZERO_BD;
  lpToken._tradeVolumeBridge = ZERO_BD;
  lpToken._txCount = ZERO_BI;
  lpToken._untrackedVolume = ZERO_BD;
  lpToken._timestamp = timestamp;
  lpToken._volumeUSD = ZERO_BD;
  lpToken._traderCount = ZERO_BI;
  lpToken.save();

  return lpToken as Token;
}

export function getPMMState(
  poolAddress: Address
): DVM__getPMMStateResultStateStruct | null {
  let pair = LiquidityPool.load(poolAddress.toHexString());
  if (pair && pair.name != TYPE_CLASSICAL_POOL) {
    let pool = DVM.bind(poolAddress);
    let pmmState = pool.try_getPMMState();
    if (pmmState.reverted == false) {
      return pmmState.value as DVM__getPMMStateResultStateStruct;
    }
  }
  return null;
}
