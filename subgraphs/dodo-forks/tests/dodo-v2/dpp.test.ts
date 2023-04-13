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
  createNewDPP,
  createRemoveDPP,
  createUpdateLPFeeRateEvent,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  handleNewDPP,
  handleRemoveDPP,
} from "../../protocols/dodo-v2/src/mappings/poolFactory";
import { LiquidityPool } from "../../generated/schema";
import { handleLpFeeRateChange } from "../../protocols/dodo-v2/src/mappings/pool";

describe("dpp", () => {
  beforeAll(() => {
    createFunctionsBases();
  });

  afterAll(() => {
    clearStore();
  });

  test("handleNewDPP", () => {
    let address = "0xb5dc5e183c2acf02ab879a8569ab4edaf147d537";
    let dvm = "0x8b2d4d508141350085ebc39718d8e04b9b9f6920";
    let txHash =
      "0xa6aee3febee48b69e64c1363bb8e05f9ae71f91dcd8d5adb1ec2e9240da34929";
    let baseToken = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";
    let quoteToken = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    let blockNum = "11717411";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "277";
    let creator = "0x9c59990ec0177d87ed7d60a56f584e6b06c639a2";
    let txIndex = "98";
    let event = createNewDPP(
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
    createFunctionBase(dvm, "", "", 18, "0");

    createMockedFunction(
      Address.fromString(dvm),
      "getPMMState",
      "getPMMState():((uint256,uint256,uint256,uint256,uint256,uint256,uint8))"
    ).reverts();

    handleNewDPP(event);

    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "1");

    assert.fieldEquals("DexAmmProtocol", address, "name", "DPP Factory");

    assert.fieldEquals("DexAmmProtocol", address, "slug", "dpp");

    assert.fieldEquals(
      "LiquidityPool",
      dvm,
      "inputTokenWeights",
      "[1000000000000000000, 1000000000000000000]"
    );

    assert.fieldEquals("LiquidityPool", dvm, "inputTokenBalances", "[0, 0]");

    assert.fieldEquals("LiquidityPool", dvm, "_creator", creator);

    assert.fieldEquals("LiquidityPool", dvm, "protocol", address.toLowerCase());

    assert.entityCount("DexAmmProtocol", 1);
    assert.entityCount("LiquidityPool", 1);

    let pool = LiquidityPool.load(dvm) as LiquidityPool;
    assert.stringEquals(pool.inputTokens[0], baseToken);
    assert.stringEquals(pool.inputTokens[1], quoteToken);
    assert.assertNull(pool._baseLpToken);
    assert.assertNull(pool._quoteLpToken);
  });

  test("handleUpdateLiquidityProviderFee", () => {
    let address = "0x8b2d4d508141350085ebc39718d8e04b9b9f6920";
    let newfee = "3000000000000000";
    let baseB = "10000000";
    let quoteQ = "10000000";
    let returnTuple: ethereum.Tuple = new ethereum.Tuple(7);
    returnTuple[0] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("1000000000000")
    );
    returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("1000000000000000000")
    );
    returnTuple[2] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(baseB)
    );
    returnTuple[3] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(quoteQ)
    );
    returnTuple[4] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[5] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[6] = ethereum.Value.fromI32(1);

    createMockedFunction(
      Address.fromString(address),
      "getPMMState",
      "getPMMState():((uint256,uint256,uint256,uint256,uint256,uint256,uint8))"
    ).returns([ethereum.Value.fromTuple(returnTuple)]);

    createMockedFunction(
      Address.fromString(address),
      "_LP_FEE_RATE_",
      "_LP_FEE_RATE_():(uint64)"
    ).returns([ethereum.Value.fromSignedBigInt(BigInt.fromString(newfee))]);

    let event = createUpdateLPFeeRateEvent(address, newfee);
    handleLpFeeRateChange(event);

    assert.fieldEquals("LiquidityPool", address, "_lpFeeRate", newfee);
  });

  test("handleRemoveDPP", () => {
    let address = "0xb5dc5e183c2acf02ab879a8569ab4edaf147d537";
    let dvm = "0x8b2d4d508141350085ebc39718d8e04b9b9f6920";
    let blockNumber = "12040666";
    let txHash =
      "0x39fb11b5cd3015ac931b64416dce98d82a978c6378dfb15f4c9894fb6402477e";
    let from = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let to = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let txIndex = "106";
    let logIndex = "55";

    let event = createRemoveDPP(
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
    handleRemoveDPP(event);
    assert.entityCount("DexAmmProtocol", 1);
    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "0");

    assert.entityCount("LiquidityPool", 0);
  });
});
