import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  _Connector,
  DexAmmProtocol,
  LiquidityPool,
  Token,
} from "../../generated/schema";
import {
  ConverterContract as ConverterTemplate,
  SmartTokenContract as SmartTokenTemplate,
} from "../../generated/templates";
import { ConverterContract } from "../../generated/ConverterRegistryContract1/ConverterContract";
import { ERC20Contract } from "../../generated/templates/ConverterContract/ERC20Contract";
import { ERC20SymbolBytes } from "../../generated/ConverterRegistryContract1/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated/ConverterRegistryContract1/ERC20NameBytes";
import { Versions } from "../versions";
import { Network, ProtocolType } from "../constant";
import { SmartTokenContract } from "../../generated/ConverterRegistryContract1/SmartTokenContract";
import { ConverterContractOld } from "../../generated/ConverterRegistryContract1/ConverterContractOld";

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
  let decimalValue = null;
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
  const contract = ERC20Contract.bind(tokenAddress);
  const balanceResult = contract.try_balanceOf(user);
  if (balanceResult.reverted) {
    return BigInt.fromI32(0);
  }

  return balanceResult.value;
}

export function fetchConnector(
  poolAddress: Address,
  tokenAddress: Address
): void {
  const converterContract = ConverterContract.bind(poolAddress);

  const converterConnectorsResult =
    converterContract.try_connectors(tokenAddress);
  if (!converterConnectorsResult.reverted) {
    const connectorID =
      poolAddress.toHexString() + "-" + tokenAddress.toHexString();
    let connector = _Connector.load(connectorID);
    if (!connector) {
      connector = new _Connector(connectorID);
    }
    connector._virtualBalance = converterConnectorsResult.value.value0;
    connector._weight = converterConnectorsResult.value.value1;
    connector._isVirtualBalanceEnabled = converterConnectorsResult.value.value2;
    connector._isPurchaseEnabled = converterConnectorsResult.value.value3;
    connector._isSet = converterConnectorsResult.value.value4;
    connector._converter = poolAddress.toHexString();
    connector._connectorToken = tokenAddress.toHexString();
    connector.save();
  } else {
    const converterContractOld = ConverterContractOld.bind(poolAddress);
    const converterConnectorsResult =
      converterContractOld.try_connectors(tokenAddress);
    if (!converterConnectorsResult.reverted) {
      const connectorID =
        poolAddress.toHexString() + "-" + tokenAddress.toHexString();
      let connector = _Connector.load(connectorID);
      if (!connector) {
        connector = new _Connector(connectorID);
      }
      connector._virtualBalance = converterConnectorsResult.value.value0;
      connector._weight = converterConnectorsResult.value.value1;
      connector._isVirtualBalanceEnabled =
        converterConnectorsResult.value.value2;
      connector._isPurchaseEnabled = converterConnectorsResult.value.value3;
      connector._isSet = converterConnectorsResult.value.value4;
      connector._converter = poolAddress.toHexString();
      connector._connectorToken = tokenAddress.toHexString();
      connector.save();
    }
  }
}

export function fetchConverterConnectorTokens(
  poolAddress: Address
): Array<string> | null {
  const converterContract = ConverterContract.bind(poolAddress);
  const converterConnectorTokenCountResult =
    converterContract.try_connectorTokenCount();
  if (!converterConnectorTokenCountResult.reverted) {
    const numConnectorTokens = converterConnectorTokenCountResult.value;
    const tokens = new Array<string>(numConnectorTokens);
    for (let i = 0; i < numConnectorTokens; i++) {
      const token = converterContract.try_connectorTokens(BigInt.fromI32(i));
      if (!token.reverted) {
        const tokenEntity = getOrCreateToken(token.value);
        tokens[i] = tokenEntity.id;
        fetchConnector(poolAddress, Address.fromString(tokenEntity.id));
      }
    }
    return tokens;
  }
  return null;
}

export function fetchQuickBuyPath(converter: Address): Array<string> | null {
  const converterContract = ConverterContract.bind(converter);
  const qBPres = converterContract.try_getQuickBuyPathLength();
  if (!qBPres.reverted) {
    const converterQBPLength = qBPres.value.toI32();
    const poolQuickBuyPath = new Array<string>(converterQBPLength);
    for (let i = 0; i < converterQBPLength; i++) {
      const pathMemberAddress = converterContract
        .quickBuyPath(BigInt.fromI32(i))
        .toHexString();
      poolQuickBuyPath[i] = pathMemberAddress;
    }
    return poolQuickBuyPath;
  }
  return null;
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

export function getOrCreateLiquidityPool(
  factoryAddress: string,
  protocolName: string,
  protocolSlug: string,
  poolAddress: Address,
  blockTimestamp: BigInt,
  blockNumber: BigInt
): LiquidityPool {
  let pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    const protocol = getOrCreateProtocol(
      factoryAddress,
      protocolName,
      protocolSlug
    );
    pool = new LiquidityPool(poolAddress.toHexString());
    pool.protocol = protocol.id;
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

    protocol.totalPoolCount += 1;

    //save
    protocol.save();

    ConverterTemplate.create(poolAddress);
  }

  const converterContract = ConverterContract.bind(poolAddress);

  const poolQuickBuyPath = pool._quickBuyPath;
  if (!poolQuickBuyPath || poolQuickBuyPath.length == 0) {
    pool._quickBuyPath = fetchQuickBuyPath(Address.fromString(pool.id));
  }

  const tokens = fetchConverterConnectorTokens(Address.fromString(pool.id));
  if (tokens) {
    pool.inputTokens = tokens;
    const balances = new Array<BigInt>(tokens.length);
    balances.fill(ZERO_BI);
    pool.inputTokenBalances = balances;
  }

  const converterVersionResult = converterContract.try_version();
  if (!converterVersionResult.reverted) {
    pool._version = converterVersionResult.value;
  }

  const converterOwnerResult = converterContract.try_owner();
  if (!converterOwnerResult.reverted) {
    pool._owner = converterOwnerResult.value.toHex();
  }
  const converterManagerResult = converterContract.try_manager();
  if (!converterManagerResult.reverted) {
    pool._manager = converterManagerResult.value.toHex();
  }
  const converterMaxConversionFeeResult =
    converterContract.try_maxConversionFee();
  if (!converterMaxConversionFeeResult.reverted) {
    pool._conversionFee = converterMaxConversionFeeResult.value;
  }
  const converterTypeResult = converterContract.try_converterType();
  if (!converterTypeResult.reverted) {
    pool._type = converterTypeResult.value;
  }

  const converterContractRegistryResult = converterContract.try_registry();
  if (!converterContractRegistryResult.reverted) {
    pool.protocol = converterContractRegistryResult.value.toHexString();
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
    token._isSmartToken = false;
    token.save();
  }

  //for V1 classical hardcode pools
  if (token.symbol == "unknown") {
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    const decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token.save();
  }

  return token as Token;
}

export function getOrCreateSmartToken(address: Address): Token {
  let token = Token.load(address.toHexString());
  const smartTokenContract = SmartTokenContract.bind(address);
  if (!token) {
    token = new Token(address.toHexString());
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);

    const decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
    token.lastPriceUSD = ZERO_BD;

    token._isSmartToken = true;

    const smartTokenVersionResult = smartTokenContract.try_version();
    if (!smartTokenVersionResult.reverted) {
      token._version = smartTokenVersionResult.value;
    }
    const smartTokenStandardResult = smartTokenContract.try_standard();
    if (!smartTokenStandardResult.reverted) {
      token._standard = smartTokenStandardResult.value;
    }
    const smartTokenTransfersEnabledResult =
      smartTokenContract.try_transfersEnabled();
    if (!smartTokenTransfersEnabledResult.reverted) {
      token._transfersEnabled = smartTokenTransfersEnabledResult.value;
    }

    SmartTokenTemplate.create(address);

    const poolAddress = smartTokenContract.owner();
    token._owner = poolAddress.toHexString();

    const tokens = fetchConverterConnectorTokens(poolAddress);
    if (tokens) {
      token._connectorTokens = tokens;
    }
  }

  if (token.symbol == "unknown") {
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    const decimal = fetchTokenDecimals(address);
    token.decimals = decimal;
  }

  token.save();
  return token;
}
