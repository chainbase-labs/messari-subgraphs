import { Address, store } from "@graphprotocol/graph-ts";
import {
  ConverterAddition,
  ConverterRemoval,
  OwnerUpdate as ConverterRegistryOwnerUpdate,
  TokenAddition,
  TokenRemoval,
} from "../../generated/ConverterRegistryContract1/ConverterRegistryContract";
import { LiquidityPool, Token } from "../../generated/schema";
import {
  getOrCreateLiquidityPool,
  getOrCreateProtocol,
  getOrCreateSmartToken,
} from "./helper";
import {
  ConvertibleTokenAdded,
  ConvertibleTokenRemoved,
  LiquidityPoolAdded,
  LiquidityPoolRemoved,
  SmartTokenAdded,
  SmartTokenRemoved,
} from "../../generated/ConverterRegistryContract3/ConverterRegistryContract";

// Converter Registry events
export function handleTokenAddition(event: TokenAddition): void {}

export function handleTokenRemoval(event: TokenRemoval): void {}

export function handleConverterAddition(event: ConverterAddition): void {
  const poolAddress = event.params._address;
  const pool = getOrCreateLiquidityPool(
    event.address.toHexString(),
    "Converter Registry",
    "converter-registry",
    poolAddress,
    event.block.timestamp,
    event.block.number
  );
  const smartToken = event.params._token;
  const tokens = pool.inputTokens;
  let smartTokenType = "Liquid";
  if (tokens.length == 2) {
    smartTokenType = "Relay";
  }

  if (tokens.length > 1) {
    const smartTokenEntity = getOrCreateSmartToken(smartToken);
    smartTokenEntity._smartTokenType = smartTokenType;
    smartTokenEntity.save();
  }
}

export function handleConverterRemoval(event: ConverterRemoval): void {
  const protocol = getOrCreateProtocol(event.address.toHexString(), "", "");
  const pool = event.params._address.toHexString();
  store.remove("LiquidityPool", pool);
  protocol.totalPoolCount -= 1;
  protocol.save();
}

export function handleConverterRegistryOwnerUpdate(
  event: ConverterRegistryOwnerUpdate
): void {
  const protocol = getOrCreateProtocol(event.address.toHexString(), "", "");
  protocol._owner = event.params._newOwner.toHexString();
  protocol.save();
}

export function handleSmartTokenAdded(event: SmartTokenAdded): void {
  const token = getOrCreateSmartToken(event.params._smartToken);
  const protocol = getOrCreateProtocol(event.address.toHexString(), "", "");
  const smartTokens = protocol._smartTokens;
  if (!smartTokens) {
    protocol._smartTokens = [token.id];
  } else {
    const idx = smartTokens.indexOf(token.id);
    if (idx == -1) {
      smartTokens.push(token.id);
      protocol._smartTokens = smartTokens;
    }
  }
  const poolAddress = token._owner;
  if (poolAddress) {
    const pool = getOrCreateLiquidityPool(
      event.address.toHexString(),
      "",
      "",
      Address.fromString(poolAddress),
      event.block.timestamp,
      event.block.number
    ) as LiquidityPool;
    pool.outputToken = token.id;
    pool.save();
  }
  protocol.save();
}

export function handleSmartTokenRemoved(event: SmartTokenRemoved): void {
  const tokenAddress = event.params._smartToken.toHexString();
  store.remove("Token", tokenAddress);
  const protocol = getOrCreateProtocol(event.address.toHexString(), "", "");
  const smartTokens = protocol._smartTokens!;
  const idx = smartTokens.indexOf(tokenAddress);
  if (idx !== -1) {
    smartTokens.splice(idx, 1);
    protocol._smartTokens = smartTokens;
  }
  protocol.save();
}

export function handleLiquidityPoolAdded(event: LiquidityPoolAdded): void {}

export function handleLiquidityPoolRemoved(event: LiquidityPoolRemoved): void {}

export function handleConvertibleTokenAdded(
  event: ConvertibleTokenAdded
): void {}

export function handleConvertibleTokenRemoved(
  event: ConvertibleTokenRemoved
): void {
  const tokenAddress = event.params._convertibleToken.toHexString();
  store.remove("Token", tokenAddress);
  const smartToken = Token.load(
    event.params._smartToken.toHexString()
  ) as Token;
  if (!smartToken) {
    return;
  }
  let tokens = smartToken._connectorTokens!;
  const index = tokens.indexOf(tokenAddress);
  if (index !== -1) {
    tokens.splice(index, 1);
    smartToken._connectorTokens = tokens;
  }
  smartToken.save();

  const protocol = getOrCreateProtocol(event.address.toHexString(), "", "");
  tokens = protocol._tokens!;
  const idx = tokens.indexOf(tokenAddress);
  if (idx !== -1) {
    tokens.splice(idx, 1);
    protocol._tokens = tokens;
  }
  protocol.save();
}
