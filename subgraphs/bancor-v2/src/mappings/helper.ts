import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  DexAmmProtocol,
  LiquidityPool,
  LiquidityPoolFee,
  Token,
} from "../../generated/schema";
import { ERC20Contract } from "../../generated/templates/Converter/ERC20Contract";
import { ERC20SymbolBytes } from "../../generated/templates/Converter/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated//templates/Converter/ERC20NameBytes";
import { Versions } from "../versions";
import { ETH_RESERVE_ADDRESS, Network, ProtocolType } from "../constant";
import { SmartToken1 as SmartTokenContract } from "../../generated/ConverterRegistry1/SmartToken1";
import { ConverterBase } from "../../generated/ConverterRegistry1/ConverterBase";
import { Converter as ConverterTemplate } from "../../generated/templates";

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  const scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return scale;
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

export function convertToExp18(
  amount: BigInt,
  exchangeDecimals: i32
): BigDecimal {
  return convertTokenToDecimal(amount, exchangeDecimals).times(
    exponentToBigDecimal(18)
  );
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  if (
    tokenAddress.toHexString() == "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
  ) {
    return "MKR";
  }
  if (
    tokenAddress.toHexString() == "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
  ) {
    return "SAI";
  }
  if (
    tokenAddress.toHexString() == "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"
  ) {
    return "DGD";
  }
  if (
    tokenAddress.toHexString() == "0xf1290473e210b2108a85237fbcd7b6eb42cc654f"
  ) {
    return "HEDG";
  }

  // hard coded overrides
  const contract = ERC20Contract.bind(tokenAddress);
  const contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = "unknown";
  const symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    const symbolResultBytes = contractSymbolBytes.try_symbol();
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
  if (
    tokenAddress.toHexString() == "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
  ) {
    return "Maker";
  }
  if (
    tokenAddress.toHexString() == "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
  ) {
    return "Sai Stablecoin";
  }
  if (
    tokenAddress.toHexString() == "0xe0b7927c4af23765cb51314a0e0521a9645f0e2a"
  ) {
    return "DigixDAO";
  }
  if (
    tokenAddress.toHexString() == "0xf1290473e210b2108a85237fbcd7b6eb42cc654f"
  ) {
    return "HedgeTrade";
  }

  const contract = ERC20Contract.bind(tokenAddress);
  const contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = "unknown";
  const nameResult = contract.try_name();
  if (nameResult.reverted) {
    const nameResultBytes = contractNameBytes.try_name();
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
  const contract = ERC20Contract.bind(tokenAddress);
  const totalSupplyResult = contract.try_totalSupply();
  if (totalSupplyResult.reverted) {
    return BigInt.fromI32(0);
  }
  return totalSupplyResult.value;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  const contract = ERC20Contract.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = 18;
  const decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue as i32;
}

export function fetchTokenBalance(
  tokenAddress: Address,
  user: Address
): BigInt {
  if (tokenAddress.equals(Address.fromString(ETH_RESERVE_ADDRESS))) {
    const converterContract = ConverterBase.bind(user);
    let balanceResult = converterContract.try_reserveBalance(tokenAddress);
    if (balanceResult.reverted) {
      balanceResult = converterContract.try_getConnectorBalance(tokenAddress);
    }
    return balanceResult.value;
  }

  const contract = ERC20Contract.bind(tokenAddress);
  const balanceResult = contract.try_balanceOf(user);
  if (balanceResult.reverted) {
    return BigInt.fromI32(0);
  }

  return balanceResult.value;
}

export function fetchReserveTokens(poolAddress: Address): Array<string> | null {
  const converterBaseContract = ConverterBase.bind(poolAddress);
  let tokensCountRes = converterBaseContract.try_connectorTokenCount();
  if (tokensCountRes.reverted) {
    tokensCountRes = converterBaseContract.try_reserveTokenCount();
  }

  if (tokensCountRes.reverted) {
    return null;
  }
  const tokensCount = tokensCountRes.value;
  const tokens = new Array<string>(tokensCount);
  for (let i = 0; i < tokensCount; i++) {
    let tokenRes = converterBaseContract.try_connectorTokens(BigInt.fromI32(i));
    if (tokenRes.reverted) {
      tokenRes = converterBaseContract.try_reserveTokens(BigInt.fromI32(i));
    }
    if (tokenRes.reverted) {
      return null;
    }
    const tokenEntity = getOrCreateToken(tokenRes.value);
    tokens[i] = tokenEntity.id;
  }
  return tokens;
}

export function fetchAnchor(poolAddress: Address): Address {
  const converterBaseContract = ConverterBase.bind(poolAddress);
  let res = converterBaseContract.try_token();
  if (res.reverted) {
    res = converterBaseContract.try_anchor();
  }
  if (res.reverted) {
    return Address.zero();
  }
  return res.value;
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

  return protocol;
}

export function createPoolFees(
  poolAddress: string,
  blockNumber: BigInt
): string[] {
  // get or create fee entities, set fee types
  // let poolLpFee = LiquidityPoolFee.load(poolAddress.concat("-lp-fee"));
  // if (!poolLpFee) {
  //   poolLpFee = new LiquidityPoolFee(poolAddress.concat("-lp-fee"));
  //   poolLpFee.feeType = LiquidityPoolFeeType.FIXED_LP_FEE;
  // }
  //
  // let poolProtocolFee = LiquidityPoolFee.load(
  //     poolAddress.concat("-protocol-fee")
  // );
  // if (!poolProtocolFee) {
  //   poolProtocolFee = new LiquidityPoolFee(poolAddress.concat("-protocol-fee"));
  //   poolProtocolFee.feeType = LiquidityPoolFeeType.FIXED_PROTOCOL_FEE;
  // }

  let poolTradingFee = LiquidityPoolFee.load(
    poolAddress.concat("-trading-fee")
  );
  const converterContract = ConverterBase.bind(Address.fromString(poolAddress));
  if (!poolTradingFee) {
    poolTradingFee = new LiquidityPoolFee(poolAddress.concat("-trading-fee"));
    poolTradingFee.feeType = LiquidityPoolFeeType.DYNAMIC_TRADING_FEE;
    const res = converterContract.try_conversionFee();
    if (!res.reverted) {
      poolTradingFee.feePercentage = convertToExp18(res.value, 18);
    } else {
      const maxRes = converterContract.try_maxConversionFee();
      if (!maxRes.reverted) {
        poolTradingFee.feePercentage = convertToExp18(maxRes.value, 18);
      } else {
        poolTradingFee.feePercentage = BigDecimal.fromString("30000");
      }
    }
  }

  // // set fees
  // if (NetworkConfigs.getFeeOnOff() == FeeSwitch.ON) {
  //   poolLpFee.feePercentage = NetworkConfigs.getLPFeeToOn(blockNumber);
  //   poolProtocolFee.feePercentage =
  //       NetworkConfigs.getProtocolFeeToOn(blockNumber);
  // } else {
  //   poolLpFee.feePercentage = NetworkConfigs.getLPFeeToOff();
  //   poolProtocolFee.feePercentage = NetworkConfigs.getProtocolFeeToOff();
  // }
  //
  // poolTradingFee.feePercentage = NetworkConfigs.getTradeFee(blockNumber);
  //
  // poolLpFee.save();
  // poolProtocolFee.save();
  poolTradingFee.save();

  return [poolTradingFee.id];
}

export function getOrCreateLiquidityPool(
  protocol: string,
  poolAddress: Address,
  blockTimestamp: BigInt,
  blockNumber: BigInt
): LiquidityPool {
  let pool = LiquidityPool.load(poolAddress.toHexString());
  const converterBaseContract = ConverterBase.bind(poolAddress);
  if (!pool) {
    pool = new LiquidityPool(poolAddress.toHexString());
    pool.name = "Bancor V2 Converter";
    pool.symbol = "bancor-v2";
    pool.inputTokens = [];
    pool.fees = [];
    pool.isSingleSided = true;
    pool.createdTimestamp = blockTimestamp;
    pool.createdBlockNumber = blockNumber;
    pool.totalValueLockedUSD = ZERO_BD;
    pool.cumulativeTotalRevenueUSD = ZERO_BD;
    pool.cumulativeProtocolSideRevenueUSD = ZERO_BD;
    pool.cumulativeSupplySideRevenueUSD = ZERO_BD;
    pool.cumulativeVolumeUSD = ZERO_BD;
    pool.inputTokenBalances = [];
    pool.inputTokenWeights = [];
    pool.outputTokenSupply = ZERO_BI;
    pool.outputTokenPriceUSD = ZERO_BD;
    pool.stakedOutputTokenAmount = ZERO_BI;
    pool.rewardTokens = [];
    pool.rewardTokenEmissionsAmount = [ZERO_BI];
    pool.rewardTokenEmissionsUSD = [ZERO_BD];
    pool.outputToken = fetchAnchor(poolAddress).toHexString();

    ConverterTemplate.create(poolAddress);
  }
  if (!Address.fromString(protocol).equals(Address.zero())) {
    pool.protocol = protocol;
  }

  const tokens = fetchReserveTokens(Address.fromString(pool.id));
  if (tokens) {
    pool.inputTokens = tokens;
    const tokenCount = tokens.length;
    const balances = new Array<BigInt>(tokens.length);
    const weights = new Array<BigDecimal>(tokens.length);
    const isSets = new Array<boolean>(tokens.length);
    for (let i = 0; i < tokenCount; i++) {
      const token = Token.load(tokens[i]) as Token;
      const connectorRes = converterBaseContract.try_connectors(
        Address.fromString(tokens[i])
      );
      if (!connectorRes.reverted) {
        balances[i] = BigInt.fromString(
          convertToExp18(connectorRes.value.value0, token.decimals).toString()
        );
        weights[i] = convertToExp18(connectorRes.value.value1, token.decimals);
        isSets[i] = connectorRes.value.value4;
      } else {
        const reserveRes = converterBaseContract.try_reserves(
          Address.fromString(tokens[i])
        );
        if (!reserveRes.reverted) {
          balances[i] = BigInt.fromString(
            convertToExp18(reserveRes.value.value0, token.decimals).toString()
          );
          weights[i] = convertToExp18(reserveRes.value.value1, token.decimals);
          isSets[i] = reserveRes.value.value4;
        } else {
          balances[i] = ZERO_BI;
          weights[i] = ZERO_BD;
          isSets[i] = false;
        }
      }
    }
    pool.inputTokenBalances = balances;
    pool.inputTokenWeights = weights;
    pool._inputTokenIsSets = isSets;
  }

  const converterVersionResult = converterBaseContract.try_version();
  if (!converterVersionResult.reverted) {
    pool._version = converterVersionResult.value.toString();
  }

  const converterTypeResult = converterBaseContract.try_converterType();
  if (!converterTypeResult.reverted) {
    pool._type = converterTypeResult.value.toString();
  }

  // todo: add into pool.fees
  let converterConversionFeeResult = converterBaseContract.try_conversionFee();
  if (converterConversionFeeResult.reverted) {
    converterConversionFeeResult = converterBaseContract.try_maxConversionFee();
  }
  if (!converterConversionFeeResult.reverted) {
    const tradeFee = converterConversionFeeResult.value;
  }

  pool.save();

  return pool;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());
  if (!token) {
    token = new Token(address.toHexString());
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);

    const decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token.lastPriceUSD = ZERO_BD;
    token._isAnchor = false;
    token.save();
  }

  return token as Token;
}

export function getOrCreateSmartToken(
  protocolAddress: string,
  address: Address,
  blockTimestamp: BigInt,
  blockNumber: BigInt
): Token {
  const protocol = getOrCreateProtocol(
    protocolAddress,
    "Bancor V2",
    "bancor-v2"
  );

  let token = Token.load(address.toHexString());
  if (!token) {
    token = new Token(address.toHexString());
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);

    const decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token.lastPriceUSD = ZERO_BD;
    token._isAnchor = true;
  }

  //update Owner
  const smartTokenContract = SmartTokenContract.bind(address);
  const poolAddressRes = smartTokenContract.try_owner();
  if (!poolAddressRes.reverted) {
    const poolAddress = poolAddressRes.value.toHexString();
    const pool = getOrCreateLiquidityPool(
      protocol.id,
      Address.fromString(poolAddress),
      blockTimestamp,
      blockNumber
    );
    token._pool = pool.id;
    pool.outputToken = token.id;

    const type = pool._type;
    if (type) {
      let typeName = "";
      if (type == "0") {
        typeName = "Liquidity Token Converter";
      } else if (type == "1") {
        typeName = "LiquidityPoolV1Converter";
      } else if (type == "2") {
        typeName = "LiquidityPoolV2Converter";
      } else if (type == "3") {
        typeName = "StablePoolConverter";
      }
      pool.name = protocol.name
        .concat("-")
        .concat(typeName)
        .concat("-")
        .concat(token.name);
      pool.symbol = protocol.slug.concat("-").concat(token.symbol);
    }
    pool.save();
  }
  token.save();
  return token;
}
