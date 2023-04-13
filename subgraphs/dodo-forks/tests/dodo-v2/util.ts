import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction, newMockEvent } from "matchstick-as";
import { NewDVM, RemoveDVM } from "../../generated/DVMFactory/DVMFactory";
import {
  STABLE_TWO_ADDRESS,
  WRAPPED_BASE_COIN,
} from "../../src/common/constant";
import { NewDPP, RemoveDPP } from "../../generated/DPPFactory/DPPFactory";
import { NewDSP, RemoveDSP } from "../../generated/DSPFactory/DSPFactory";
import {
  BuyShares,
  DODOSwap,
  SellShares,
} from "../../generated/templates/DVM/DVM";
import { LpFeeRateChange } from "../../generated/templates/DPP/DPP";

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

export function createFunctionsBases(): void {
  createFunctionBase(
    WRAPPED_BASE_COIN,
    "WETH",
    "Wrapped Ether",
    18,
    "3855761620390936910524136"
  );
  createFunctionBase(
    STABLE_TWO_ADDRESS,
    "USDC",
    "USD Coin",
    6,
    "30788496417169550"
  );
  createFunctionBase(
    "0x514910771af9ca656af840dff83e8264ecf986ca",
    "LINK",
    "ChainLink Token",
    18,
    "1000000000000000000000000000"
  );
  createFunctionBase(
    "0x054f76beed60ab6dbeb23502178c52d6c5debe40",
    "FIN",
    "DeFiner",
    18,
    "168000000000000000000000000"
  );
  createFunctionBase(
    "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    "SNX",
    "Synthetix Network Token",
    18,
    "316672351088773603337882496"
  );
  createFunctionBase(
    "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "COMP",
    "Compound",
    18,
    "1000000000000000000000000000"
  );
  createFunctionBase(
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "WBTC",
    "Wrapped BTC",
    8,
    "15070068512944"
  );
  createFunctionBase(
    "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    "YFI",
    "yearn.finance",
    18,
    "36666000000000000000000"
  );
  createFunctionBase(
    "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd",
    "DODO",
    "DODO bird",
    18,
    "1000000000000000000000000000"
  );
  createFunctionBase(
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "USDT",
    "Tether USD",
    6,
    "35283904986788565"
  );
  createFunctionBase(
    "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    "AAVE",
    "Aave Token",
    18,
    "16000000000000000000000000"
  );
  createFunctionBase(
    "0xa0afaa285ce85974c3c881256cb7f225e3a1178a",
    "wCRES",
    "Wrapped CRES",
    18,
    "1173496000000000000000000"
  );
  createFunctionBase(
    "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    "WOO",
    "Wootrade Network",
    18,
    "3000000000000000000000000000"
  );

  createFunctionBase(
    "0xc11eccdee225d644f873776a68a02ecd8c015697",
    "DLP",
    "Wrapped Ether_DODO_LP_TOKEN_",
    6,
    "230558714411133209683"
  );
  createFunctionBase(
    "0x6a5eb3555cbbd29016ba6f6ffbccee28d57b2932",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "46378187612"
  );
  createFunctionBase(
    "0xf03f3d2fbee37f92ec91ae927a8019cacef4b738",
    "DLP",
    "ChainLink Token_DODO_LP_TOKEN_",
    18,
    "210016382592027719151"
  );
  createFunctionBase(
    "0x7c4a6813b6af50a2aa2720d861c796a990245383",
    "DLP",
    "DeFiner_DODO_LP_TOKEN_",
    18,
    "3999732759385336881"
  );
  createFunctionBase(
    "0x5bd1b7d3930d7a5e8fd5aeec6b931c822c8be14e",
    "DLP",
    "Synthetix Network Token_DODO_LP_TOKEN_",
    18,
    "1003707923800241937746"
  );
  createFunctionBase(
    "0x53cf4694b427fcef9bb1f4438b68df51a10228d0",
    "DLP",
    "Compound_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0x0f769bc3ecbda8e0d78280c88e31609e899a1f78",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x2ec2a42901c761b295a9e6b95200cd0bdaa474eb",
    "DLP",
    "Wrapped BTC_DODO_LP_TOKEN_",
    8,
    "657322644"
  );
  createFunctionBase(
    "0xe2852c572fc42c9e2ec03197defa42c647e89291",
    "DLP",
    "Wrapped Ether_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0x1270be1bf727447270f237115f0943011e35ee3e",
    "DLP",
    "Wrapped Ether_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0x3befc1f0f6cfe0ea852ae61709de370599c88bde",
    "DLP",
    "DODO bird_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0x50b11247bf14ee5116c855cde9963fa376fcec86",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_ ",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x30ad5b6d4e531591591113b49eae2fafbc2236d5",
    "DLP",
    "Aave Token_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0xcfba2e0f1bbf6ad96960d8866316b02e36ed1761",
    "DLP",
    "Wrapped CRES_DODO_LP_TOKEN_",
    18,
    "657322644"
  );
  createFunctionBase(
    "0xbf83ca9f0da7cf33da68b4cb2511885de955f094",
    "DLP",
    "Wootrade Network_DODO_LP_TOKEN_",
    18,
    "0"
  );

  createFunctionBase(
    "0x05a54b466f01510e92c02d3a180bae83a64baab8",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x51baf2656778ad6d67b19a419f91d38c3d0b87b6",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x0cdb21e20597d753c90458f5ef2083f6695eb794",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x1b06a22b20362b4115388ab8ca3ed0972230d78a",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0xd9d0bd18ddfa753d0c88a060ffb60657bb0d7a07",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x5840a9e733960f591856a5d13f6366658535bbe5",
    "DLP",
    "USD Coin_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0xa5b607d0b8e5963bbd8a2709c72c6362654e2b4b",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0xa62bf27fd1d64d488b609a09705a28a9b5240b9c",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x3dc2eb2f59ddca985174bb20ae9141ba66cfd2d3",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0x1e5bfc8c1225a6ce59504988f823c44e08414a49",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
  createFunctionBase(
    "0xe236b57de7f3e9c3921391c4cb9a42d9632c0022",
    "DLP",
    "Tether USD_DODO_LP_TOKEN_",
    6,
    "657322644"
  );
}

export function createNewDVM(
  address: string,
  dvm: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
  creator: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): NewDVM {
  let event = changetype<NewDVM>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "baseToken",
    ethereum.Value.fromAddress(Address.fromString(baseTokenAddress))
  );
  let pa1 = new ethereum.EventParam(
    "quoteToken",
    ethereum.Value.fromAddress(Address.fromString(quoteTokenAddress))
  );
  let pa2 = new ethereum.EventParam(
    "creator",
    ethereum.Value.fromAddress(Address.fromString(creator))
  );

  let pa3 = new ethereum.EventParam(
    "dvm",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);

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

export function createRemoveDVM(
  address: string,
  dvm: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): RemoveDVM {
  let event = changetype<RemoveDVM>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();

  let pa3 = new ethereum.EventParam(
    "dvm",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa3);

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

export function createNewDSP(
  address: string,
  dvm: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
  creator: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): NewDSP {
  let event = changetype<NewDSP>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "baseToken",
    ethereum.Value.fromAddress(Address.fromString(baseTokenAddress))
  );
  let pa1 = new ethereum.EventParam(
    "quoteToken",
    ethereum.Value.fromAddress(Address.fromString(quoteTokenAddress))
  );
  let pa2 = new ethereum.EventParam(
    "creator",
    ethereum.Value.fromAddress(Address.fromString(creator))
  );

  let pa3 = new ethereum.EventParam(
    "DSP",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);

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

export function createRemoveDSP(
  address: string,
  dvm: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): RemoveDSP {
  let event = changetype<RemoveDSP>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();

  let pa3 = new ethereum.EventParam(
    "DSP",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa3);

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

export function createNewDPP(
  address: string,
  dvm: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
  creator: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): NewDPP {
  let event = changetype<NewDPP>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa0 = new ethereum.EventParam(
    "baseToken",
    ethereum.Value.fromAddress(Address.fromString(baseTokenAddress))
  );
  let pa1 = new ethereum.EventParam(
    "quoteToken",
    ethereum.Value.fromAddress(Address.fromString(quoteTokenAddress))
  );
  let pa2 = new ethereum.EventParam(
    "creator",
    ethereum.Value.fromAddress(Address.fromString(creator))
  );

  let pa3 = new ethereum.EventParam(
    "dpp",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);

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

export function createRemoveDPP(
  address: string,
  dvm: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): RemoveDPP {
  let event = changetype<RemoveDPP>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();

  let pa3 = new ethereum.EventParam(
    "dpp",
    ethereum.Value.fromAddress(Address.fromString(dvm))
  );

  event.parameters.push(pa3);

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

export function createDODOSwapEvent(
  address: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  toAmount: string,
  trader: string,
  receiver: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): DODOSwap {
  let event = changetype<DODOSwap>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "fromToken",
    ethereum.Value.fromAddress(Address.fromString(fromToken))
  );
  let pa1 = new ethereum.EventParam(
    "toToken",
    ethereum.Value.fromAddress(Address.fromString(toToken))
  );
  let pa2 = new ethereum.EventParam(
    "fromAmount",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(fromAmount))
  );
  let pa3 = new ethereum.EventParam(
    "toAmount",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(toAmount))
  );
  let pa4 = new ethereum.EventParam(
    "trader",
    ethereum.Value.fromAddress(Address.fromString(trader))
  );
  let pa5 = new ethereum.EventParam(
    "receiver",
    ethereum.Value.fromAddress(Address.fromString(receiver))
  );
  event.parameters.push(pa0);
  event.parameters.push(pa1);
  event.parameters.push(pa2);
  event.parameters.push(pa3);
  event.parameters.push(pa4);
  event.parameters.push(pa5);

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

export function createBuySharesEvent(
  address: string,
  to: string,
  increaseShares: string,
  totalShares: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): BuyShares {
  let event = changetype<BuyShares>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa0 = new ethereum.EventParam(
    "to",
    ethereum.Value.fromAddress(Address.fromString(to))
  );
  let pa1 = new ethereum.EventParam(
    "increaseShares",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(increaseShares))
  );
  let pa2 = new ethereum.EventParam(
    "totalShares",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(totalShares))
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

export function createSellSharesEvent(
  address: string,
  payer: string,
  to: string,
  decreaseShares: string,
  totalShares: string,
  txFrom: string,
  txTo: string,
  txHash: string,
  txIndex: BigInt,
  logIndex: BigInt,
  blockNumber: BigInt,
  timestamp: BigInt
): SellShares {
  let event = changetype<SellShares>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  event.logIndex = logIndex;
  let pa3 = new ethereum.EventParam(
    "payer",
    ethereum.Value.fromAddress(Address.fromString(payer))
  );
  let pa0 = new ethereum.EventParam(
    "to",
    ethereum.Value.fromAddress(Address.fromString(to))
  );
  let pa1 = new ethereum.EventParam(
    "decreaseShares",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(decreaseShares))
  );
  let pa2 = new ethereum.EventParam(
    "totalShares",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(totalShares))
  );

  event.parameters.push(pa3);
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

export function createUpdateLPFeeRateEvent(
  address: string,
  newLpFeeRate: string
): LpFeeRateChange {
  let event = changetype<LpFeeRateChange>(newMockEvent());
  event.address = Address.fromString(address);

  event.parameters = new Array();
  let pa1 = new ethereum.EventParam(
    "newLpFeeRate",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(newLpFeeRate))
  );

  event.parameters.push(pa1);
  return event;
}
