import { BigInt, store } from "@graphprotocol/graph-ts";
import { createLiquidityPool, ZERO_BD } from "./helpers";
import { NewDPP, RemoveDPP } from "../../../../generated/DPPFactory/DPPFactory";
import { NewDVM, RemoveDVM } from "../../../../generated/DVMFactory/DVMFactory";
import { NewDSP, RemoveDSP } from "../../../../generated/DSPFactory/DSPFactory";
import { DVM } from "../../../../generated/DVMFactory/DVM";
import { DPP } from "../../../../generated/DPPFactory/DPP";
import { DSP } from "../../../../generated/DSPFactory/DSP";
import { NewCP } from "../../../../generated/CrowdPoolingFactory/CrowdPoolingFactory";
import { RemoveCP } from "../../../../generated/CrowdPoolingFactoryV2/CrowdPoolingFactoryV2";

import {
  DPP as DPPTemplate,
  DSP as DSPTemplate,
  DVM as DVMTemplate,
} from "../../../../generated//templates";
import {
  TYPE_DPP_POOL,
  TYPE_DSP_POOL,
  TYPE_DVM_POOL,
} from "../../../../src/common/constant";
import {
  DexAmmProtocol,
  LiquidityPool as LiquidityPoolEntity,
} from "../../../../generated/schema";

export function handleNewDVM(event: NewDVM): void {
  let pair = LiquidityPoolEntity.load(event.params.dvm.toHexString());
  if (!pair) {
    const baseLpToken = event.params.dvm;
    const quoteLpToken = event.params.dvm;
    const lpFeeRate = ZERO_BD;
    pair = createLiquidityPool(
      event.address.toHexString(),
      "DVM Factory",
      "dvm",
      event.params.dvm,
      event.params.baseToken,
      event.params.quoteToken,
      baseLpToken,
      quoteLpToken,
      event.block.timestamp,
      event.block.number,
      lpFeeRate,
      TYPE_DVM_POOL
    );
    pair._creator = event.params.creator.toHexString();
    const dvm = DVM.bind(event.params.dvm);
    const pmmState = dvm.try_getPMMState();
    if (pmmState.reverted == false) {
      pair._i = pmmState.value.i;
      pair._k = pmmState.value.K;

      const baseTokenBalance = pmmState.value.B;
      const quoteTokenBalance = pmmState.value.Q;
      pair.inputTokenBalances = [
        BigInt.fromString(baseTokenBalance.toString()),
        BigInt.fromString(quoteTokenBalance.toString()),
      ];
      pair._lpFeeRate = dvm._LP_FEE_RATE_().toBigDecimal();
      pair._mtFeeRateModel = dvm._MT_FEE_RATE_MODEL_();
      pair._maintainer = dvm._MAINTAINER_();
    }
    pair.save();
  }
  DVMTemplate.create(event.params.dvm);
}

export function handleNewDPP(event: NewDPP): void {
  let pair = LiquidityPoolEntity.load(event.params.dpp.toHexString());
  if (!pair) {
    const lpFeeRate = ZERO_BD;
    pair = createLiquidityPool(
      event.address.toHexString(),
      "DPP Factory",
      "dpp",
      event.params.dpp,
      event.params.baseToken,
      event.params.quoteToken,
      null,
      null,
      event.block.timestamp,
      event.block.number,
      lpFeeRate,
      TYPE_DPP_POOL
    );
    pair._creator = event.params.creator.toHexString();
    const dpp = DPP.bind(event.params.dpp);
    const pmmState = dpp.try_getPMMState();
    if (pmmState.reverted == false) {
      pair._i = pmmState.value.i;
      pair._k = pmmState.value.K;

      const baseTokenBalance = pmmState.value.B;
      const quoteTokenBalance = pmmState.value.Q;
      pair.inputTokenBalances = [
        BigInt.fromString(baseTokenBalance.toString()),
        BigInt.fromString(quoteTokenBalance.toString()),
      ];
      pair._lpFeeRate = dpp._LP_FEE_RATE_().toBigDecimal();
      pair._mtFeeRateModel = dpp._MT_FEE_RATE_MODEL_();
      pair._maintainer = dpp._MAINTAINER_();
    }
    pair.save();
  }
  DPPTemplate.create(event.params.dpp);
}

export function handleNewDSP(event: NewDSP): void {
  let pair = LiquidityPoolEntity.load(event.params.DSP.toHexString());
  if (!pair) {
    const baseLpToken = event.params.DSP;
    const quoteLpToken = event.params.DSP;
    const lpFeeRate = ZERO_BD;
    pair = createLiquidityPool(
      event.address.toHexString(),
      "DSP Factory",
      "dsp",
      event.params.DSP,
      event.params.baseToken,
      event.params.quoteToken,
      baseLpToken,
      quoteLpToken,
      event.block.timestamp,
      event.block.number,
      lpFeeRate,
      TYPE_DSP_POOL
    );
    pair._creator = event.params.creator.toHexString();
    const dsp = DSP.bind(event.params.DSP);
    const pmmState = dsp.try_getPMMState();
    if (pmmState.reverted == false) {
      pair._i = pmmState.value.i;
      pair._k = pmmState.value.K;
      const baseTokenBalance = pmmState.value.B;
      const quoteTokenBalance = pmmState.value.Q;
      pair.inputTokenBalances = [
        BigInt.fromString(baseTokenBalance.toString()),
        BigInt.fromString(quoteTokenBalance.toString()),
      ];
      pair._lpFeeRate = dsp._LP_FEE_RATE_().toBigDecimal();
      pair._mtFeeRateModel = dsp._MT_FEE_RATE_MODEL_();
      pair._maintainer = dsp._MAINTAINER_();
    }
    pair.save();
  }

  DSPTemplate.create(event.params.DSP);
}

export function handleNewCP(event: NewCP): void {
  //todo
}

export function handleRemoveDPP(event: RemoveDPP): void {
  store.remove("LiquidityPool", event.params.dpp.toHexString());
  let protocol = DexAmmProtocol.load(
    event.address.toHexString()
  ) as DexAmmProtocol;
  protocol.totalPoolCount -= 1;
  protocol.save();
}

export function handleRemoveDVM(event: RemoveDVM): void {
  store.remove("LiquidityPool", event.params.dvm.toHexString());
  let protocol = DexAmmProtocol.load(
    event.address.toHexString()
  ) as DexAmmProtocol;
  protocol.totalPoolCount -= 1;
  protocol.save();
}

export function handleRemoveDSP(event: RemoveDSP): void {
  store.remove("LiquidityPool", event.params.DSP.toHexString());
  let protocol = DexAmmProtocol.load(
    event.address.toHexString()
  ) as DexAmmProtocol;
  protocol.totalPoolCount -= 1;
  protocol.save();
}

export function handleRemoveCP(event: RemoveCP): void {
  //todo
}
