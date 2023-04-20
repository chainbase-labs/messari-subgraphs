import { assert, createMockedFunction, describe, test } from "matchstick-as";
import {
  createConversion,
  createConverterAnchorAdded,
  createConverterBaseReturnFunctions,
  createTokenBaseFunctions,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleConverterAnchorAdded } from "../../src/mappings/converterRegistry";
import { handleConversion } from "../../src/mappings/converter";

describe("converter", () => {
  // test("handleCrowdsale",
  //     () => {
  //       let event = changetype<OwnerUpdate>(newMockEvent())
  //       for (let i = 0; i < converterBackfill.length; i++) {
  //         createConverterBaseRevertsFunctions(Address.fromString(converterBackfill[i]))
  //       }
  //
  //       for (let i = 0; i < smartTokenBackfill.length; i++) {
  //         createTokenBaseFunctions(Address.fromString(smartTokenBackfill[i]), "token-" + i.toString(), "name-" + i.toString(), 18)
  //       }
  //       createBackfill(event)
  //       assert.entityCount("DexAmmProtocol", 1)
  //       assert.entityCount("LiquidityPool", 418)
  //       assert.entityCount("Token", 211)
  //       assert.fieldEquals("LiquidityPool", "0x6b2c2db78fc5f1f0a7a7a6d91d26922850a9c693", "inputTokens", "[]")
  //     })

  test("handleConverterRegistry", () => {
    let address = "0x0ddff327ddf7fe838e3e63d02001ef23ad1ede8e";
    let converter = "0x6b2c2db78fc5f1f0a7a7a6d91d26922850a9c693";
    let txHash =
      "0x02ca8397bc6e0525797ce876c3ada8e234ab4b79361847dba9fb4f1f7fa727dd";
    let smartToken = "0xb93cc8642f5e8644423aa7305da96fff75708228";
    let blockNum = "7848031";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let event = createConverterAnchorAdded(
      address,
      smartToken,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );
    let qbpLength = "0";
    let type = "1";
    let tcCount = "2";
    let version = 18;
    let owner = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
    let manager = "0x9254F1f3441ebDf8e5667b2C766EA88C7D34f3BD";
    let maxConversion = "30000";
    let registry = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
    createMockedFunction(
      Address.fromString(smartToken),
      "owner",
      "owner():(address)"
    ).returns([ethereum.Value.fromAddress(Address.fromString(converter))]);
    createMockedFunction(
      Address.fromString(converter),
      "token",
      "token():(address)"
    ).returns([ethereum.Value.fromAddress(Address.fromString(smartToken))]);

    createConverterBaseReturnFunctions(
      Address.fromString(converter),
      qbpLength,
      tcCount,
      version,
      owner,
      manager,
      maxConversion,
      type,
      registry
    );

    let token0 = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
    let token1 = "0x4a57E687b9126435a9B19E4A802113e266AdeBde";

    createMockedFunction(
      Address.fromString(converter),
      "connectorTokens",
      "connectorTokens(uint256):(address)"
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
      .returns([ethereum.Value.fromAddress(Address.fromString(token0))]);
    createMockedFunction(
      Address.fromString(converter),
      "connectorTokens",
      "connectorTokens(uint256):(address)"
    )
      .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
      .returns([ethereum.Value.fromAddress(Address.fromString(token1))]);

    let returnTuple: ethereum.Tuple = new ethereum.Tuple(5);
    returnTuple[0] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("500000")
    );
    returnTuple[2] = ethereum.Value.fromBoolean(false);
    returnTuple[3] = ethereum.Value.fromBoolean(true);
    returnTuple[4] = ethereum.Value.fromBoolean(true);

    createTokenBaseFunctions(
      Address.fromString(token0),
      "token0",
      "token0",
      18
    );
    createTokenBaseFunctions(
      Address.fromString(token1),
      "token1",
      "token1",
      18
    );

    createMockedFunction(
      Address.fromString(converter),
      "connectors",
      "connectors(address):(uint256,uint32,bool,bool,bool,bool)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token0))])
      .reverts();
    createMockedFunction(
      Address.fromString(converter),
      "connectors",
      "connectors(address):(uint256,uint32,bool,bool,bool)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token0))])
      .returns(returnTuple);

    createMockedFunction(
      Address.fromString(converter),
      "connectors",
      "connectors(address):(uint256,uint32,bool,bool,bool,bool)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token1))])
      .reverts();
    createMockedFunction(
      Address.fromString(converter),
      "connectors",
      "connectors(address):(uint256,uint32,bool,bool,bool)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token1))])
      .returns(returnTuple);

    createTokenBaseFunctions(
      Address.fromString(smartToken),
      "FXCBNT",
      "FXC Smart Token Relay",
      18
    );
    handleConverterAnchorAdded(event);

    // logStore()
    assert.entityCount("DexAmmProtocol", 1);
    assert.entityCount("LiquidityPool", 1);
    assert.entityCount("Token", 3);
    assert.fieldEquals(
      "LiquidityPool",
      converter.toLowerCase(),
      "name",
      "Bancor V2-LiquidityPoolV1Converter-FXC Smart Token Relay"
    );
    assert.fieldEquals(
      "LiquidityPool",
      converter.toLowerCase(),
      "inputTokens",
      "[" + token0.toLowerCase() + ", " + token1.toLowerCase() + "]"
    );
  });

  // test("handleConverterRemove", () => {
  //   let address = "0x0ddff327ddf7fe838e3e63d02001ef23ad1ede8e";
  //   let converter = "0x6b2c2db78fc5f1f0a7a7a6d91d26922850a9c693";
  //   let txHash =
  //       "0x02ca8397bc6e0525797ce876c3ada8e234ab4b79361847dba9fb4f1f7fa727dd";
  //   let smartToken = "0xb93cc8642f5e8644423aa7305da96fff75708228";
  //   let blockNum = "7848031";
  //   let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
  //   let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
  //   let logIndex = "184";
  //   let txIndex = "98";
  //   let event = createConverterRemove(
  //       address,
  //       smartToken,
  //       converter,
  //       from,
  //       to,
  //       txHash,
  //       BigInt.fromString(txIndex),
  //       BigInt.fromString(logIndex),
  //       BigInt.fromString(blockNum),
  //       BigInt.fromI32(15555)
  //   );
  //   let qbpLength = "0";
  //   let type = "bancor";
  //   let tcCount = "2";
  //   let version = "";
  //   let owner = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //   let manager = "0x9254F1f3441ebDf8e5667b2C766EA88C7D34f3BD";
  //   let maxConversion = "30000";
  //   let registry = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //
  //   let token0 = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
  //   let token1 = "0x4a57E687b9126435a9B19E4A802113e266AdeBde";
  //   handleConverterRemoval(event);
  //
  //   // logStore()
  //   assert.entityCount("DexAmmProtocol", 1);
  //   assert.entityCount("LiquidityPool", 0);
  //   assert.entityCount("Token", 3);
  // });

  // test("handleSmartTokenAdd", () => {
  //   let address = "0x85e27A5718382F32238497e78b4A40DD778ab847";
  //   let txHash =
  //       "0x02ca8397bc6e0525797ce876c3ada8e234ab4b79361847dba9fb4f1f7fa727dd";
  //   let smartToken = "0x334C36Be5b1EaF0C4b61dDEa202c9f6Dc2640FE5";
  //   let blockNum = "7848031";
  //   let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
  //   let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
  //   let logIndex = "184";
  //   let txIndex = "98";
  //   let event = createSmartTokenAdd(
  //       address,
  //       smartToken,
  //       from,
  //       to,
  //       txHash,
  //       BigInt.fromString(txIndex),
  //       BigInt.fromString(logIndex),
  //       BigInt.fromString(blockNum),
  //       BigInt.fromI32(15555)
  //   );
  //
  //   const converter = "0x1e45Ff6C529DD038E75767779D12b7981311B8Df";
  //   createSmartTokenBaseFunction(
  //       Address.fromString(smartToken),
  //       "ELETBNT",
  //       "ELET Smart Token Relay",
  //       18,
  //       "0.3",
  //       converter,
  //       "Token 0.1",
  //       true
  //   );
  //
  //   let qbpLength = "0";
  //   let type = "bancor";
  //   let tcCount = "2";
  //   let version = "";
  //   let owner = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //   let manager = "0x9254F1f3441ebDf8e5667b2C766EA88C7D34f3BD";
  //   let maxConversion = "30000";
  //   let registry = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //   createConverterBaseReturnFunctions(
  //       Address.fromString(converter),
  //       qbpLength,
  //       tcCount,
  //       version,
  //       owner,
  //       manager,
  //       maxConversion,
  //       type,
  //       registry
  //   );
  //
  //   let token0 = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
  //   let token1 = "0x6c37Bf4f042712C978A73e3fd56D1F5738dD7C43";
  //
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectorTokens",
  //       "connectorTokens(uint256):(address)"
  //   )
  //   .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))])
  //   .returns([ethereum.Value.fromAddress(Address.fromString(token0))]);
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectorTokens",
  //       "connectorTokens(uint256):(address)"
  //   )
  //   .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
  //   .returns([ethereum.Value.fromAddress(Address.fromString(token1))]);
  //
  //   let returnTuple: ethereum.Tuple = new ethereum.Tuple(5);
  //   returnTuple[0] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
  //   returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
  //       BigInt.fromString("500000")
  //   );
  //   returnTuple[2] = ethereum.Value.fromBoolean(false);
  //   returnTuple[3] = ethereum.Value.fromBoolean(true);
  //   returnTuple[4] = ethereum.Value.fromBoolean(true);
  //
  //   createTokenBaseFunctions(
  //       Address.fromString(token0),
  //       "token0",
  //       "token0",
  //       18
  //   );
  //   createTokenBaseFunctions(
  //       Address.fromString(token1),
  //       "token1",
  //       "token1",
  //       18
  //   );
  //
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token0))])
  //   .reverts();
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token0))])
  //   .returns(returnTuple);
  //
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token1))])
  //   .reverts();
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token1))])
  //   .returns(returnTuple);
  //
  //   handleSmartTokenAdded(event);
  //   assert.entityCount("DexAmmProtocol", 2);
  //   assert.entityCount("LiquidityPool", 1);
  //   assert.entityCount("Token", 5);
  //   assert.fieldEquals(
  //       "LiquidityPool",
  //       converter.toLowerCase(),
  //       "_owner",
  //       owner.toLowerCase()
  //   );
  //   assert.fieldEquals(
  //       "LiquidityPool",
  //       converter.toLowerCase(),
  //       "inputTokens",
  //       "[" + token0.toLowerCase() + ", " + token1.toLowerCase() + "]"
  //   );
  // });

  // test("handleConvertibleTokenAdd", () => {
  //   let address = "0x85e27A5718382F32238497e78b4A40DD778ab847";
  //   let txHash =
  //       "0xc8ea383b7256e9b05b41340a36384875dc85eac663c178850d2818224fe8dba6";
  //   let token = "0x6c37Bf4f042712C978A73e3fd56D1F5738dD7C43";
  //   let smartToken = "0x334C36Be5b1EaF0C4b61dDEa202c9f6Dc2640FE5";
  //   let blockNum = "9099563";
  //   let from = "0xc8021b971e69e60C5Deede19528B33dCD52cDbd8";
  //   let to = "0x85e27a5718382f32238497e78b4a40dd778ab847";
  //   let logIndex = "120";
  //   let txIndex = "98";
  //   let event = createConvertibleTokenAdd(
  //       address,
  //       token,
  //       smartToken,
  //       from,
  //       to,
  //       txHash,
  //       BigInt.fromString(txIndex),
  //       BigInt.fromString(logIndex),
  //       BigInt.fromString(blockNum),
  //       BigInt.fromI32(15555)
  //   );
  //
  //   const converter = "0x1e45Ff6C529DD038E75767779D12b7981311B8Df";
  //   createSmartTokenBaseFunction(
  //       Address.fromString(smartToken),
  //       "ELETBNT",
  //       "ELET Smart Token Relay",
  //       18,
  //       "0.3",
  //       converter,
  //       "Token 0.1",
  //       true
  //   );
  //
  //   let qbpLength = "0";
  //   let type = "bancor";
  //   let tcCount = "2";
  //   let version = "";
  //   let owner = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //   let manager = "0x9254F1f3441ebDf8e5667b2C766EA88C7D34f3BD";
  //   let maxConversion = "30000";
  //   let registry = "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
  //   createConverterBaseReturnFunctions(
  //       Address.fromString(converter),
  //       qbpLength,
  //       tcCount,
  //       version,
  //       owner,
  //       manager,
  //       maxConversion,
  //       type,
  //       registry
  //   );
  //
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectorTokens",
  //       "connectorTokens(uint256):(address)"
  //   )
  //   .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
  //   .returns([ethereum.Value.fromAddress(Address.fromString(token))]);
  //
  //   let returnTuple: ethereum.Tuple = new ethereum.Tuple(5);
  //   returnTuple[0] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
  //   returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
  //       BigInt.fromString("500000")
  //   );
  //   returnTuple[2] = ethereum.Value.fromBoolean(false);
  //   returnTuple[3] = ethereum.Value.fromBoolean(true);
  //   returnTuple[4] = ethereum.Value.fromBoolean(true);
  //
  //   createTokenBaseFunctions(Address.fromString(token), "token1", "token1", 18);
  //
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token))])
  //   .reverts();
  //   createMockedFunction(
  //       Address.fromString(converter),
  //       "connectors",
  //       "connectors(address):(uint256,uint32,bool,bool,bool)"
  //   )
  //   .withArgs([ethereum.Value.fromAddress(Address.fromString(token))])
  //   .returns(returnTuple);
  //
  //   handleConvertibleTokenAdded(event);
  // });

  // test("handleConverterUpgrade", () => {
  //   let address = "0x20412bD6d146309c55cC607d30c5aAd07fbF6148";
  //   let txHash =
  //       "0xc8ea383b7256e9b05b41340a36384875dc85eac663c178850d2818224fe8dba6";
  //   const old = "0x1e45Ff6C529DD038E75767779D12b7981311B8Df";
  //
  //   let newConverter = "0x66C5603fb424fd9f2e3A0fD51Ff63eEEc9857Bc3";
  //   let blockNum = "9099563";
  //   let from = "0xc8021b971e69e60C5Deede19528B33dCD52cDbd8";
  //   let to = "0x85e27a5718382f32238497e78b4a40dd778ab847";
  //   let logIndex = "120";
  //   let txIndex = "98";
  //   let event = createConverterUpgrader(
  //       address,
  //       old,
  //       newConverter,
  //       from,
  //       to,
  //       txHash,
  //       BigInt.fromString(txIndex),
  //       BigInt.fromString(logIndex),
  //       BigInt.fromString(blockNum),
  //       BigInt.fromI32(15555)
  //   );
  //
  //   createConverterBaseRevertsFunctions(Address.fromString(newConverter));
  //   let token0 = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
  //   let token1 = "0x6c37Bf4f042712C978A73e3fd56D1F5738dD7C43";
  //
  //   let token0Balance = "1000000000000";
  //   let token1Balance = "20000000000000";
  //   createMockedFunction(
  //       Address.fromString(token0.toLowerCase()),
  //       "balanceOf",
  //       "balanceOf(address):(uint256)"
  //   )
  //   .withArgs([
  //     ethereum.Value.fromAddress(Address.fromString(old.toLowerCase())),
  //   ])
  //   .returns([
  //     ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token0Balance)),
  //   ]);
  //
  //   createMockedFunction(
  //       Address.fromString(token1.toLowerCase()),
  //       "balanceOf",
  //       "balanceOf(address):(uint256)"
  //   )
  //   .withArgs([
  //     ethereum.Value.fromAddress(Address.fromString(old.toLowerCase())),
  //   ])
  //   .returns([
  //     ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token1Balance)),
  //   ]);
  //
  //   createMockedFunction(
  //       Address.fromString(token0.toLowerCase()),
  //       "balanceOf",
  //       "balanceOf(address):(uint256)"
  //   )
  //   .withArgs([
  //     ethereum.Value.fromAddress(
  //         Address.fromString(newConverter.toLowerCase())
  //     ),
  //   ])
  //   .returns([
  //     ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token0Balance)),
  //   ]);
  //
  //   createMockedFunction(
  //       Address.fromString(token1.toLowerCase()),
  //       "balanceOf",
  //       "balanceOf(address):(uint256)"
  //   )
  //   .withArgs([
  //     ethereum.Value.fromAddress(
  //         Address.fromString(newConverter.toLowerCase())
  //     ),
  //   ])
  //   .returns([
  //     ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token1Balance)),
  //   ]);
  //
  //   handleConverterUpgrade(event);
  //
  //   assert.fieldEquals(
  //       "LiquidityPool",
  //       old.toLowerCase(),
  //       "inputTokenBalances",
  //       "[" + token0Balance + ", " + token1Balance + "]"
  //   );
  //   assert.fieldEquals(
  //       "LiquidityPool",
  //       newConverter.toLowerCase(),
  //       "inputTokenBalances",
  //       "[" + token0Balance + ", " + token1Balance + "]"
  //   );
  // });

  test("handleConversion", () => {
    let address = "0x6b2c2db78fc5f1f0a7a7a6d91d26922850a9c693";
    let txHash =
      "0x02ca8397bc6e0525797ce876c3ada8e234ab4b79361847dba9fb4f1f7fa727dd";
    let smartToken = "0xb93cc8642f5e8644423aa7305da96fff75708228";
    let blockNum = "7848031";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let fromToken = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
    let toToken = "0x4a57E687b9126435a9B19E4A802113e266AdeBde";
    let fromAmount = "11132784092034751171990";
    let toAmount = "90618046990005270755";
    let trader = "0x0eae044f00B0aF300500F090eA00027097d03000";
    let fee = "1849347897755209607";
    let event = createConversion(
      address,
      fromToken,
      toToken,
      trader,
      fromAmount,
      toAmount,
      fee,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );

    let token0Balance = "200000000000000000";
    let token1Balance = "10000000000000000000";
    createMockedFunction(
      Address.fromString(fromToken.toLowerCase()),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString(address.toLowerCase())),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token0Balance)),
      ]);

    createMockedFunction(
      Address.fromString(toToken.toLowerCase()),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([
        ethereum.Value.fromAddress(Address.fromString(address.toLowerCase())),
      ])
      .returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token1Balance)),
      ]);

    handleConversion(event);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_slippage",
      "1.889630723613773932198466285142669"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_price",
      "122.8539398257241522456297848457518"
    );

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + token0Balance + ", " + token1Balance + "]"
    );
  });
});

// test("handleContractRegistry", () => {
//   const name = Bytes.fromHexString("0x424e54546f6b656e000000000000000000000000000000000000000000000000")
//
//   const event = createContractRegistry("0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4", "0x9afb9d7ed0f6c054ec76ea61d5cabc384d4dcb25", name);
//   createMockedFunction(Address.fromString("0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4".toLowerCase()), "owner", "owner():(address)").returns([ethereum.Value.fromAddress(Address.zero())])
//
//   handleAddressUpdate(event)
//
//   const event2 = createContractRegistry("0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4", "0x9afb9d7ed0f6c054ec76ea61d5cabc384d4dcb20", name);
//   createMockedFunction(Address.fromString("0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4".toLowerCase()), "owner", "owner():(address)").returns([ethereum.Value.fromAddress(Address.zero())])
//
//   handleAddressUpdate(event2)
//
//   assert.fieldEquals("_ContractRegistry", "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4".toLowerCase(), "contractAddresses", "[0x9afb9d7ed0f6c054ec76ea61d5cabc384d4dcb20]")
//   assert.fieldEquals("_ContractRegistry", "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4".toLowerCase(), "contractNames", "[BNTToken]")
// });
