import {Address,log} from '@graphprotocol/graph-ts'
import {LOG_NEW_POOL} from '../../generated/Factory/Factory'
import {
  CrpController as CrpControllerContract,
  Pool as PoolContract
} from '../../generated/templates'
import {
  getCrpCap,
  getCrpController,
  getCrpName,
  getCrpRights,
  getCrpSymbol,
  getOrCreateLiquidityPool,
  getOrCreateProtocol,
  isCrp
} from './helpers'
import {
  ConfigurableRightsPool
} from '../../generated/Factory/ConfigurableRightsPool';

export function handleNewPool(event: LOG_NEW_POOL): void {
  let factory = getOrCreateProtocol(event.address.toHexString())
  let pool = getOrCreateLiquidityPool(event.params.pool.toHexString())

  pool.protocol = factory.id
  pool.crp = isCrp(event.params.caller)
  pool.controller = event.params.caller
  pool.createdTimestamp = event.block.timestamp
  pool.tx = event.transaction.hash

  if (pool.crp) {
    factory.crpCount += 1
    let crp = ConfigurableRightsPool.bind(event.params.caller)
    pool.symbol = getCrpSymbol(crp)
    pool.name = getCrpName(crp)
    let crpControl = getCrpController(crp)

    if (crpControl) {
      pool.crpController = Address.fromString(crpControl)
    }
    pool.rights = getCrpRights(crp)
    pool.cap = getCrpCap(crp)

    // Listen for any future crpController changes.
    CrpControllerContract.create(event.params.caller)
  }

  factory.totalPoolCount = factory.totalPoolCount + 1
  factory.save()
  pool.save()
  PoolContract.create(event.params.pool)
}
