import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Factory } from "../../../../../generated/Factory/Factory";
import {
  BIGINT_ZERO,
  FeeSwitch,
  MINIMUM_LIQUIDITY_FIVE_THOUSAND,
  MINIMUM_LIQUIDITY_FOUR_HUNDRED_THOUSAND,
  Network,
  PROTOCOL_SCHEMA_VERSION,
  RewardIntervalType,
} from "../../../../../src/common/constants";
import { Configurations } from "../../../../../configurations/configurations/interface";
import {
  PROTOCOL_METHODOLOGY_VERSION,
  PROTOCOL_NAME,
  PROTOCOL_SLUG,
  PROTOCOL_SUBGRAPH_VERSION,
} from "../../../src/common/constants";

export class SaitaswapMainnetConfigurations implements Configurations {
  getNetwork(): string {
    return Network.MAINNET;
  }

  getSchemaVersion(): string {
    return PROTOCOL_SCHEMA_VERSION;
  }

  getSubgraphVersion(): string {
    return PROTOCOL_SUBGRAPH_VERSION;
  }

  getMethodologyVersion(): string {
    return PROTOCOL_METHODOLOGY_VERSION;
  }

  getProtocolName(): string {
    return PROTOCOL_NAME;
  }

  getProtocolSlug(): string {
    return PROTOCOL_SLUG;
  }

  getFactoryAddress(): string {
    return "0x35113a300ca0d7621374890abfeac30e88f214b1";
  }

  getFactoryContract(): Factory {
    return Factory.bind(
      Address.fromString("0x35113a300ca0d7621374890abfeac30e88f214b1")
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTradeFee(blockNumber: BigInt): BigDecimal {
    return BigDecimal.fromString("0.3");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProtocolFeeToOn(blockNumber: BigInt): BigDecimal {
    return BigDecimal.fromString("0.05");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLPFeeToOn(blockNumber: BigInt): BigDecimal {
    return BigDecimal.fromString("0.25");
  }

  getProtocolFeeToOff(): BigDecimal {
    return BigDecimal.fromString("0");
  }

  getLPFeeToOff(): BigDecimal {
    return BigDecimal.fromString("0.3");
  }

  getFeeOnOff(): string {
    return FeeSwitch.OFF;
  }

  getRewardIntervalType(): string {
    return RewardIntervalType.NONE;
  }

  getRewardTokenRate(): BigInt {
    return BIGINT_ZERO;
  }

  getReferenceToken(): string {
    return "";
  }

  getRewardToken(): string {
    return "";
  }

  getWhitelistTokens(): string[] {
    return [];
  }

  getStableCoins(): string[] {
    return [];
  }

  getStableOraclePools(): string[] {
    return [];
  }

  getUntrackedPairs(): string[] {
    return [""];
  }

  getUntrackedTokens(): string[] {
    return [
      // Uncomment some of these depending on how to pricing turns out.
    ];
  }

  getBrokenERC20Tokens(): string[] {
    return [];
  }

  getMinimumLiquidityThresholdTrackVolume(): BigDecimal {
    return MINIMUM_LIQUIDITY_FOUR_HUNDRED_THOUSAND;
  }

  getMinimumLiquidityThresholdTrackPrice(): BigDecimal {
    return MINIMUM_LIQUIDITY_FIVE_THOUSAND;
  }
}
