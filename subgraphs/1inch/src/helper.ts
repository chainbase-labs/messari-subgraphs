/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DexAmmProtocol, LiquidityPool, Token } from "../generated/schema";
import { Versions } from "./versions";
import { Pool as PoolTemplate } from "../generated/templates";
import { Erc20 as ERC20 } from "../generated/MooniswapFactoryV11/Erc20";
import { Network, ProtocolType } from "./constant";

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
  let contract = ERC20.bind(tokenAddress);

  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);

  // try types string for name
  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (!nameResult.reverted) {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  let totalSupplyResult = contract.try_totalSupply();
  if (totalSupplyResult.reverted) {
    return BigInt.fromI32(0);
  }
  return totalSupplyResult.value;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = 18;
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
  let protocol = DexAmmProtocol.load(address);
  if (!protocol) {
    protocol = new DexAmmProtocol(address);
    protocol.name = name;
    protocol.slug = slug;
    protocol.network = Network.MAINNET;
    protocol.type = ProtocolType.EXCHANGE;
    protocol.totalValueLockedUSD = ZERO_BD;
    protocol.cumulativeVolumeUSD = ZERO_BD;
    protocol.cumulativeSupplySideRevenueUSD = ZERO_BD;
    protocol.cumulativeProtocolSideRevenueUSD = ZERO_BD;
    protocol.cumulativeTotalRevenueUSD = ZERO_BD;
    protocol.cumulativeUniqueUsers = 0;
    protocol.totalPoolCount = 0;
  }
  protocol.schemaVersion = Versions.getSchemaVersion();
  protocol.subgraphVersion = Versions.getSubgraphVersion();
  protocol.methodologyVersion = Versions.getMethodologyVersion();
  protocol.save();
  return protocol as DexAmmProtocol;
}

export function createLiquidityPool(
  factoryAddress: string,
  protocolName: string,
  protocolSlug: string,
  pairAddress: Address,
  token0Address: Address,
  token1Address: Address,
  timestamp: BigInt,
  blockNumber: BigInt,
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
  let token0 = getOrCreateToken(factoryAddress, token0Address);
  let token1 = getOrCreateToken(factoryAddress, token1Address);

  pair.inputTokens = [token0.id, token1.id];
  pair.inputTokenBalances = [ZERO_BI, ZERO_BI];
  pair.inputTokenBalances = [ZERO_BI, ZERO_BI];
  pair.name = name;
  pair.symbol = token0.symbol + "-" + token1.symbol;
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
  pair.fees = [];

  PoolTemplate.create(pairAddress);

  token0.save();
  token1.save();

  pair.save();

  protocol.totalPoolCount += 1;
  protocol.save();
  return pair;
}

export function getOrCreateToken(
  factoryAddress: string,
  address: Address
): Token {
  let token = Token.load(address.toHexString());
  if (!token) {
    token = new Token(address.toHexString());
    let decimal = fetchTokenDecimals(address);
    let name = fetchTokenName(address);
    let symbol = fetchTokenSymbol(address);
    token.decimals = decimal;
    token.name = name;
    token.symbol = symbol;
    token.lastPriceUSD = ZERO_BD;

    token.save();
  }

  return token as Token;
}
