import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  DexAmmProtocol,
  LiquidityPool,
  PoolShare,
  Token,
  TokenPrice,
  Transaction,
  User,
} from "../../generated/schema";
import { BTokenBytes } from "../../generated/templates/Pool/BTokenBytes";
import { BToken } from "../../generated/templates/Pool/BToken";
import { CRPFactory } from "../../generated/Factory/CRPFactory";
import { ConfigurableRightsPool } from "../../generated/Factory/ConfigurableRightsPool";
import * as constants from "../../src/common/constants";
import { Versions } from "../versions";

const network = dataSource.network();

// Config for mainnet
let WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
let USD = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
let DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
let CRP_FACTORY = "0xed52d8e202401645edad1c0aa21e872498ce47d0";

if (network == "kovan") {
  WETH = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
  USD = "0x2f375e94fc336cdec2dc0ccb5277fe59cbf1cae5";
  DAI = "0x1528f3fcc26d13f7079325fb78d9442607781c8c";
  CRP_FACTORY = "0x53265f0e014995363ae54dad7059c018badbcd74";
}

if (network == "rinkeby") {
  WETH = "0xc778417e063141139fce010982780140aa0cd5ab";
  USD = "0x21f3179cadae46509f615428f639e38123a508ac";
  DAI = "0x947b4082324af403047154f9f26f14538d775194";
  CRP_FACTORY = "0xa3f9145cb0b50d907930840bb2dcff4146df8ab4";
}

export function hexToDecimal(hexString: string, decimals: i32): BigDecimal {
  const bytes = Bytes.fromHexString(hexString).reverse() as Bytes;
  const bi = BigInt.fromUnsignedBytes(bytes);
  const scale = BigInt.fromI32(10)
    .pow(decimals as u8)
    .toBigDecimal();
  return bi.divDecimal(scale);
}

// export function bigIntToDecimal(amount: BigInt, decimals: i32): BigDecimal {
//   let scale = BigInt.fromI32(10).pow(decimals as u8).toBigDecimal()
//   return amount.toBigDecimal().div(scale)
// }
//
// export function tokenToDecimal(amount: BigDecimal, decimals: i32): BigDecimal {
//   let scale = BigInt.fromI32(10).pow(decimals as u8).toBigDecimal()
//   return amount.div(scale)
// }
export function getOrCreateProtocol(factoryAddress: string): DexAmmProtocol {
  let factory = DexAmmProtocol.load(factoryAddress);

  // if no factory yet, set up blank initial
  if (!factory) {
    factory = new DexAmmProtocol(factoryAddress);
    factory.name = constants.Protocol.NAME;
    factory.slug = constants.Protocol.SLUG;
    factory.network = constants.Protocol.NETWORK;
    factory.type = constants.ProtocolType.EXCHANGE;

    factory.color = "Bronze";
    factory.totalPoolCount = 0;
    factory.finalizedPoolCount = 0;
    factory.crpCount = 0;
    factory.txCount = constants.BIGINT_ZERO;
    factory.totalLiquidity = constants.BIGDECIMAL_ZERO;
    factory.totalSwapVolume = constants.BIGDECIMAL_ZERO;
    factory.totalSwapFee = constants.BIGDECIMAL_ZERO;
    //////// Quantitative Data ////////
    factory.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    factory.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    factory.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    factory.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    factory.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    factory.cumulativeUniqueUsers = 0;
    factory.totalPoolCount = 0;
  }
  factory.schemaVersion = Versions.getSchemaVersion();
  factory.subgraphVersion = Versions.getSubgraphVersion();
  factory.methodologyVersion = Versions.getMethodologyVersion();
  factory.save();
  return factory as DexAmmProtocol;
}

export function getOrCreateLiquidityPool(
  poolAddress: string,
  block: ethereum.Block
): LiquidityPool {
  let pool = LiquidityPool.load(poolAddress);
  if (!pool) {
    pool = new LiquidityPool(poolAddress);
    const factory = getOrCreateProtocol(
      constants.FACTORY_ADDRESS.toHexString()
    );
    pool.protocol = factory.id;
    pool.inputTokens = [];
    pool.inputTokenBalances = [];
    pool.inputTokenWeights = [];
    pool.rights = [];
    pool.publicSwap = false;
    pool.finalized = false;
    pool.active = true;
    pool.swapFee = BigDecimal.fromString("100000000000000000000");
    pool.totalWeight = constants.BIGDECIMAL_ZERO;
    pool.totalShares = constants.BIGDECIMAL_ZERO;
    pool.totalSwapVolume = constants.BIGDECIMAL_ZERO;
    pool.totalSwapVolume = constants.BIGDECIMAL_ZERO;
    pool.totalSwapFee = constants.BIGDECIMAL_ZERO;
    pool.liquidity = constants.BIGDECIMAL_ZERO;
    pool.tokensCount = constants.BIGINT_ZERO;
    pool.holdersCount = constants.BIGINT_ZERO;
    pool.joinsCount = constants.BIGINT_ZERO;
    pool.exitsCount = constants.BIGINT_ZERO;
    pool.swapsCount = constants.BIGINT_ZERO;
    pool.totalValueLockedUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeSupplySideRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeProtocolSideRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeTotalRevenueUSD = constants.BIGDECIMAL_ZERO;
    pool.cumulativeVolumeUSD = constants.BIGDECIMAL_ZERO;
    pool.isSingleSided = false;

    pool.createdBlockNumber = block.number;
    pool.createdTimestamp = block.timestamp;

    pool.save();
  }
  return pool as LiquidityPool;
}

export function getOrCreatePoolShareEntity(
  id: string,
  pool: string,
  user: string
): PoolShare {
  let poolShare = PoolShare.load(id);
  if (!poolShare) {
    poolShare = new PoolShare(id);

    createUserEntity(user);

    poolShare.userAddress = user;
    poolShare.poolId = pool;
    poolShare.balance = constants.BIGDECIMAL_ZERO;
    poolShare.save();
  }

  return poolShare;
}

export function getOrCreateTokenEntity(address: Address): Token {
  let token = Token.load(address.toHexString());
  if (!token) {
    const bToken = BToken.bind(address);
    const tokenBytes = BTokenBytes.bind(address);
    let symbol = "";
    let name = "";
    let decimals = 18;

    // COMMENT THE LINES BELOW OUT FOR LOCAL DEV ON KOVAN

    const symbolCall = bToken.try_symbol();
    const nameCall = bToken.try_name();
    const decimalCall = bToken.try_decimals();

    if (symbolCall.reverted) {
      const symbolBytesCall = tokenBytes.try_symbol();
      if (!symbolBytesCall.reverted) {
        symbol = symbolBytesCall.value.toString();
      }
    } else {
      symbol = symbolCall.value;
    }

    if (nameCall.reverted) {
      const nameBytesCall = tokenBytes.try_name();
      if (!nameBytesCall.reverted) {
        name = nameBytesCall.value.toString();
      }
    } else {
      name = nameCall.value;
    }

    if (!decimalCall.reverted) {
      decimals = decimalCall.value;
    }

    token = new Token(address.toHexString());
    token.name = name;
    token.symbol = symbol;
    token.decimals = decimals;
    token.save();
  }
  return token;
}

export function updatePoolLiquidity(id: string): void {
  const pool = getOrCreateLiquidityPool(id);
  // let tokensList: Array<Bytes> = pool?.tokensList || []

  const tokensList = pool.inputTokens || [];

  if (pool.tokensCount.equals(constants.BIGINT_ZERO)) {
    pool.liquidity = constants.BIGDECIMAL_ZERO;
    pool.save();
    return;
  }

  if (!tokensList || pool.tokensCount.lt(BigInt.fromI32(2)) || !pool.publicSwap)
    return;

  // Find pool liquidity

  let hasPrice = false;
  let hasUsdPrice = false;
  let poolLiquidity = constants.BIGDECIMAL_ZERO;

  if (tokensList.includes(USD)) {
    const idx = pool.inputTokens.indexOf(USD);
    const tokenBalance = pool.inputTokenBalances.at(idx).toBigDecimal();
    const tokenWeight = pool.inputTokenWeights.at(idx);
    poolLiquidity = tokenBalance.div(tokenWeight).times(pool.totalWeight);
    hasPrice = true;
    hasUsdPrice = true;

    hasPrice = true;
    hasUsdPrice = true;
  } else if (tokensList.includes(WETH)) {
    const wethTokenPrice = TokenPrice.load(WETH);
    if (wethTokenPrice) {
      const idx = pool.inputTokens.indexOf(WETH);
      const tokenBalance = pool.inputTokenBalances.at(idx).toBigDecimal();
      const tokenWeight = pool.inputTokenWeights.at(idx);
      poolLiquidity = wethTokenPrice.price
        .times(tokenBalance)
        .div(tokenWeight)
        .times(pool.totalWeight);
      hasPrice = true;
    }
  } else if (tokensList.includes(DAI)) {
    const daiTokenPrice = TokenPrice.load(DAI);
    if (daiTokenPrice) {
      const idx = pool.inputTokens.indexOf(DAI);
      const tokenBalance = pool.inputTokenBalances.at(idx).toBigDecimal();
      const tokenWeight = pool.inputTokenWeights.at(idx);

      poolLiquidity = daiTokenPrice.price
        .times(tokenBalance)
        .div(tokenWeight)
        .times(pool.totalWeight);
      hasPrice = true;
    }
  }

  // Create or update token price

  if (hasPrice) {
    for (let i = 0; i < tokensList.length; i++) {
      const tokenPriceId = tokensList[i];
      let tokenPrice = TokenPrice.load(tokenPriceId);
      if (!tokenPrice) {
        tokenPrice = new TokenPrice(tokenPriceId);
        tokenPrice.poolTokenId = "";
        tokenPrice.poolLiquidity = constants.BIGDECIMAL_ZERO;
      }

      const poolTokenId = id.concat("-").concat(tokenPriceId);

      if (
        pool.active &&
        !pool.crp &&
        pool.tokensCount.notEqual(constants.BIGINT_ZERO) &&
        pool.publicSwap &&
        (tokenPrice.poolTokenId == poolTokenId ||
          poolLiquidity.gt(tokenPrice.poolLiquidity)) &&
        ((tokenPriceId != WETH.toString() && tokenPriceId != DAI.toString()) ||
          (pool.tokensCount.equals(BigInt.fromI32(2)) && hasUsdPrice))
      ) {
        tokenPrice.price = constants.BIGDECIMAL_ZERO;

        const idx = pool.inputTokens.indexOf(tokenPriceId);
        const balance = pool.inputTokenBalances.at(idx).toBigDecimal();
        const weight = pool.inputTokenWeights.at(idx);
        if (balance.gt(constants.BIGDECIMAL_ZERO)) {
          tokenPrice.price = poolLiquidity
            .div(pool.totalWeight)
            .times(weight)
            .div(balance);
        }

        const token = Token.load(tokenPriceId);
        if (token != null) {
          tokenPrice.symbol = token.symbol;
          tokenPrice.name = token.name;
          tokenPrice.decimals = token.decimals;
          tokenPrice.poolLiquidity = poolLiquidity;
          tokenPrice.poolTokenId = poolTokenId;
          tokenPrice.save();
        }
      }
    }
  }

  // Update pool liquidity

  let liquidity = constants.BIGDECIMAL_ZERO;
  let denormWeight = constants.BIGDECIMAL_ZERO;

  for (let i = 0; i < tokensList.length; i++) {
    const tokenPriceId = tokensList[i];
    const tokenPrice = TokenPrice.load(tokenPriceId);
    if (tokenPrice) {
      const idx = pool.inputTokens.indexOf(tokenPriceId);
      const weight = pool.inputTokenWeights.at(idx);
      const balance = pool.inputTokenBalances.at(idx).toBigDecimal();
      if (
        tokenPrice.price.gt(constants.BIGDECIMAL_ZERO) &&
        weight.gt(denormWeight)
      ) {
        denormWeight = weight;
        liquidity = tokenPrice.price
          .times(balance)
          .div(weight)
          .times(pool.totalWeight);
      }
    }
  }

  const factory = DexAmmProtocol.load(constants.FACTORY_ADDRESS.toHexString());
  if (factory) {
    factory.totalLiquidity = factory.totalLiquidity
      .minus(pool.liquidity)
      .plus(liquidity);
    factory.save();
  }

  pool.liquidity = liquidity;
  pool.save();
}

export function decrPoolCount(
  active: boolean,
  finalized: boolean,
  crp: boolean
): void {
  if (active) {
    const factory = DexAmmProtocol.load(
      constants.FACTORY_ADDRESS.toHexString()
    );
    if (factory != null) {
      factory.totalPoolCount = factory.totalPoolCount - 1;
      if (finalized)
        factory.finalizedPoolCount = factory.finalizedPoolCount - 1;
      if (crp) factory.crpCount = factory.crpCount - 1;
      factory.save();
    }
  }
}

export function saveTransaction(
  event: ethereum.Event,
  eventName: string
): void {
  const tx = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  const userAddress = event.transaction.from.toHex();
  let transaction = Transaction.load(tx);
  if (!transaction) {
    transaction = new Transaction(tx);
  }
  transaction.event = eventName;
  transaction.poolAddress = event.address.toHex();
  transaction.userAddress = userAddress;
  // transaction.gasUsed = event.transaction.gasUsed.toBigDecimal()
  transaction.gasPrice = event.transaction.gasPrice.toBigDecimal();
  transaction.tx = event.transaction.hash;
  transaction.timestamp = event.block.timestamp.toI32();
  transaction.block = event.block.number.toI32();
  transaction.save();

  createUserEntity(userAddress);
}

export function createUserEntity(address: string): void {
  if (!User.load(address)) {
    const user = new User(address);
    user.save();
  }
}

export function isCrp(address: Address): boolean {
  const crpFactory = CRPFactory.bind(Address.fromString(CRP_FACTORY));
  const isCrp = crpFactory.try_isCrp(address);
  if (isCrp.reverted) return false;
  return isCrp.value;
}

export function getCrpUnderlyingPool(
  crp: ConfigurableRightsPool
): string | null {
  const bPool = crp.try_bPool();
  if (bPool.reverted) return null;
  return bPool.value.toHexString();
}

export function getCrpController(crp: ConfigurableRightsPool): string | null {
  const controller = crp.try_getController();
  if (controller.reverted) return null;
  return controller.value.toHexString();
}

export function getCrpSymbol(crp: ConfigurableRightsPool): string {
  const symbol = crp.try_symbol();
  if (symbol.reverted) return "";
  return symbol.value;
}

export function getCrpName(crp: ConfigurableRightsPool): string {
  const name = crp.try_name();
  if (name.reverted) return "";
  return name.value;
}

export function getCrpCap(crp: ConfigurableRightsPool): BigInt {
  const cap = crp.try_getCap();
  if (cap.reverted) return constants.BIGINT_ZERO;
  return cap.value;
}

export function getCrpRights(crp: ConfigurableRightsPool): string[] {
  const rights = crp.try_rights();
  if (rights.reverted) return [];
  const rightsArr: string[] = [];
  if (rights.value.value0) rightsArr.push("canPauseSwapping");
  if (rights.value.value1) rightsArr.push("canChangeSwapFee");
  if (rights.value.value2) rightsArr.push("canChangeWeights");
  if (rights.value.value3) rightsArr.push("canAddRemoveTokens");
  if (rights.value.value4) rightsArr.push("canWhitelistLPs");
  if (rights.value.value5) rightsArr.push("canChangeCap");
  return rightsArr;
}
