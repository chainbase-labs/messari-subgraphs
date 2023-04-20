import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as";
import {
  createFunctionBase,
  createFunctionsBases,
  createNewDSP,
  createRemoveDSP,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  handleNewDSP,
  handleRemoveDSP,
} from "../../protocols/dodo-v2/src/mappings/poolFactory";
import { LiquidityPool } from "../../generated/schema";

describe("dsp", () => {
  beforeAll(() => {
    createFunctionsBases();
  });

  afterAll(() => {
    clearStore();
  });

  test("handleNewDSP", () => {
    let address = "0x6fddb76c93299d985f4d3fc7ac468f9a168577a4";
    let dvm = "0x1084b486d61b551e0c1be55f025ec41bda06418e";
    let txHash =
      "0xd8c5e39cefb88f42eb1f25b3a1591f890a7de28da235146460cfa4d42dba3e2e";
    let baseToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    let quoteToken = "0x8859037d10c3d9fc60a7c7cb1e2fd09c1cffccb8";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let creator = "0x34250635c1f532db65c6202b9cc71860ee67ac15";
    let txIndex = "98";
    let event = createNewDSP(
      address,
      dvm,
      baseToken,
      quoteToken,
      creator,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );
    createFunctionBase(
      quoteToken,
      "USDT",
      "Tether USD",
      18,
      "1909283000000000000000000"
    );
    createFunctionBase(dvm, "DLP", "DLP_1084b486", 18, "1");

    let returnTuple: ethereum.Tuple = new ethereum.Tuple(7);
    returnTuple[0] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("50186989139000000000000000000000000")
    );
    returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("100000000000000000")
    );
    returnTuple[2] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1"));
    returnTuple[3] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("50186989139189661")
    );
    returnTuple[4] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1"));
    returnTuple[5] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("50186989139000000")
    );
    returnTuple[6] = ethereum.Value.fromI32(0);

    createMockedFunction(
      Address.fromString(dvm),
      "getPMMState",
      "getPMMState():((uint256,uint256,uint256,uint256,uint256,uint256,uint8))"
    ).returns([ethereum.Value.fromTuple(returnTuple)]);

    createMockedFunction(
      Address.fromString(dvm),
      "_MT_FEE_RATE_MODEL_",
      "_MT_FEE_RATE_MODEL_():(address)"
    ).returns([
      ethereum.Value.fromAddress(
        Address.fromString(
          "0x5e84190a270333aCe5B9202a3F4ceBf11b81bB01".toLowerCase()
        )
      ),
    ]);

    createMockedFunction(
      Address.fromString(dvm),
      "_LP_FEE_RATE_",
      "_LP_FEE_RATE_():(uint256)"
    ).returns([
      ethereum.Value.fromSignedBigInt(BigInt.fromString("2400000000000000")),
    ]);

    createMockedFunction(
      Address.fromString(dvm),
      "_MAINTAINER_",
      "_MAINTAINER_():(address)"
    ).returns([
      ethereum.Value.fromAddress(
        Address.fromString(
          "0x95C4F5b83aA70810D4f142d58e5F7242Bd891CB0".toLowerCase()
        )
      ),
    ]);
    handleNewDSP(event);

    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "1");

    assert.fieldEquals("DexAmmProtocol", address, "name", "DSP Factory");

    assert.fieldEquals("DexAmmProtocol", address, "slug", "dsp");

    assert.fieldEquals(
      "LiquidityPool",
      dvm,
      "inputTokenWeights",
      "[1000000000000000000, 1000000000000000000]"
    );

    assert.fieldEquals(
      "LiquidityPool",
      dvm,
      "inputTokenBalances",
      "[1, 50186989139189661]"
    );

    assert.fieldEquals("LiquidityPool", dvm, "_creator", creator);

    assert.fieldEquals("LiquidityPool", dvm, "protocol", address.toLowerCase());

    assert.entityCount("DexAmmProtocol", 1);
    assert.entityCount("LiquidityPool", 1);

    let pool = LiquidityPool.load(dvm) as LiquidityPool;
    assert.stringEquals(pool.inputTokens[0], baseToken);
    assert.stringEquals(pool.inputTokens[1], quoteToken);
    assert.stringEquals(pool._baseLpToken!, dvm);
    assert.stringEquals(pool._quoteLpToken!, dvm);
  });

  test("handleRemoveDSP", () => {
    let address = "0x6fddb76c93299d985f4d3fc7ac468f9a168577a4";
    let dvm = "0x1084b486d61b551e0c1be55f025ec41bda06418e";
    let blockNumber = "12040666";
    let txHash =
      "0x39fb11b5cd3015ac931b64416dce98d82a978c6378dfb15f4c9894fb6402477e";
    let from = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let to = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let txIndex = "106";
    let logIndex = "55";

    let event = createRemoveDSP(
      address,
      dvm,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNumber),
      BigInt.fromString("15555")
    );
    handleRemoveDSP(event);
    assert.entityCount("DexAmmProtocol", 1);
    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "0");

    assert.entityCount("LiquidityPool", 0);
  });
});
