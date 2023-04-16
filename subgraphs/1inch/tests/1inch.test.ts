import {
  assert,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createDeployed,
  createDeployedV11,
  createFunctionBase,
  createTransfer,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  handleNewPool,
  handleNewPoolV11,
  handleTransfer,
} from "../src/mapping";
import { LiquidityPool } from "../generated/schema";

describe("1inch-V10", () => {
  test("handleNewPool", () => {
    let address = "0xC4A8B7e29E3C8ec560cd4945c1cF3461a85a148d";
    let pool = "0x126645968B1C659a3408Fec5c8099ea37f06e566";
    let token0 = "0x4E15361FD6b4BB609Fa63C81A2be19d873717870";
    let token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let event = createDeployed(
      address,
      pool,
      token0,
      token1,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromString("155555555")
    );
    createFunctionBase(token0, "FTM", "Fantom Token", 18);
    createFunctionBase(token1, "USD Coin", "USDC", 6);
    handleNewPool(event);
    assert.entityCount("DexAmmProtocol", 1);
    assert.entityCount("LiquidityPool", 1);
    assert.entityCount("Token", 2);
  });

  test("handleTransfer", () => {
    let address = "0x126645968B1C659a3408Fec5c8099ea37f06e566";
    let from = "0x87f16c31e32Ae543278F5194cf94862F1Cb1EEe0";
    let to = "0x0000000000000000000000000000000000000000";
    let value = "1017969969809150554806";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let blockNum = "17032611";
    let txFrom = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let txTo = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let event = createTransfer(
      address,
      from,
      to,
      value,
      txFrom,
      txTo,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromString("155555555")
    );

    let token0 = "0x4E15361FD6b4BB609Fa63C81A2be19d873717870";
    let token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    let ba0 = "1000000";
    let ba1 = "20000000";
    createMockedFunction(
      Address.fromString(token0),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(ba0))]);

    createMockedFunction(
      Address.fromString(token1),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(ba1))]);

    createMockedFunction(
      Address.fromString(address),
      "fee",
      "fee():(uint256)"
    ).reverts();

    createMockedFunction(
      Address.fromString(address),
      "slippageFee",
      "slippageFee():(uint256)"
    ).reverts();

    handleTransfer(event);
    assert.fieldEquals(
      "LiquidityPool",
      address.toLowerCase(),
      "inputTokenBalances",
      "[" + ba0 + ", 20000000000000000000" + "]"
    );
    const pool = LiquidityPool.load(address.toLowerCase()) as LiquidityPool;
  });
});

describe("1inch-V11", () => {
  test("handleNewPool", () => {
    let address = "0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643";
    let pool = "0x126645968B1C659a3408Fec5c8099ea37f06e579";
    let token0 = Address.zero().toHexString();
    let token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let blockNum = "17032611";
    let from = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let to = "0xa356867fdcea8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let event = createDeployedV11(
      address,
      pool,
      token0,
      token1,
      from,
      to,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromString("155555555")
    );
    createFunctionBase(token0, "unknow", "unkonw", 18);
    createFunctionBase(token1, "USD Coin", "USDC", 6);
    handleNewPoolV11(event);
    assert.entityCount("DexAmmProtocol", 2);
    assert.entityCount("LiquidityPool", 2);
    assert.entityCount("Token", 3);
  });

  test("handleTransfer", () => {
    let address = "0x126645968B1C659a3408Fec5c8099ea37f06e579";
    let from = "0x87f16c31e32Ae543278F5194cf94862F1Cb1EEe0";
    let to = "0x0000000000000000000000000000000000000000";
    let value = "1017969969809150554806";
    let txHash =
      "0x284595902d8048a22b66f377da012914a55538b7b9a73c7d1014e631ed4d0269";
    let blockNum = "17032611";
    let txFrom = "0xe1441ad5582593d72f67de458eeaa8b003487862";
    let txTo = "0xa356867faced8e71aeaf87805808803806231fdc";
    let logIndex = "184";
    let txIndex = "98";
    let event = createTransfer(
      address,
      from,
      to,
      value,
      txFrom,
      txTo,
      txHash,
      BigInt.fromString(txIndex),
      BigInt.fromString(logIndex),
      BigInt.fromString(blockNum),
      BigInt.fromString("155555555")
    );

    let token0 = "0xeefba1e63905ef1d7acba5a8513c70307c1ce441";
    let token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    let ba0 = "1000000";
    let ba1 = "20000000";
    createMockedFunction(
      Address.fromString(token0),
      "getEthBalance",
      "getEthBalance(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(ba0))]);

    createMockedFunction(
      Address.fromString(token1),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(ba1))]);

    createMockedFunction(
      Address.fromString(address),
      "fee",
      "fee():(uint256)"
    ).reverts();

    createMockedFunction(
      Address.fromString(address),
      "slippageFee",
      "slippageFee():(uint256)"
    ).reverts();

    handleTransfer(event);
    assert.fieldEquals(
      "LiquidityPool",
      address.toLowerCase(),
      "inputTokenBalances",
      "[" + ba0 + ", 20000000000000000000" + "]"
    );
    const pool = LiquidityPool.load(address.toLowerCase()) as LiquidityPool;
  });
});
