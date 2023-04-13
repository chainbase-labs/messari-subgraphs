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
  createBuySharesEvent,
  createDODOSwapEvent,
  createFunctionBase,
  createFunctionsBases,
  createNewDVM,
  createRemoveDVM,
  createSellSharesEvent,
  createUpdateLPFeeRateEvent,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  handleNewDVM,
  handleRemoveDVM,
} from "../../protocols/dodo-v2/src/mappings/poolFactory";
import { LiquidityPool } from "../../generated/schema";
import {
  handleBuyShares,
  handleDODOSwap,
  handleLpFeeRateChange,
  handleSellShares,
} from "../../protocols/dodo-v2/src/mappings/pool";

describe("dvm", () => {
  beforeAll(() => {
    createFunctionsBases();
  });

  afterAll(() => {
    clearStore();
  });

  test("handleNewDVM", () => {
    let address = "0x72d220ce168c4f361dd4dee5d826a01ad8598f6c";
    let dvm = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let baseToken = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    let quoteToken = "0xca275c8a1b0d39cf1d0c369e7e9146d66bdd9dda";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let creator = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let txIndex = "98";
    let event = createNewDVM(
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
      "Caubin",
      "Caubin",
      18,
      "2000000000000000000000000"
    );
    createFunctionBase(dvm, "DLP", "DLP_5162a3c5", 18, "0");

    let returnTuple: ethereum.Tuple = new ethereum.Tuple(7);
    returnTuple[0] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("1000000000000")
    );
    returnTuple[1] = ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString("1000000000000000000")
    );
    returnTuple[2] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[3] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[4] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[5] = ethereum.Value.fromUnsignedBigInt(BigInt.fromString("0"));
    returnTuple[6] = ethereum.Value.fromI32(1);

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
          "0x5e84190a270333aCe5B9202a3F4ceBf11b81bB01".toLowerCase()
        )
      ),
    ]);
    handleNewDVM(event);

    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "1");

    assert.fieldEquals("DexAmmProtocol", address, "name", "DVM Factory");

    assert.fieldEquals("DexAmmProtocol", address, "slug", "dvm");

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
    assert.stringEquals(pool._baseLpToken!, dvm);
    assert.stringEquals(pool._quoteLpToken!, dvm);
  });

  test("handleBuyshares", () => {
    let address = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let toParam = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let increaseShares = "1000000000000000";
    let total = "1000000000000000";
    let event = createBuySharesEvent(
      address,
      toParam,
      increaseShares,
      total,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );
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
    handleBuyShares(event);

    assert.entityCount("Deposit", 1);
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "inputTokens",
      "[" +
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() +
        ", " +
        "0xCA275c8a1B0D39CF1D0c369e7E9146D66bDD9ddA".toLowerCase() +
        "]"
    );
    assert.fieldEquals("Deposit", txHash + "-" + logIndex, "to", toParam);
    assert.fieldEquals("Deposit", txHash + "-" + logIndex, "_user", toParam);

    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "outputToken",
      address
    );
    assert.fieldEquals("Deposit", txHash + "-" + logIndex, "amountUSD", "0");
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "inputTokenAmounts",
      "[" + baseB + ", " + quoteQ + "]"
    );
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "outputTokenAmount",
      increaseShares
    );

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + baseB + ", " + quoteQ + "]"
    );

    assert.fieldEquals("Token", address, "_totalSupply", increaseShares);
  });

  test("handleSellshares", () => {
    let address = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let payer = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let toParam = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let decreaseShares = "100000000000000";
    let total = "0";
    let event = createSellSharesEvent(
      address,
      payer,
      toParam,
      decreaseShares,
      total,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );
    let baseB = "0";
    let quoteQ = "0";
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
    handleSellShares(event);

    assert.entityCount("Withdraw", 1);
    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "inputTokens",
      "[" +
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() +
        ", " +
        "0xCA275c8a1B0D39CF1D0c369e7E9146D66bDD9ddA".toLowerCase() +
        "]"
    );
    assert.fieldEquals("Withdraw", txHash + "-" + logIndex, "to", toParam);
    assert.fieldEquals("Withdraw", txHash + "-" + logIndex, "_user", payer);

    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "outputToken",
      address
    );
    assert.fieldEquals("Withdraw", txHash + "-" + logIndex, "amountUSD", "0");
    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "inputTokenAmounts",
      "[" + "10000000" + ", " + "10000000" + "]"
    );
    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "outputTokenAmount",
      decreaseShares
    );

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + baseB + ", " + quoteQ + "]"
    );
  });

  test("handleDodoSwap", () => {
    let address = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let fromToken = "0xca275c8a1b0d39cf1d0c369e7e9146d66bdd9dda";
    let toToken = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "6";
    let txIndex = "98";
    let fromAmount = "245529594715471841985560576";
    let toAmount = "385837105639134032";
    let receiver = "0xac6a9e9ca65d4bcbea3e59c4c40128052bcc8882";
    let trader = "0xac6a9e9ca65d4bcbea3e59c4c40128052bcc8882";
    let event = createDODOSwapEvent(
      address,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      trader,
      receiver,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromI32(15555)
    );
    let baseB = "0";
    let quoteQ = "0";
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

    handleDODOSwap(event);

    assert.entityCount("Swap", 1);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenIn",
      fromToken
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenOut",
      toToken
    );
    assert.fieldEquals("Swap", "swap-" + txHash + "-" + logIndex, "to", trader);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountIn",
      fromAmount
    );

    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountOut",
      toAmount
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "pool",
      address
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeBase",
      "926009053533921.6768"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeQuote",
      "0"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_baseVolume",
      toAmount
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_quoteVolume",
      fromAmount
    );

    assert.fieldEquals("LiquidityPool", address, "_volumeBaseToken", toAmount);
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "_volumeQuoteToken",
      fromAmount
    );
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "_feeBase",
      "926009053533921.6768"
    );
    assert.fieldEquals("LiquidityPool", address, "_feeQuote", "0");
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + baseB + ", " + quoteQ + "]"
    );
  });

  test("handleUpdateLiquidityProviderFee", () => {
    let address = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let newfee = "3000000000000000";

    let event = createUpdateLPFeeRateEvent(address, newfee);
    createMockedFunction(
      Address.fromString(address),
      "getPMMState",
      "getPMMState():((uint256,uint256,uint256,uint256,uint256,uint256,uint8))"
    ).reverts();
    handleLpFeeRateChange(event);

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "_lpFeeRate",
      "2400000000000000"
    );
  });

  test("handleRemoveDVM", () => {
    let address = "0x72d220ce168c4f361dd4dee5d826a01ad8598f6c";
    let dvm = "0x5162a3c59f350f5939e64af6baad66cdef18dc4a";
    let blockNumber = "12040666";
    let txHash =
      "0x39fb11b5cd3015ac931b64416dce98d82a978c6378dfb15f4c9894fb6402477e";
    let from = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let to = "0xaac153c1344cA14497A5dd22b1F70C28793625aa";
    let txIndex = "106";
    let logIndex = "55";

    let event = createRemoveDVM(
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

    handleRemoveDVM(event);
    assert.entityCount("DexAmmProtocol", 1);
    assert.fieldEquals("DexAmmProtocol", address, "totalPoolCount", "0");

    assert.entityCount("LiquidityPool", 0);
  });
});
