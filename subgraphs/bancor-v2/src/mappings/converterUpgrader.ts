import { BigInt } from "@graphprotocol/graph-ts";
import {
  ConverterUpgrade,
  UpgradeOldCall,
} from "../../generated/ConverterUpgraderContract/ConverterUpgraderContract";
import { ConverterContract } from "../../generated/ConverterUpgraderContract/ConverterContract";
import { ERC20Contract } from "../../generated/ConverterUpgraderContract/ERC20Contract";
import { LiquidityPool } from "../../generated/schema";
import { getOrCreateLiquidityPool, ZERO_BI } from "./helper";

// Converter events
export function handleConverterUpgrade(event: ConverterUpgrade): void {
  const oldPool = event.params._oldConverter;
  const newPool = event.params._newConverter;
  const oldConverterContract = ConverterContract.bind(oldPool);

  const oldConverterEntity = LiquidityPool.load(oldPool.toHexString());
  if (!oldConverterEntity) {
    return;
  }

  const newConverterEntity = getOrCreateLiquidityPool(
    event.address.toHexString(),
    "",
    "",
    newPool,
    event.block.timestamp,
    event.block.number
  );
  newConverterEntity.outputToken = oldConverterEntity.outputToken;

  // const converterSmartTokenResult = oldConverterContract.try_token();
  // if (!converterSmartTokenResult.reverted) {
  //   const converterSmartTokenAddress = converterSmartTokenResult.value;
  //   const smartToken = getOrCreateToken(converterSmartTokenAddress)
  //   //todo:smartToken 流动性置0
  // }
  const connectorCountResult = oldConverterContract.try_connectorTokenCount();
  if (!connectorCountResult.reverted) {
    const connectorCount = connectorCountResult.value;
    const oldBalances = oldConverterEntity.inputTokenBalances;
    const newBalances = newConverterEntity.inputTokenBalances;

    for (let i = 0; i < connectorCount; i++) {
      const tokenAddress = oldConverterContract.connectorTokens(
        BigInt.fromI32(i)
      );
      const tokenContract = ERC20Contract.bind(tokenAddress);
      oldBalances[i] = tokenContract.balanceOf(oldPool);
      newBalances[i] = tokenContract.balanceOf(newPool);
    }
    oldConverterEntity.inputTokenBalances = oldBalances;
    newConverterEntity.inputTokenBalances = newBalances;
  }
  newConverterEntity.save();
  oldConverterEntity.save();
}

export function handleUpgradeOld(call: UpgradeOldCall): void {
  const poolAddress = call.inputs._converter;
  const pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    return;
  }
  pool.inputTokenBalances.fill(ZERO_BI);
  pool.save();
}
