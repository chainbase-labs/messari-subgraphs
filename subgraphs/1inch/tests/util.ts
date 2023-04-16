import { Deployed } from "../generated/MooniswapFactory/MooniswapFactory";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  createMockedFunction,
  newMockEvent,
} from "matchstick-as/assembly/index";
import { Transfer } from "../generated/templates/Pool/Erc20";
import { Deployed as DeployedV11 } from "../generated/MooniswapFactoryV11/MooniswapFactoryV11";

export function createFunctionBase(
  address: string,
  symbol: string,
  name: string,
  decimal: i32
): void {
  createMockedFunction(
    Address.fromString(address),
    "symbol",
    "symbol():(string)"
  ).returns([ethereum.Value.fromString(symbol)]);

  createMockedFunction(
    Address.fromString(address),
    "name",
    "name():(string)"
  ).returns([ethereum.Value.fromString(name)]);

  createMockedFunction(
    Address.fromString(address),
    "decimals",
    "decimals():(uint8)"
  ).returns([ethereum.Value.fromI32(decimal)]);
}

export function createDeployed(
  address: string,
  pool: string,
  token0: string,
  token1: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): Deployed {
  let event = changetype<Deployed>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "mooniswap",
    ethereum.Value.fromAddress(Address.fromString(pool))
  );
  let pa1 = new ethereum.EventParam(
    "token1",
    ethereum.Value.fromAddress(Address.fromString(token0))
  );
  let pa2 = new ethereum.EventParam(
    "token2",
    ethereum.Value.fromAddress(Address.fromString(token1))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);

  event.logIndex = logIndex;
  event.block = new ethereum.Block(
    Bytes.fromHexString("0x11"),
    Bytes.fromHexString("0x12"),
    Bytes.fromHexString("0x13"),
    Address.zero(),
    Bytes.fromHexString("0x14"),
    Bytes.fromHexString("0x"),
    Bytes.fromHexString("0x"),
    blockNumber,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    timestamp,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    null,
    null
  );
  event.transaction = new ethereum.Transaction(
    Bytes.fromHexString(txHash),
    txIndex,
    Address.fromString(txFrom),
    Address.fromString(txTo),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createTransfer(
  address: string,
  from: string,
  to: string,
  value: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "from",
    ethereum.Value.fromAddress(Address.fromString(from))
  );
  let pa1 = new ethereum.EventParam(
    "to",
    ethereum.Value.fromAddress(Address.fromString(to))
  );
  let pa2 = new ethereum.EventParam(
    "value",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);

  event.logIndex = logIndex;
  event.block = new ethereum.Block(
    Bytes.fromHexString("0x11"),
    Bytes.fromHexString("0x12"),
    Bytes.fromHexString("0x13"),
    Address.zero(),
    Bytes.fromHexString("0x14"),
    Bytes.fromHexString("0x"),
    Bytes.fromHexString("0x"),
    blockNumber,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    timestamp,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    null,
    null
  );
  event.transaction = new ethereum.Transaction(
    Bytes.fromHexString(txHash),
    txIndex,
    Address.fromString(txFrom),
    Address.fromString(txTo),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createDeployedV11(
  address: string,
  pool: string,
  token0: string,
  token1: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): DeployedV11 {
  let event = changetype<DeployedV11>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "mooniswap",
    ethereum.Value.fromAddress(Address.fromString(pool))
  );
  let pa1 = new ethereum.EventParam(
    "token1",
    ethereum.Value.fromAddress(Address.fromString(token0))
  );
  let pa2 = new ethereum.EventParam(
    "token2",
    ethereum.Value.fromAddress(Address.fromString(token1))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);

  event.logIndex = logIndex;
  event.block = new ethereum.Block(
    Bytes.fromHexString("0x11"),
    Bytes.fromHexString("0x12"),
    Bytes.fromHexString("0x13"),
    Address.zero(),
    Bytes.fromHexString("0x14"),
    Bytes.fromHexString("0x"),
    Bytes.fromHexString("0x"),
    blockNumber,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    timestamp,
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    null,
    null
  );
  event.transaction = new ethereum.Transaction(
    Bytes.fromHexString(txHash),
    txIndex,
    Address.fromString(txFrom),
    Address.fromString(txTo),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}
