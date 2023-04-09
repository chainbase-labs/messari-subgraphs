import {Address, BigDecimal, BigInt, log} from '@graphprotocol/graph-ts'
import {
  GulpCall,
  LOG_CALL,
  LOG_EXIT,
  LOG_JOIN,
  LOG_SWAP,
  Pool as BPool,
  Transfer
} from '../../generated/templates/Pool/Pool'
import {Swap, TokenPrice} from '../../generated/schema'
import {
  decrPoolCount,
  getCrpUnderlyingPool,
  getOrCreateLiquidityPool,
  getOrCreatePoolShareEntity,
  getOrCreateProtocol,
  getOrCreateTokenEntity, hexToDecimal,
  saveTransaction,
  updatePoolLiquidity
} from './helpers'
import {
  ConfigurableRightsPool,
  OwnershipTransferred
} from '../../generated/Factory/ConfigurableRightsPool'
import * as constants from "../../src/common/constants";

/************************************
 ********** Pool Controls ***********
 ************************************/

export function handleSetSwapFee(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)


  let swapFee = hexToDecimal(event.params.data.toHexString().slice(-40), 0)

  pool.swapFee = swapFee
  pool.save()
  // saveTransaction(event, 'setSwapFee')
}

export function handleSetController(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)
  let controller = Address.fromString(event.params.data.toHexString().slice(-40))

  pool.controller = controller
  pool.save()

  // saveTransaction(event, 'setController')
}

export function handleSetCrpController(event: OwnershipTransferred): void {
  // This event occurs on the CRP contract rather than the underlying pool so we must perform a lookup.
  let crp = ConfigurableRightsPool.bind(event.address)
  let crpPool = getCrpUnderlyingPool(crp)
  if (crpPool !== null) {
    let pool = getOrCreateLiquidityPool(crpPool)

    pool.crpController = event.params.newOwner
    pool.save()
    // We overwrite event address so that ownership transfers can be linked to Pool entities for above reason.
    event.address = Address.fromString(pool.id)
  }

  // saveTransaction(event, 'setCrpController')
}


export function handleSetPublicSwap(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)
  let publicSwap = event.params.data.toHexString().slice(-1) == '1'

  pool.publicSwap = publicSwap
  pool.save()

  // saveTransaction(event, 'setPublicSwap')
}

export function handleFinalize(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  pool.finalized = true
  pool.symbol = 'BPT'
  pool.publicSwap = true
  pool.save()

  let factory = getOrCreateProtocol(constants.FACTORY_ADDRESS.toHexString())

  factory.finalizedPoolCount = factory.finalizedPoolCount + 1
  factory.save()

  // saveTransaction(event, 'finalize')
}

export function handleRebind(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  let tokenAddress = Address.fromString(event.params.data.toHexString().slice(34, 74))
  let inputTokens = pool.inputTokens || []
  let idx = inputTokens.indexOf(tokenAddress.toHexString())

  let token = getOrCreateTokenEntity(tokenAddress);
  let inputTokenWeights = pool.inputTokenWeights;
  let inputTokenBalances = pool.inputTokenBalances;
  let denormWeight = hexToDecimal(event.params.data.toHexString().slice(138),0)
  let balance =BigInt.fromString(hexToDecimal(event.params.data.toHexString().slice(74, 138),0).toString())
  if (idx == -1) {
    inputTokens.push(token.id);
    inputTokenWeights.push(denormWeight);
    inputTokenBalances.push(balance);
    pool.inputTokens=inputTokens
    pool.inputTokenWeights=inputTokenWeights
    pool.inputTokenBalances=inputTokenBalances
    pool.totalWeight = pool.totalWeight.plus(denormWeight);
  } else {
    let oldWeight = inputTokenWeights.at(idx)
    if (denormWeight.gt(oldWeight)) {
      pool.totalWeight = pool.totalWeight.plus(denormWeight.minus(oldWeight))
    } else {
      pool.totalWeight = pool.totalWeight.minus(oldWeight.minus(denormWeight))
    }
    inputTokenWeights[idx] = denormWeight
    inputTokenBalances[idx] = balance
  }

  if (balance.equals(constants.BIGINT_ZERO)) {
    decrPoolCount(pool.active, pool.finalized, pool.crp)
    pool.active = false
  }
  pool.tokensCount = BigInt.fromI32(inputTokens.length)
  pool.save()

  //todo:待测试
  // updatePoolLiquidity(poolId)
  // saveTransaction(event, 'rebind')
}

export function handleUnbind(event: LOG_CALL): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  let tokenAddress ="0x"+event.params.data.toHexString().slice(-40)
  let tokensList = pool.inputTokens
  let idx = tokensList.indexOf(tokenAddress)
  tokensList.splice(idx, 1)
  pool.inputTokens = tokensList
  pool.tokensCount = BigInt.fromI32(tokensList.length)

  let weight = pool.inputTokenWeights.at(idx)
  pool.totalWeight = pool.totalWeight.minus(weight)
  let weights= pool.inputTokenWeights
  weights.splice(idx,1)
  let balances= pool.inputTokenBalances
  balances.splice(idx,1)
  pool.inputTokenWeights=weights
  pool.inputTokenBalances=balances
  pool.save()

  // updatePoolLiquidity(poolId)
  // saveTransaction(event, 'unbind')
}

export function handleGulp(call: GulpCall): void {
  // let poolId = call.to.toHexString()
  // let pool = getOrCreateLiquidityPool(poolId)
  //
  // let address = call.inputs.token.toHexString()
  //
  // let bpool = BPool.bind(Address.fromString(poolId))
  // let balanceCall = bpool.try_getBalance(Address.fromString(address))
  //
  // let inputTokens = pool.inputTokens;
  // let idx = inputTokens.indexOf(address)
  //
  // if (idx > 0) {
  //   let balance = constants.BIGINT_ZERO
  //   if (!balanceCall.reverted) {
  //     balance = balanceCall.value
  //   }
  //   pool.inputTokenBalances[idx] = balance
  //   pool.save()
  // }

  // updatePoolLiquidity(poolId)
}

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  pool.joinsCount = pool.joinsCount.plus(constants.BIGINT_ONE)
  let address = event.params.tokenIn.toHex()
  let idx = pool.inputTokens.indexOf(address);

  let tokenAmountIn = event.params.tokenAmountIn
  let newAmount = pool.inputTokenBalances.at(idx).plus(tokenAmountIn)
  let balances=pool.inputTokenBalances
  balances[idx] = newAmount
  pool.inputTokenBalances=balances
  pool.save()

  // updatePoolLiquidity(poolId)
  // saveTransaction(event, 'join')
}

export function handleExitPool(event: LOG_EXIT): void {
  let poolId = event.address.toHex()
  let address = event.params.tokenOut.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  let tokenAmountOut = event.params.tokenAmountOut
  let idx = pool.inputTokens.indexOf(address);
  let newAmount = pool.inputTokenBalances.at(idx).minus(tokenAmountOut)
  let balances=pool.inputTokenBalances
  balances[idx]=newAmount
  pool.inputTokenBalances = balances
  pool.exitsCount = pool.exitsCount.plus(constants.BIGINT_ONE)
  if (newAmount.equals(constants.BIGINT_ZERO)) {
    decrPoolCount(pool.active, pool.finalized, pool.crp)
    pool.active = false
  }
  pool.save()

  // updatePoolLiquidity(poolId)
  // saveTransaction(event, 'exit')
}

/************************************
 ************** SWAPS ***************
 ************************************/

export function handleSwap(event: LOG_SWAP): void {
  let poolId = event.address.toHex()
  let pool = getOrCreateLiquidityPool(poolId)

  let tokenIn = event.params.tokenIn.toHex()
  let tokenInIdx = pool.inputTokens.indexOf(tokenIn)
  let tokenAmountIn = event.params.tokenAmountIn
  let newAmountIn = pool.inputTokenBalances.at(tokenInIdx).plus(tokenAmountIn)
  let balances=pool.inputTokenBalances
  balances[tokenInIdx] = newAmountIn

  let tokenOut = event.params.tokenOut.toHexString()
  let tokenOutIdx = pool.inputTokens.indexOf(tokenOut)
  let tokenAmountOut = event.params.tokenAmountOut
  let newAmountOut = pool.inputTokenBalances.at(tokenOutIdx).minus(tokenAmountOut)
  balances[tokenOutIdx] = newAmountOut

  pool.inputTokenBalances=balances

  // updatePoolLiquidity(poolId)

  let swapId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let swap = Swap.load(swapId)
  if (!swap) {
    swap = new Swap(swapId)
  }

  //todo：待测试
  // let tokenOutPriceValue=updateTokenPriceValue(tokenOut,poolId)
  //
  // let totalSwapVolume = pool.totalSwapVolume
  // let totalSwapFee = pool.totalSwapFee
  // let liquidity = pool.liquidity
  // let swapValue = constants.BIGDECIMAL_ZERO
  // let swapFeeValue = constants.BIGDECIMAL_ZERO
  // let factory = getOrCreateProtocol(constants.FACTORY_ADDRESS.toHexString())
  //
  // if (tokenOutPriceValue.gt(constants.BIGDECIMAL_ZERO)) {
  //   swapValue = tokenOutPriceValue.times(tokenAmountOut.toBigDecimal())
  //   swapFeeValue = swapValue.times(pool.swapFee)
  //   totalSwapVolume = totalSwapVolume.plus(swapValue)
  //   totalSwapFee = totalSwapFee.plus(swapFeeValue)
  //
  //   factory.totalSwapVolume = factory.totalSwapVolume.plus(swapValue)
  //   factory.totalSwapFee = factory.totalSwapFee.plus(swapFeeValue)
  //   factory.txCount = factory.txCount.plus(constants.BIGINT_ONE)
  //   factory.save()
  //
  //   pool.totalSwapVolume = totalSwapVolume
  //   pool.totalSwapFee = totalSwapFee
  // }

  // swap.poolTotalSwapVolume = totalSwapVolume
  // swap.poolTotalSwapFee = totalSwapFee
  // swap.poolLiquidity = liquidity
  // swap.value = swapValue
  // swap.feeValue = swapFeeValue

  pool.swapsCount = pool.swapsCount.plus(constants.BIGINT_ONE)

  if (newAmountIn.equals(constants.BIGINT_ZERO) || newAmountOut.equals(constants.BIGINT_ZERO)) {
    decrPoolCount(pool.active, pool.finalized, pool.crp)
    pool.active = false
  }
  pool.save()

  let tokenInEntity = getOrCreateTokenEntity(Address.fromString(tokenIn))
  let tokenOutEntity = getOrCreateTokenEntity(Address.fromString(tokenOut))
  swap.caller = event.params.caller
  swap.tokenIn = tokenIn
  swap.tokenInSym = tokenInEntity.symbol
  swap.tokenOut = tokenOut
  swap.tokenOutSym = tokenOutEntity.symbol
  swap.amountIn = tokenAmountIn
  swap.amountOut = tokenAmountOut
  swap.pool = event.address.toHex()
  swap.userAddress = event.transaction.from.toHex()

  swap.timestamp = event.block.timestamp
  swap.save()

  // saveTransaction(event, 'swap')
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {
  // let poolId = event.address.toHex()
  //
  // let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  //
  // let isMint = event.params.src.toHex() == ZERO_ADDRESS
  // let isBurn = event.params.dst.toHex() == ZERO_ADDRESS
  //
  // let poolShareFromId = poolId.concat('-').concat(event.params.src.toHex())
  // let poolShareFrom = getOrCreatePoolShareEntity(poolShareFromId, poolId, event.params.src.toHex())
  // let poolShareFromBalance = poolShareFrom == null ? constants.BIGDECIMAL_ZERO : poolShareFrom.balance
  //
  // let poolShareToId = poolId.concat('-').concat(event.params.dst.toHex())
  // let poolShareTo = getOrCreatePoolShareEntity(poolShareToId, poolId, event.params.dst.toHex())
  // let poolShareToBalance = poolShareTo == null ? constants.BIGDECIMAL_ZERO : poolShareTo.balance
  //
  // let pool = getOrCreateLiquidityPool(poolId)
  //
  // if (isMint) {
  //   poolShareTo.balance = poolShareTo.balance.plus(event.params.amt.toBigDecimal())
  //   poolShareTo.save()
  //
  //   pool.totalShares = pool.totalShares.plus(event.params.amt.toBigDecimal())
  // } else if (isBurn) {
  //   poolShareFrom.balance = poolShareFrom.balance.minus(event.params.amt.toBigDecimal())
  //   poolShareFrom.save()
  //
  //   pool.totalShares = pool.totalShares.minus(event.params.amt.toBigDecimal())
  // } else {
  //   poolShareTo.balance = poolShareTo.balance.plus(event.params.amt.toBigDecimal())
  //   poolShareTo.save()
  //
  //   poolShareFrom.balance = poolShareFrom.balance.minus(event.params.amt.toBigDecimal())
  //   poolShareFrom.save()
  // }
  //
  // if (
  //     poolShareTo !== null
  //     && poolShareTo.balance.notEqual(constants.BIGDECIMAL_ZERO)
  //     && poolShareToBalance.equals(constants.BIGDECIMAL_ZERO)
  // ) {
  //   pool.holdersCount = pool.holdersCount.plus(constants.BIGINT_ONE)
  // }
  //
  // if (
  //     poolShareFrom !== null
  //     && poolShareFrom.balance.equals(constants.BIGDECIMAL_ZERO)
  //     && poolShareFromBalance.notEqual(constants.BIGDECIMAL_ZERO)
  // ) {
  //   pool.holdersCount = pool.holdersCount.minus(constants.BIGINT_ONE)
  // }
  //
  // pool.save()
}

