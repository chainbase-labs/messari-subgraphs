import { createMockedFunction, newMockEvent } from "matchstick-as";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  ConverterAddition,
  ConverterRemoval,
} from "../../generated/ConverterRegistryContract1/ConverterRegistryContract";
import {
  ConvertibleTokenAdded,
  SmartTokenAdded,
} from "../../generated/ConverterRegistryContract3/ConverterRegistryContract";
import { ConverterUpgrade } from "../../generated/ConverterUpgraderContract/ConverterUpgraderContract";
import { Conversion } from "../../generated/templates/ConverterContract/ConverterContract";

export function createConverterBaseRevertsFunctions(address: Address): void {
  createMockedFunction(
    address,
    "getQuickBuyPathLength",
    "getQuickBuyPathLength():(uint256)"
  ).reverts();
  createMockedFunction(
    address,
    "connectorTokenCount",
    "connectorTokenCount():(uint16)"
  ).reverts();
  createMockedFunction(address, "version", "version():(string)").reverts();
  createMockedFunction(address, "owner", "owner():(address)").reverts();
  createMockedFunction(address, "manager", "manager():(address)").reverts();
  createMockedFunction(
    address,
    "maxConversionFee",
    "maxConversionFee():(uint32)"
  ).reverts();
  createMockedFunction(
    address,
    "converterType",
    "converterType():(string)"
  ).reverts();
  createMockedFunction(address, "registry", "registry():(address)").reverts();
}

export function createConverterBaseReturnFunctions(
  address: Address,
  qbpLength: string,
  tokenCount: string,
  version: string,
  owner: string,
  manager: string,
  maxConversion: string,
  type: string,
  registry: string
): void {
  createMockedFunction(
    address,
    "getQuickBuyPathLength",
    "getQuickBuyPathLength():(uint256)"
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(qbpLength))]);
  createMockedFunction(
    address,
    "connectorTokenCount",
    "connectorTokenCount():(uint16)"
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromString(tokenCount))]);
  createMockedFunction(address, "version", "version():(string)").reverts();
  createMockedFunction(address, "owner", "owner():(address)").returns([
    ethereum.Value.fromAddress(Address.fromString(owner)),
  ]);
  createMockedFunction(address, "manager", "manager():(address)").returns([
    ethereum.Value.fromAddress(Address.fromString(manager)),
  ]);
  createMockedFunction(
    address,
    "maxConversionFee",
    "maxConversionFee():(uint32)"
  ).returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(maxConversion)),
  ]);
  createMockedFunction(
    address,
    "converterType",
    "converterType():(string)"
  ).returns([ethereum.Value.fromString(type)]);
  createMockedFunction(address, "registry", "registry():(address)").returns([
    ethereum.Value.fromAddress(Address.fromString(registry)),
  ]);
}

export function createTokenBaseFunctions(
  token: Address,
  symbol: string,
  name: string,
  decimal: i32
): void {
  createMockedFunction(token, "symbol", "symbol():(string)").returns([
    ethereum.Value.fromString(symbol),
  ]);
  createMockedFunction(token, "name", "name():(string)").returns([
    ethereum.Value.fromString(name),
  ]);
  createMockedFunction(token, "decimals", "decimals():(uint8)").returns([
    ethereum.Value.fromI32(decimal),
  ]);
}

export function createSmartTokenBaseFunction(
  token: Address,
  symbol: string,
  name: string,
  decimal: i32,
  version: string,
  owner: string,
  standard: string,
  transfer: boolean
): void {
  createTokenBaseFunctions(token, symbol, name, decimal);
  createMockedFunction(token, "version", "version():(string)").returns([
    ethereum.Value.fromString(symbol),
  ]);
  createMockedFunction(token, "standard", "standard():(string)").returns([
    ethereum.Value.fromString(standard),
  ]);
  createMockedFunction(
    token,
    "transfersEnabled",
    "transfersEnabled():(bool)"
  ).returns([ethereum.Value.fromBoolean(transfer)]);
  createMockedFunction(token, "owner", "owner():(address)").returns([
    ethereum.Value.fromAddress(Address.fromString(owner)),
  ]);
}

export function createConverterAdd(
  address: string,
  token: string,
  converter: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): ConverterAddition {
  const event = changetype<ConverterAddition>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_token",
    ethereum.Value.fromAddress(Address.fromString(token))
  );
  let pa1 = new ethereum.EventParam(
    "_address",
    ethereum.Value.fromAddress(Address.fromString(converter))
  );
  event.parameters.push(pa0);
  event.parameters.push(pa1);

  event.address = Address.fromString(address);
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

export function createConverterRemove(
  address: string,
  token: string,
  converter: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): ConverterRemoval {
  const event = changetype<ConverterRemoval>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_token",
    ethereum.Value.fromAddress(Address.fromString(token))
  );
  let pa1 = new ethereum.EventParam(
    "_address",
    ethereum.Value.fromAddress(Address.fromString(converter))
  );
  event.parameters.push(pa0);
  event.parameters.push(pa1);

  event.address = Address.fromString(address);
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

export function createConvertibleTokenAdd(
  address: string,
  token: string,
  smartToken: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): ConvertibleTokenAdded {
  const event = changetype<ConvertibleTokenAdded>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_convertibleToken",
    ethereum.Value.fromAddress(Address.fromString(token))
  );
  let pa1 = new ethereum.EventParam(
    "_smartToken",
    ethereum.Value.fromAddress(Address.fromString(smartToken))
  );
  event.parameters.push(pa0);
  event.parameters.push(pa1);

  event.address = Address.fromString(address);
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

export function createSmartTokenAdd(
  address: string,
  token: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): SmartTokenAdded {
  const event = changetype<SmartTokenAdded>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_smartToken",
    ethereum.Value.fromAddress(Address.fromString(token))
  );
  event.parameters.push(pa0);

  event.address = Address.fromString(address);
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

export function createConverterUpgrader(
  address: string,
  old: string,
  newConverter: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): ConverterUpgrade {
  const event = changetype<ConverterUpgrade>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_oldConverter",
    ethereum.Value.fromAddress(Address.fromString(old))
  );
  event.parameters.push(pa0);

  let pa1 = new ethereum.EventParam(
    "_newConverter",
    ethereum.Value.fromAddress(Address.fromString(newConverter))
  );
  event.parameters.push(pa1);

  event.address = Address.fromString(address);
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

export function createConversion(
  address: string,
  _fromToken: string,
  _toToken: string,
  _trader: string,
  _amount: string,
  _return: string,
  _conversionFee: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): Conversion {
  const event = changetype<Conversion>(newMockEvent());
  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "_fromToken",
    ethereum.Value.fromAddress(Address.fromString(_fromToken))
  );
  let pa1 = new ethereum.EventParam(
    "_toToken",
    ethereum.Value.fromAddress(Address.fromString(_toToken))
  );
  let pa2 = new ethereum.EventParam(
    "_trader",
    ethereum.Value.fromAddress(Address.fromString(_trader))
  );
  let pa3 = new ethereum.EventParam(
    "_amount",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(_amount))
  );
  let pa4 = new ethereum.EventParam(
    "_return",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(_return))
  );
  let pa5 = new ethereum.EventParam(
    "_conversionFee",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(_conversionFee))
  );
  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);
  event.parameters.push(pa4);
  event.parameters.push(pa5);

  event.address = Address.fromString(address);
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
