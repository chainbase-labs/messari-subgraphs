import {
  OwnerUpdate as SmartTokenOwnerUpdate,
  Transfer,
} from "../../generated/templates/SmartTokenContract/SmartTokenContract";
import { LiquidityPool } from "../../generated/schema";
import { getOrCreateToken } from "./helper";

export function handleTransfer(event: Transfer): void {}

// export function handleApproval(event: Approval): void {}

export function handleSmartTokenOwnerUpdate(
  event: SmartTokenOwnerUpdate
): void {
  const smartTokenAddress = event.address;
  const smartToken = getOrCreateToken(smartTokenAddress);

  const pool = LiquidityPool.load(
    event.params._newOwner.toHexString()
  ) as LiquidityPool;
  if (!pool) {
    return;
  }
  smartToken._owner = pool.id;
  pool.outputToken = smartToken.id;
  smartToken.save();
  pool.save();
}
