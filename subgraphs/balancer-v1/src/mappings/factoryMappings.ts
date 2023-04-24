import { Address } from "@graphprotocol/graph-ts";
import { LOG_NEW_POOL } from "../../generated/Factory/Factory";
import {
  CrpController as CrpControllerContract,
  Pool as PoolContract,
} from "../../generated/templates";
import {
  getCrpCap,
  getCrpController,
  getCrpName,
  getCrpRights,
  getCrpSymbol,
  getOrCreateLiquidityPool,
  getOrCreateProtocol,
  isCrp,
} from "./helpers";
import { ConfigurableRightsPool } from "../../generated/Factory/ConfigurableRightsPool";

export function handleNewPool(event: LOG_NEW_POOL): void {
  const factory = getOrCreateProtocol(event.address.toHexString());
  const pool = getOrCreateLiquidityPool(
    event.params.pool.toHexString(),
    event.block
  );

  pool.protocol = factory.id;
  pool._crp = isCrp(event.params.caller);
  pool._controller = event.params.caller;
  pool.createdTimestamp = event.block.timestamp;
  pool._tx = event.transaction.hash;

  if (pool._crp) {
    factory._crpCount += 1;
    const crp = ConfigurableRightsPool.bind(event.params.caller);
    pool.symbol = getCrpSymbol(crp);
    pool.name = getCrpName(crp);
    const crpControl = getCrpController(crp);

    if (crpControl) {
      pool._crpController = Address.fromString(crpControl);
    }
    pool._rights = getCrpRights(crp);
    pool._cap = getCrpCap(crp);

    // Listen for any future crpController changes.
    CrpControllerContract.create(event.params.caller);
  }

  factory.totalPoolCount = factory.totalPoolCount + 1;
  factory.save();
  pool.save();
  PoolContract.create(event.params.pool);
}
