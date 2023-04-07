import {Address, BigInt, Bytes, ethereum} from "@graphprotocol/graph-ts";
import {LOG_NEW_POOL} from "../../../generated/Factory/Factory";
import {newMockEvent} from "matchstick-as";
import {LOG_CALL} from "../../../generated/templates/Pool/Pool";

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