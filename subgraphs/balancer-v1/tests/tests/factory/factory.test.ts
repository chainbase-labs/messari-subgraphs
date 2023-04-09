import {test,assert,clearStore,describe,logStore,createMockedFunction,afterAll} from "matchstick-as/assembly/index";
import {DexAmmProtocol, LiquidityPool} from "../../../generated/schema";
import {isCrp} from "../../../src/mappings/helpers";
import {Address, BigInt, Bytes, ethereum,log} from "@graphprotocol/graph-ts";
import {handleNewPool} from "../../../src/mappings/factoryMappings";
import {
  createExitEvent,
  createJoinEvent,
  createLOGCALLEvent,
  createNewPoolEvent, createSwapEvent,
  newBindFunction
} from "./util";
import {
  handleExitPool,
  handleFinalize, handleJoinPool, handleRebind,
  handleSetPublicSwap,
  handleSetSwapFee, handleSwap, handleUnbind
} from "../../../src/mappings/poolMappings";
describe("handleNewPool",()=>{

  afterAll(()=>{
    clearStore()
  })

  test("handleNewPoolWhenIsNotCrp",()=>{
    let factory="0x9424b1412450d0f8fc2255faf6046b98213b76bd"
    let caller="0x487879f338236b992a143f4570913a221261acd7"
    let pool="0x165a50bc092f6870dc111c349bae5fc35147ac86"
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

  test("handleSetController",()=>{
    let address="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let sig="0x92eefe9b"
    let caller="0x9424b1412450d0f8fc2255faf6046b98213b76bd"
    let data= Bytes.fromHexString("0x92eefe9b00000000000000000000000064ba29ae508978a73106e50d18a623d70f29f373")

    let event=createLOGCALLEvent(address,sig,caller,data)
    handleSetSwapFee(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")

    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"controller","0x64ba29ae508978a73106e50d18a623d70f29f373")
  })

  test("handleSetPublicSwap",()=>{
    let address="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let sig="0x49b59552"
    let caller="0x64ba29ae508978a73106e50d18a623d70f29f373"
    let data= Bytes.fromHexString("0x49b595520000000000000000000000000000000000000000000000000000000000000001")

    let event=createLOGCALLEvent(address,sig,caller,data)
    handleSetPublicSwap(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")

    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"publicSwap","true")
  })

  test("handleFinalize",()=>{
    let address="0x165a50Bc092f6870DC111C349baE5Fc35147ac86"
    let sig="0x4bb278f3"
    let caller="0x18fa2ac3c88112e36eff15370346f9aff3161fd1"
    let data= Bytes.fromHexString("0x4bb278f3")

    let event=createLOGCALLEvent(address,sig,caller,data)
    handleFinalize(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","finalizedPoolCount","1")


    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"publicSwap","true")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"finalized","true")
  })

  test("handleRebind",()=>{
    let address="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let sig="0xe4e1e538"
    let caller="0x64ba29ae508978a73106e50d18a623d70f29f373"
    let data= Bytes.fromHexString("0xe4e1e538000000000000000000000000e95a203b1a91a908f9b9ce46459d101078c2c3cb00000000000000000000000000000000000000000000000008b38d2d922b80000000000000000000000000000000000000000000000000008ac7230489e80000")

    let event=createLOGCALLEvent(address,sig,caller,data)

    let token="0xae78736cd615f374d3085123a210448e74fc6393".toLowerCase()
    createMockedFunction(Address.fromString(token),"symbol","symbol():(string)").returns([ethereum.Value.fromString("rETH")])
    createMockedFunction(Address.fromString(token),"name","name():(string)").returns([ethereum.Value.fromString("Rocket Pool ETH")])
    createMockedFunction(Address.fromString(token),"decimals","decimals():(address)").returns([ethereum.Value.fromI32(18)])

    let token2="0xe95a203b1a91a908f9b9ce46459d101078c2c3cb".toLowerCase()
    createMockedFunction(Address.fromString(token2),"symbol","symbol():(string)").returns([ethereum.Value.fromString("ankrETH")])
    createMockedFunction(Address.fromString(token2),"name","name():(string)").returns([ethereum.Value.fromString("Ankr Staked ETH")])
    createMockedFunction(Address.fromString(token2),"decimals","decimals():(uint8)").returns([ethereum.Value.fromI32(18)])

    handleRebind(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokens","["+token2+"]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenWeights","[10000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[627000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"totalWeight","10000000000000000000")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"active","true")

    assert.fieldEquals("Token",token2.toLowerCase(),"name","Ankr Staked ETH")
  })

  test("handleRebind2",()=>{
    let address="0x036dfa73953a81407204530a4bb1c1417d960c7f"
    let sig="0xe4e1e538"
    let caller="0x64ba29ae508978a73106e50d18a623d70f29f373"
    let data= Bytes.fromHexString("0xe4e1e538000000000000000000000000ae78736cd615f374d3085123a210448e74fc6393000000000000000000000000000000000000000000000000035834391ede80000000000000000000000000000000000000000000000000004563918244f40000")

    let event=createLOGCALLEvent(address,sig,caller,data)

    let token2="0xe95a203b1a91a908f9b9ce46459d101078c2c3cb".toLowerCase()
    let token="0xae78736cd615f374d3085123a210448e74fc6393".toLowerCase()
    createMockedFunction(Address.fromString(token),"symbol","symbol():(string)").returns([ethereum.Value.fromString("rETH")])
    createMockedFunction(Address.fromString(token),"name","name():(string)").returns([ethereum.Value.fromString("Rocket Pool ETH")])
    createMockedFunction(Address.fromString(token),"decimals","decimals():(uint8)").returns([ethereum.Value.fromI32(18)])

    handleRebind(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokens","["+token2+", "+token+"]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenWeights","[10000000000000000000, 5000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[627000000000000000, 241000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"totalWeight","15000000000000000000")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"active","true")

    assert.fieldEquals("Token",token.toLowerCase(),"name","Rocket Pool ETH")
  })

  test("handleUnbind",()=>{
    let address="0xc2a7a0fbccd22c13a6fea3deeeddf47f46e92d31"
    let caller="0x952e56ce38bb5d60791d7a9c59f160ff195a0c7c"
    let token0="0xf1f955016ecbcd7321c7266bccfb96c68ea5e49b"
    let token1="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

    newBindFunction(address,"0xe4e1e538",caller,"0xe4e1e538000000000000000000000000f1f955016ecbcd7321c7266bccfb96c68ea5e49b000000000000000000000000000000000000000000005077d75df1b67580000000000000000000000000000000000000000000000000000107ad8f556c6c0000",token0)
    newBindFunction(address,"0xe4e1e538",caller,"0xe4e1e538000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000002540be4000000000000000000000000000000000000000000000000000de0b6b3a7640000",token1)

    //unbind token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    let sig="0xcf5e7bd3"
    let data= Bytes.fromHexString("0xcf5e7bd3000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
    let event=createLOGCALLEvent(address,sig,caller,data)

    handleUnbind(event)
    assert.fieldEquals("DexAmmProtocol","0x9424b1412450d0f8fc2255faf6046b98213b76bd","totalPoolCount","2")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokens","["+token0+"]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenWeights","[19000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[380000000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"totalWeight","19000000000000000000")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"active","true")
  })

  test("handleLogJoin",()=>{
    let address="0x165a50bc092f6870dc111c349bae5fc35147ac86"
    let caller="0x18fa2ac3c88112e36eff15370346f9aff3161fd1"
    let sig="0xe4e1e538"
    newBindFunction(address,sig,caller,"0xe4e1e538000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000053444835ec580000","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")
    newBindFunction(address,sig,caller,"0xe4e1e5380000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000000000000000000000000000d02ab486cedc00000000000000000000000000000000000000000000000000003782dace9d900000","0x6b175474e89094c44da98b954eedeac495271d0f")

    caller="0x907753f96247ccdc0c7ccf246e3cd3e9f419be87"
    let event=createJoinEvent(address,caller,"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",BigInt.fromString("9156681683912724359"),"0xe8459c2ccc64c88608013267a972c534498a28faa3ce65fb634b169986e1c8ae",BigInt.fromString("19"),BigInt.fromString("9751185"),BigInt.fromString("15555"))
    handleJoinPool(event)

    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[9256681683912724359, 15000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"joinsCount","1")
  })

  test("handleLogExit",()=>{
    let address="0x165a50bc092f6870dc111c349bae5fc35147ac86"
    let event=createExitEvent(address,"0x557c57e399921477f794043b1ed7ef7e9183575d","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",BigInt.fromString("285371348779965707"),"0xe13f4b94695b4f77567d12336b46110f75e15fe6e87537727e368abd15e1070b",BigInt.fromString("19"),BigInt.fromString("9853015"),BigInt.fromString("15555555"))
    handleExitPool(event)

    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[8971310335132758652, 15000000000000000000]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"exitsCount","1")
  })

  test("handleLogSwap",()=>{
    let token0="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    let token1="0x6b175474e89094c44da98b954eedeac495271d0f"
    let address="0x165a50bc092f6870dc111c349bae5fc35147ac86"
    let txHash="0xf66b9f4ecc639179fe875f5e70582b91d33402229b692e0f41839a8e074d5fd6"
    let logIndex="72"
    let event=createSwapEvent(address,"0x6317c5e82a06e1d8bf200d21f4510ac2c038ac81","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",BigInt.fromString("24702524164206722"),"0x6b175474e89094c44da98b954eedeac495271d0f",BigInt.fromString("5937807513726456351"),txHash,BigInt.fromString(logIndex),BigInt.fromString("10509034"),BigInt.fromString("15555555"))
    handleSwap(event)
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokens","["+token0+", "+token1+"]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"inputTokenBalances","[8996012859296965374, 9062192486273543649]")
    assert.fieldEquals("LiquidityPool",address.toLowerCase(),"swapsCount","1")

    let swapId=txHash+"-"+logIndex
    assert.fieldEquals("Swap",swapId,"tokenIn","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")
    assert.fieldEquals("Swap",swapId,"amountIn","24702524164206722")
    assert.fieldEquals("Swap",swapId,"tokenOut","0x6b175474e89094c44da98b954eedeac495271d0f")
    assert.fieldEquals("Swap",swapId,"amountOut","5937807513726456351")
    assert.fieldEquals("Swap",swapId,"userAddress","0x19aebfcf95497ea1609268e54b670f38b85f27fc")
  })
})
