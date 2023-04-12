import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AddDODOCall, DODOBirth } from "../../generated/DODOZoo/DODOZoo";
import { createMockedFunction, newMockCall, newMockEvent } from "matchstick-as";
import {
  BuyBaseToken,
  Deposit,
  SellBaseToken,
  UpdateLiquidityProviderFeeRate,
  Withdraw,
} from "../../generated/templates/DODO/DODO";
import { ZERO_BI } from "../../protocols/dodo-v1/src/mappings/helpers";

export function createNewDodo(
  address: string,
  newBornAddress: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
  txHash: string,
  txIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): DODOBirth {
  let newDodoEvent = changetype<DODOBirth>(newMockEvent());
  newDodoEvent.address = Address.fromString(address);

  newDodoEvent.parameters = new Array();
  let newBornParam = new ethereum.EventParam(
    "newBorn",
    ethereum.Value.fromAddress(Address.fromString(newBornAddress))
  );
  let baseTokenParam = new ethereum.EventParam(
    "baseToken",
    ethereum.Value.fromAddress(Address.fromString(baseTokenAddress))
  );
  let quoteTokenParam = new ethereum.EventParam(
    "quoteToken",
    ethereum.Value.fromAddress(Address.fromString(quoteTokenAddress))
  );

  newDodoEvent.parameters.push(newBornParam);
  newDodoEvent.parameters.push(baseTokenParam);
  newDodoEvent.parameters.push(quoteTokenParam);

  newDodoEvent.block = new ethereum.Block(
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
  newDodoEvent.transaction = new ethereum.Transaction(
    Bytes.fromHexString(txHash),
    txIndex,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return newDodoEvent;
}

export function createFunctionBase(
  address: string,
  symbol: string,
  name: string,
  decimal: i32,
  totalSupply: string
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

  createMockedFunction(
    Address.fromString(address),
    "totalSupply",
    "totalSupply():(uint256)"
  ).returns([ethereum.Value.fromSignedBigInt(BigInt.fromString(totalSupply))]);
}

export function createNewDodoCall(
  address: string,
  newBornAddress: string,
  txHash: string,
  txIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): AddDODOCall {
  let dodoCall = changetype<AddDODOCall>(newMockCall());

  dodoCall.inputValues = [
    new ethereum.EventParam(
      "dodo",
      ethereum.Value.fromAddress(Address.fromString(newBornAddress))
    ),
  ];
  dodoCall.block = new ethereum.Block(
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
  dodoCall.transaction = new ethereum.Transaction(
    Bytes.fromHexString(txHash),
    txIndex,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return dodoCall;
}

export function createDepositEvent(
  address: string,
  payer: string,
  receiver: string,
  isBaseToken: boolean,
  amount: string,
  lpTokenAmount: string,
  txHash: string,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): Deposit {
  let event = changetype<Deposit>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "payer",
    ethereum.Value.fromAddress(Address.fromString(payer))
  );
  let pa1 = new ethereum.EventParam(
    "receiver",
    ethereum.Value.fromAddress(Address.fromString(receiver))
  );
  let pa2 = new ethereum.EventParam(
    "isBaseToken",
    ethereum.Value.fromBoolean(isBaseToken)
  );
  let pa3 = new ethereum.EventParam(
    "amount",
    ethereum.Value.fromSignedBigInt(BigInt.fromString(amount))
  );
  let pa4 = new ethereum.EventParam(
    "lpTokenAmount",
    ethereum.Value.fromSignedBigInt(BigInt.fromString(lpTokenAmount))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);
  event.parameters.push(pa4);

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
    ZERO_BI,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createWithdrawEvent(
  address: string,
  payer: string,
  receiver: string,
  isBaseToken: boolean,
  amount: string,
  lpTokenAmount: string,
  txHash: string,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): Withdraw {
  let event = changetype<Withdraw>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "payer",
    ethereum.Value.fromAddress(Address.fromString(payer))
  );
  let pa1 = new ethereum.EventParam(
    "receiver",
    ethereum.Value.fromAddress(Address.fromString(receiver))
  );
  let pa2 = new ethereum.EventParam(
    "isBaseToken",
    ethereum.Value.fromBoolean(isBaseToken)
  );
  let pa3 = new ethereum.EventParam(
    "amount",
    ethereum.Value.fromSignedBigInt(BigInt.fromString(amount))
  );
  let pa4 = new ethereum.EventParam(
    "lpTokenAmount",
    ethereum.Value.fromSignedBigInt(BigInt.fromString(lpTokenAmount))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);
  event.parameters.push(pa4);

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
    ZERO_BI,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createSellBaseTokenEvent(
  address: string,
  seller: string,
  payBase: string,
  receiveQuote: string,
  txHash: string,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): SellBaseToken {
  let event = changetype<SellBaseToken>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "seller",
    ethereum.Value.fromAddress(Address.fromString(seller))
  );
  let pa1 = new ethereum.EventParam(
    "payBase",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(payBase))
  );
  let pa2 = new ethereum.EventParam(
    "receiveQuote",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(receiveQuote))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);

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
    ZERO_BI,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createBuyBaseTokenEvent(
  address: string,
  buyer: string,
  payQuote: string,
  receiveBase: string,
  txHash: string,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): BuyBaseToken {
  let event = changetype<BuyBaseToken>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "buyer",
    ethereum.Value.fromAddress(Address.fromString(buyer))
  );
  let pa1 = new ethereum.EventParam(
    "payQuote",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(payQuote))
  );
  let pa2 = new ethereum.EventParam(
    "receiveBase",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(receiveBase))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa2);
  event.parameters.push(pa1);

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
    ZERO_BI,
    Address.zero(),
    Address.zero(),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  );
  return event;
}

export function createUpdateLiquidityProviderFeeRateEvent(
  address: string,
  oldLiquidityProviderFeeRate: string,
  newLiquidityProviderFeeRate: string
): UpdateLiquidityProviderFeeRate {
  let event = changetype<UpdateLiquidityProviderFeeRate>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "oldLiquidityProviderFeeRate",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(oldLiquidityProviderFeeRate)
    )
  );
  let pa1 = new ethereum.EventParam(
    "newLiquidityProviderFeeRate",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(newLiquidityProviderFeeRate)
    )
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  return event;
}
