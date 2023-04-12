import {Address, BigDecimal, BigInt, Bytes, ethereum, log} from "@graphprotocol/graph-ts";
import {LogAddMarket} from "../../../generated/Margin/SoloMargin";
import {createMockedFunction, newMockEvent} from "matchstick-as";

export function createLogAddMarket(marketId: BigInt, token: string,txHash:string,txIndex:BigInt,blockNumber:BigInt,timestamp:BigInt): LogAddMarket {
    let logAddMarket = changetype<LogAddMarket>(newMockEvent());
    // logAddMarket.address=Address.fromString(address)

    logAddMarket.parameters=new Array()
    let marketIdParam=new ethereum.EventParam("marketId",ethereum.Value.fromSignedBigInt(marketId))
    let tokenParam=new ethereum.EventParam("token",ethereum.Value.fromAddress(Address.fromString(token)))
    logAddMarket.parameters.push(marketIdParam)
    logAddMarket.parameters.push(tokenParam)

    logAddMarket.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
    logAddMarket.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),txIndex,Address.zero(),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))

    return logAddMarket
}

// export function createLogIndexUpdate(address:string,caller:string,pool:string,txHash:string,txIndex:BigInt,blockNumber:BigInt,timestamp:BigInt):LOG_NEW_POOL{
//     let newPoolEvent = changetype<LOG_NEW_POOL>(newMockEvent());
//     newPoolEvent.address=Address.fromString(address)
//
//     newPoolEvent.parameters=new Array()
//     let callerParam=new ethereum.EventParam("caller",ethereum.Value.fromAddress(Address.fromString(caller)))
//     let poolParam=new ethereum.EventParam("pool",ethereum.Value.fromAddress(Address.fromString(pool)))
//     newPoolEvent.parameters.push(callerParam)
//     newPoolEvent.parameters.push(poolParam)
//
//     newPoolEvent.block=new ethereum.Block(Bytes.fromHexString("0x11"),Bytes.fromHexString("0x12"),Bytes.fromHexString("0x13"),Address.zero(),Bytes.fromHexString("0x14"),Bytes.fromHexString("0x"),Bytes.fromHexString("0x"),blockNumber,BigInt.fromI32(0),BigInt.fromI32(0),timestamp,BigInt.fromI32(0),BigInt.fromI32(0),null,null)
//     newPoolEvent.transaction=new ethereum.Transaction(Bytes.fromHexString(txHash),txIndex,Address.zero(),Address.zero(),BigInt.fromI32(0),BigInt.fromI32(0),BigInt.fromI32(0),Bytes.fromHexString("0x"),BigInt.fromI32(0))
//
//     return newPoolEvent
// }