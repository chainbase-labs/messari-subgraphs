// import { log } from "@graphprotocol/graph-ts";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { NetworkConfigs } from "../../configurations/configure";
import { TokenABI as ERC20 } from "../../generated/Factory/TokenABI";
import { _Transfer, LiquidityPool, Token } from "../../generated/schema";
import { DEFAULT_DECIMALS } from "./constants";

export function getLiquidityPool(poolAddress: string): LiquidityPool {
  const pool = LiquidityPool.load(poolAddress)!;
  return pool;
}

export function getOrCreateTransfer(event: ethereum.Event): _Transfer {
  let transfer = _Transfer.load(event.transaction.hash.toHexString());
  if (!transfer) {
    transfer = new _Transfer(event.transaction.hash.toHexString());
    transfer.blockNumber = event.block.number;
    transfer.timestamp = event.block.timestamp;
  }
  transfer.save();
  return transfer;
}

export function getOrCreateToken(
  event: ethereum.Event,
  address: string
): Token {
  log.info("get or create token {}", [address]);
  let token = Token.load(address);
  if (!token) {
    log.info("create token {}", [address]);
    token = new Token(address);
    const erc20Contract = ERC20.bind(Address.fromString(address));

    const decimals = fetchTokenDecimals(Address.fromString(address));
    // Using try_cause some values might be missing
    const name = erc20Contract.try_name();
    const symbol = erc20Contract.try_symbol();
    // TODO: add overrides for name and symbol

    token.decimals = decimals;
    token.name = name.reverted ? "" : name.value;
    token.symbol = symbol.reverted ? "" : symbol.value;
    if (NetworkConfigs.getBrokenERC20Tokens().includes(address)) {
      token.name = "";
      token.symbol = "";
      token.decimals = DEFAULT_DECIMALS;
      token.save();

      return token as Token;
    }

    token.save();
  }

  return token as Token;
}

export function fetchTokenDecimals(tokenAddress: Address): i32 {
  // static definitions overrides
  const contract = ERC20.bind(tokenAddress);
  const res = contract.tryCall("decimals", "decimals():(uint8)", []);
  if (res.reverted) {
    return DEFAULT_DECIMALS;
  }
  const value = res.value;
  const decimalU32 = value[0].toBigInt();
  if (
    decimalU32.ge(BigInt.fromI32(i32.MIN_VALUE)) &&
    decimalU32.le(BigInt.fromI32(i32.MAX_VALUE))
  ) {
    return value[0].toI32();
  }
  return DEFAULT_DECIMALS;
}

export function getOrCreateLPToken(
  tokenAddress: string,
  token0: Token,
  token1: Token
): Token {
  let token = Token.load(tokenAddress);
  // fetch info if null
  if (token === null) {
    token = new Token(tokenAddress);
    token.symbol = token0.name + "/" + token1.name;
    token.name = token0.name + "/" + token1.name + " LP";
    token.decimals = DEFAULT_DECIMALS;
    token.save();
  }
  return token;
}
