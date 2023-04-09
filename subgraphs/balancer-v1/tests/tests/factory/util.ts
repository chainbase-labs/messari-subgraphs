import {Address, BigDecimal, BigInt, Bytes, ethereum, log} from "@graphprotocol/graph-ts";
import {LOG_NEW_POOL} from "../../../generated/Factory/Factory";
import {createMockedFunction, newMockEvent} from "matchstick-as";
import {LOG_CALL, LOG_EXIT, LOG_JOIN, LOG_SWAP} from "../../../generated/templates/Pool/Pool";
import {handleRebind} from "../../../src/mappings/poolMappings";
import {getOrCreateLiquidityPool} from "../../../src/mappings/helpers";
import * as constants from "../../../src/common/constants";
import {TokenPrice} from "../../../generated/schema";

export function createNewPoolEvent(address:string,caller:string,pool:string,txHash:string,txIndex:BigInt,blockNumber:BigInt,timestamp:BigInt):LOG_NEW_POOL{
  let newPoolEvent = changetype<LOG_NEW_POOL>(newMockEvent());
  newPoolEvent.address=Address.fromString(address)

  newPoolEvent.parameters=new Array()
  let callerParam=new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller)))
  let poolParam=new ethereum.EventParam("pool",ethereum.Value.fromAddress(Address.fromString(pool)))
  newPoolEvent.parameters.push(callerParam)
  newPoolEvent.parameters.push(poolParam)

  newPoolEvent.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
  newPoolEvent.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),txIndex,Address.zero(),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))

  return newPoolEvent
}

export function createLOGCALLEvent(address:string,sig:string,caller:string,data:Bytes):LOG_CALL{
  let logCallEvent = changetype<LOG_CALL>(newMockEvent());
  logCallEvent.address=Address.fromString(address)

  logCallEvent.parameters=new Array()
  let dataParam=new ethereum.EventParam("data",ethereum.Value.fromBytes(data))
  logCallEvent.parameters.push(new ethereum.EventParam("sig",ethereum.Value.fromBytes(Bytes.fromHexString(sig))))
  logCallEvent.parameters.push(new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller))))
  logCallEvent.parameters.push(dataParam)

  return logCallEvent
}

export function newBindFunction(address:string,sig:string,caller:string,data:string,token:string):void{
  let event=createLOGCALLEvent(address,sig,caller,Bytes.fromHexString(data))

  createMockedFunction(Address.fromString(token),"symbol","symbol():(string)").returns([ethereum.Value.fromString(" ")])
  createMockedFunction(Address.fromString(token),"name","name():(string)").returns([ethereum.Value.fromString(" ")])
  createMockedFunction(Address.fromString(token),"decimals","decimals():(uint8)").returns([ethereum.Value.fromI32(18)])

  handleRebind(event)
}

export function createExitEvent(address:string,caller:string,tokenOut:string,tokenAmountOut:BigInt,txHash:string,txIndex:BigInt,blockNumber:BigInt,timestamp:BigInt):LOG_EXIT{
  let exitEvent = changetype<LOG_EXIT>(newMockEvent());
  exitEvent.address=Address.fromString(address)

  exitEvent.parameters=new Array()
  let callerParam=new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller)))
  let tokenOutParam=new ethereum.EventParam("tokenOut",ethereum.Value.fromAddress(Address.fromString(tokenOut)))
  let tokenAmountOutParam=new ethereum.EventParam("tokenAmountOut",ethereum.Value.fromSignedBigInt(tokenAmountOut))
  exitEvent.parameters.push(callerParam)
  exitEvent.parameters.push(tokenOutParam)
  exitEvent.parameters.push(tokenAmountOutParam)


  exitEvent.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
  exitEvent.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),txIndex,Address.zero(),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))

  return exitEvent
}

export function createJoinEvent(address:string,caller:string,tokenIn:string,tokenAmountIn:BigInt,txHash:string,txIndex:BigInt,blockNumber:BigInt,timestamp:BigInt):LOG_JOIN{
  let joinEvent = changetype<LOG_JOIN>(newMockEvent());
  joinEvent.address=Address.fromString(address)

  joinEvent.parameters=new Array()
  let callerParam=new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller)))
  let tokenOutParam=new ethereum.EventParam("tokenIn",ethereum.Value.fromAddress(Address.fromString(tokenIn)))
  let tokenAmountOutParam=new ethereum.EventParam("tokenAmountIn",ethereum.Value.fromSignedBigInt(tokenAmountIn))
  joinEvent.parameters.push(callerParam)
  joinEvent.parameters.push(tokenOutParam)
  joinEvent.parameters.push(tokenAmountOutParam)


  joinEvent.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
  joinEvent.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),txIndex,Address.zero(),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))

  return joinEvent
}

export function createSwapEvent(address:string,caller:string,tokenIn:string,tokenAmountIn:BigInt,tokenOut:string,tokenAmountOut:BigInt,txHash:string,logIndex:BigInt,blockNumber:BigInt,timestamp:BigInt):LOG_SWAP{
  let event = changetype<LOG_SWAP>(newMockEvent());
  event.address=Address.fromString(address)

  event.parameters=new Array()
  let callerParam=new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller)))
  let tokenInParam=new ethereum.EventParam("tokenIn",ethereum.Value.fromAddress(Address.fromString(tokenIn)))
  let tokenOutParam=new ethereum.EventParam("tokenOut",ethereum.Value.fromAddress(Address.fromString(tokenOut)))
  let tokenAmountInParam=new ethereum.EventParam("tokenAmountIn",ethereum.Value.fromSignedBigInt(tokenAmountIn))
  let tokenAmountOutParam=new ethereum.EventParam("tokenAmountOut",ethereum.Value.fromSignedBigInt(tokenAmountOut))
  event.parameters.push(callerParam)
  event.parameters.push(tokenInParam)
  event.parameters.push(tokenOutParam)
  event.parameters.push(tokenAmountInParam)
  event.parameters.push(tokenAmountOutParam)

  event.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
  event.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),BigInt.zero(),Address.fromString("0x19aebfcf95497ea1609268e54b670f38b85f27fc"),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))

  event.logIndex=logIndex
  return event
}

export function updateTokenPriceValue(tokenOut:string,poolId:string):BigDecimal{
  let pool = getOrCreateLiquidityPool(poolId)
  let tokenOutPriceValue = constants.BIGDECIMAL_ZERO
  let tokenOutPrice = TokenPrice.load(tokenOut)
  let tokenOutIdx = pool.inputTokens.indexOf(tokenOut)

  let tokensList = pool.inputTokens || []
  if (tokenOutPrice) {
    tokenOutPriceValue = tokenOutPrice.price
  } else {
    for (let i: i32 = 0; i < tokensList.length; i++) {
      let tokenPriceId = tokensList[i]
      if (!tokenOutPriceValue.gt(constants.BIGDECIMAL_ZERO) && tokenPriceId !== tokenOut) {
        let tokenPrice = TokenPrice.load(tokenPriceId)
        if (tokenPrice !== null && tokenPrice.price.gt(constants.BIGDECIMAL_ZERO)) {
          let idx = pool.inputTokens.indexOf(tokenPriceId)
          let balance = pool.inputTokenBalances.at(idx).toBigDecimal()
          let weight = pool.inputTokenWeights.at(idx)
          let balanceOut = pool.inputTokenBalances.at(tokenOutIdx).toBigDecimal()
          let weightOut = pool.inputTokenWeights.at(tokenOutIdx)
          tokenOutPriceValue = tokenPrice.price
          .times(balance)
          .div(weight)
          .times(weightOut)
          .div(balanceOut)
        }
      }
    }
  }
  return tokenOutPriceValue
}