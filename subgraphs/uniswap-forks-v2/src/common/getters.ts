// import { log } from "@graphprotocol/graph-ts";
import { Address, ethereum } from "@graphprotocol/graph-ts";
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
  let token = Token.load(address);
  if (!token) {
    token = new Token(address);
    const erc20Contract = ERC20.bind(Address.fromString(address));
    const decimals = erc20Contract.try_decimals();
    // Using try_cause some values might be missing
    const name = erc20Contract.try_name();
    const symbol = erc20Contract.try_symbol();
    // TODO: add overrides for name and symbol
    token.decimals = decimals.reverted ? DEFAULT_DECIMALS : decimals.value;
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
