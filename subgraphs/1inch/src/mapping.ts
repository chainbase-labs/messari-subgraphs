import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Deployed as DeployedV10 } from "../generated/MooniswapFactory/MooniswapFactory";
import { Deployed as DeployedV11 } from "../generated/MooniswapFactoryV11/MooniswapFactoryV11";
import { Transfer } from "../generated/templates/Pool/Erc20";
import { Multicall } from "../generated/templates/Pool/Multicall";
import { LiquidityPool, Token } from "../generated/schema";
import { PoolAbi } from "../generated/templates/Pool/PoolAbi";
import {
  convertToExp18,
  createLiquidityPool,
  fetchTokenBalance,
} from "./helper";

export function handleNewPool(event: DeployedV10): void {
  const poolAddress = event.params.mooniswap;
  let pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    pool = createLiquidityPool(
      event.address.toHexString(),
      "1inchV10",
      "1inch-v10",
      poolAddress,
      event.params.token1,
      event.params.token2,
      event.block.timestamp,
      event.block.number,
      "1inch-v10"
    );
  }
}

export function handleNewPoolV11(event: DeployedV11): void {
  const poolAddress = event.params.mooniswap;
  let pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    pool = createLiquidityPool(
      event.address.toHexString(),
      "1inchV10",
      "1inch-v10",
      poolAddress,
      event.params.token1,
      event.params.token2,
      event.block.timestamp,
      event.block.number,
      "1inch-v10"
    );
  }
}

export function handleTransfer(event: Transfer): void {
  const poolAddress = event.address;
  const pool = LiquidityPool.load(poolAddress.toHexString());
  if (!pool) {
    log.warning("handleTransfer:pool not exist in store: {}, txHash: {}", [
      poolAddress.toHexString(),
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const poolContract = PoolAbi.bind(poolAddress);
  const balances = pool.inputTokenBalances;
  const token0Address = pool.inputTokens[0];
  const token1Address = pool.inputTokens[1];
  if (token0Address == Address.zero().toHexString()) {
    // use multi call here
    const bal = Multicall.bind(
      Address.fromString("0xeefba1e63905ef1d7acba5a8513c70307c1ce441")
    ).getEthBalance(poolAddress);
    balances[0] = BigInt.fromString(convertToExp18(bal, 18).toString());
  } else {
    const token0 = Token.load(token0Address);
    if (!token0) {
      log.warning(
        "handleTransfer:token0 not exist in store: {}, pool: {}, txHash: {}",
        [
          token0Address,
          poolAddress.toHexString(),
          event.transaction.hash.toHexString(),
        ]
      );
      return;
    }
    const bal = fetchTokenBalance(
      Address.fromString(token0Address),
      poolAddress
    );
    balances[0] = BigInt.fromString(
      convertToExp18(bal, token0.decimals).toString()
    );
  }

  const token1 = Token.load(token1Address);
  if (!token1) {
    log.warning(
      "handleTransfer:token0 not exist in store: {}, pool: {}, txHash: {}",
      [
        token0Address,
        poolAddress.toHexString(),
        event.transaction.hash.toHexString(),
      ]
    );
    return;
  }
  const bal = fetchTokenBalance(Address.fromString(token1Address), poolAddress);
  balances[1] = BigInt.fromString(
    convertToExp18(bal, token1.decimals).toString()
  );

  pool.inputTokenBalances = balances;
  const feeRes = poolContract.try_fee();
  if (!feeRes.reverted) {
    const fee = feeRes.value;
    pool._fee = convertToExp18(fee, 18);
  }

  const slippageRes = poolContract.try_slippageFee();
  if (!slippageRes.reverted) {
    const slippage = slippageRes.value;
    pool._slippage = convertToExp18(slippage, 18);
  }

  pool.save();
}
