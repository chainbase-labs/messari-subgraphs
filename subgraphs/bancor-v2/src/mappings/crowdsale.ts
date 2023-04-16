import { Address } from "@graphprotocol/graph-ts";

import { OwnerUpdate } from "../../generated/CrowdsaleContract/CrowdsaleContract";

import { SmartTokenContract as SmartTokenTemplate } from "../../generated/templates";

import { converterBackfill, smartTokenBackfill } from "./backfill";
import { getOrCreateLiquidityPool, getOrCreateToken } from "./helper";

export function createBackfill(event: OwnerUpdate): void {
  for (let i = 0; i < converterBackfill.length; i++) {
    const converterAddress = converterBackfill[i];
    getOrCreateLiquidityPool(
      event.address.toHexString(),
      "Crowdsale",
      "Crowdsale",
      Address.fromString(converterAddress),
      event.block.timestamp,
      event.block.number
    );
  }

  for (let j = 0; j < smartTokenBackfill.length; j++) {
    const smartTokenAddress = smartTokenBackfill[j];
    SmartTokenTemplate.create(Address.fromString(smartTokenAddress));
    getOrCreateToken(Address.fromString(smartTokenAddress));
  }
}
