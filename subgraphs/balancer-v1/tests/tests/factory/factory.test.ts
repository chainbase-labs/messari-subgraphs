import {test,newMockEvent,assert,clearStore,describe,logStore,createMockedFunction,afterEach,afterAll,beforeAll} from "matchstick-as/assembly/index";
import {DexAmmProtocol} from "../../../generated/schema";
import {getOrCreateProtocol,isCrp} from "../../../src/mappings/helpers";
import {LOG_NEW_POOL} from "../../../generated/Factory/Factory";
import {Address, BigInt, Bytes, ethereum,log} from "@graphprotocol/graph-ts";
import {CrpController as CrpControllerContract} from "../../../generated/templates";
import {CRPFactory} from "../../../generated/Factory/CRPFactory";
import {handleNewPool} from "../../../src/mappings/factoryMappings";
import {createLOGCALLEvent, createNewPoolEvent} from "./util";
import {handleSetSwapFee} from "../../../src/mappings/poolMappings";
describe("handleNewPool",()=>{

  afterAll(()=>{
    clearStore()
  })

  test("handleNewPoolWhenIsNotCrp",()=>{
    let factory="0x9424b1412450d0f8fc2255faf6046b98213b76bd"
    let caller="0x487879f338236b992a143f4570913a221261acd7"
    let pool="0x165a50Bc092f6870DC111C349baE5Fc35147ac86"
    let txHash="0x6cf409bbc347d532c79dfab6c7902eb975ae5ada76a339a4c47d36e0aedb805e"
    let txIndex=BigInt.fromI32(29)
    let blockNumber=BigInt.fromI32(9664102)
    let timestamp=BigInt.fromI32(1584086880)
    let event=createNewPoolEvent(factory,caller,pool,txHash,txIndex,blockNumber,timestamp)

    let CRP_FACTORY="0xed52D8E202401645eDAD1c0AA21e872498ce47D0"
    let argsArray:Array<ethereum.Value>=[ethereum.Value.fromAddress(event.params.caller)]
    createMockedFunction(Address.fromString(CRP_FACTORY),"isCrp","isCrp(address):(bool)").withArgs(argsArray).returns([ethereum.Value.fromBoolean(false)])

    handleNewPool(event)

    assert.fieldEquals("DexAmmProtocol",factory.toLowerCase(),"totalPoolCount","1")

    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"protocol",factory.toLowerCase())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"crp","false")
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"controller",caller.toLowerCase())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"createdTimestamp",timestamp.toString())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"tx",txHash.toLowerCase())
  })

  test("handleNewPoolWhenIsCrp",()=>{
    let factory="0x9424b1412450d0f8fc2255faf6046b98213b76bd"
    let caller="0x64ba29ae508978a73106e50d18a623d70f29f373"
    let pool="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let txHash="0xe3cbe690ea0b0fb5c6cc5169599d1581cde5bc8011ee78e8b737cc400bdaea1e"
    let txIndex=BigInt.fromI32(29)
    let blockNumber=BigInt.fromI32(15227789)
    let timestamp=BigInt.fromI32(1584086880)
    let event=createNewPoolEvent(factory,caller,pool,txHash,txIndex,blockNumber,timestamp)

    let CRP_FACTORY="0xed52D8E202401645eDAD1c0AA21e872498ce47D0"
    createMockedFunction(Address.fromString(CRP_FACTORY),"isCrp","isCrp(address):(bool)").withArgs([ethereum.Value.fromAddress(event.params.caller)]).returns([ethereum.Value.fromBoolean(true)])
    createMockedFunction(Address.fromString(caller),"symbol","symbol():(string)").returns([ethereum.Value.fromString("ETHOOOOR")])
    createMockedFunction(Address.fromString(caller),"name","name():(string)").returns([ethereum.Value.fromString("AHHHH IM PRESTAKING")])
    createMockedFunction(Address.fromString(caller),"getController","getController():(address)").returns([ethereum.Value.fromAddress(Address.fromString("0xA2fAe707667212e330b78ecc5dB244BE1a33a0A1"))])

    let canPauseSwapping=ethereum.Value.fromBoolean(false)
    let canChangeSwapFee=ethereum.Value.fromBoolean(true)
    let canChangeWeights=ethereum.Value.fromBoolean(true)
    let canAddRemoveTokens=ethereum.Value.fromBoolean(true)
    let canWhitelistLPs=ethereum.Value.fromBoolean(true)
    let canChangeCap=ethereum.Value.fromBoolean(false)
    let returns:Array<ethereum.Value>=[canPauseSwapping,canChangeSwapFee,canChangeWeights,canAddRemoveTokens,canWhitelistLPs,canChangeCap]
    createMockedFunction(Address.fromString(caller),"rights","rights():(bool,bool,bool,bool,bool,bool)").returns(returns)
    createMockedFunction(Address.fromString(caller),"getCap","getCap():(uint256)").returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString("115792089237316195423570985008687907853269984665640564039457584007913129639935"))])

    handleNewPool(event)

    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")

    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"protocol",factory.toLowerCase())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"crp","true")
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"controller",caller.toLowerCase())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"createdTimestamp",timestamp.toString())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"rights","[canChangeSwapFee, canChangeWeights, canAddRemoveTokens, canWhitelistLPs]")
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"tx",txHash.toLowerCase())
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"symbol","ETHOOOOR")
    assert.fieldEquals("LiquidityPool",pool.toLowerCase(),"name","AHHHH IM PRESTAKING")
  })

  test("handleSetSwapFee",()=>{

    let address="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let sig="0x34e19907"
    let caller="0x64ba29ae508978a73106e50d18a623d70f29f373"
    let data= Bytes.fromHexString("0x34e19907000000000000000000000000000000000000000000000000002386f26fc10000")

    let event=createLOGCALLEvent(address,sig,caller,data)
    handleSetSwapFee(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")

    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"swapFee","10000000000000000")
  })
})
