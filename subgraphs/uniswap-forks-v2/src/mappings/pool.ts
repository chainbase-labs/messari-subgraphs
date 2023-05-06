import {
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../../generated/templates/Pair/Pair";
import {
  createDeposit,
  createSwapHandleVolumeAndFees,
  createWithdraw,
} from "../common/creators";
import {
  handleTransferBurn,
  handleTransferMint,
  handleTransferToPoolBurn,
} from "../common/handlers";
import { updateInputTokenBalances } from "../common/updateMetrics";
import {
  BIGINT_THOUSAND,
  BIGINT_ZERO,
  ZERO_ADDRESS,
} from "../common/constants";
import { getLiquidityPool } from "../common/getters";

// Handle transfers event.
// The transfers are either occur as a part of the Mint or Burn event process.
// The tokens being transferred in these events are the LP tokens from the liquidity pool that emitted this event.
export function handleTransfer(event: Transfer): void {
  const pool = getLiquidityPool(event.address.toHexString());

  // ignore initial transfers for first adds
  // UniswapV2Pair.MINIMUM_LIQUIDITY=1000
  // when Pair.totalSupply=0, transfer 1000 from 0x0 to 0x0
  if (
    event.params.to.toHexString() == ZERO_ADDRESS &&
    event.params.value.equals(BIGINT_THOUSAND) &&
    pool.outputTokenSupply! == BIGINT_ZERO
  ) {
    return;
  }
  // mints
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    handleTransferMint(
      event,
      pool,
      event.params.value,
      event.params.to.toHexString()
    );
  }

  /** when removeLiquidity, router will
   1.call UniswapV2Pair.transferFrom: transfer liquidity from txFrom to pair
   2.call UniswapV2Pair.burn: transfer liquidity from pair to 0x0
   **/
  // Case where direct send first on native token withdrawls.
  // For burns, mint tokens are first transferred to the pool before transferred for burn.
  // This gets the EOA that made the burn loaded into the _Transfer.

  if (event.params.to == event.address) {
    handleTransferToPoolBurn(event, event.params.from.toHexString());
  }
  // burn
  if (
    event.params.to.toHexString() == ZERO_ADDRESS &&
    event.params.from == event.address
  ) {
    handleTransferBurn(
      event,
      pool,
      event.params.value,
      event.params.from.toHexString()
    );
  }
}

// Handle Sync event.
// Emitted after every Swap, Mint, and Burn event.
// Gives information about the rebalancing of tokens used to update tvl, balances, and token pricing
export function handleSync(event: Sync): void {
  updateInputTokenBalances(
    event,
    event.address.toHexString(),
    event.params.reserve0,
    event.params.reserve1
  );
}

// Handle a mint event emitted from a pool contract. Considered a deposit into the given liquidity pool.
export function handleMint(event: Mint): void {
  createDeposit(event, event.params.amount0, event.params.amount1);
}

// Handle a burn event emitted from a pool contract. Considered a withdraw into the given liquidity pool.
export function handleBurn(event: Burn): void {
  createWithdraw(event, event.params.amount0, event.params.amount1);
}

// Handle a swap event emitted from a pool contract.
export function handleSwap(event: Swap): void {
  createSwapHandleVolumeAndFees(
    event,
    event.params.to.toHexString(),
    event.params.sender.toHexString(),
    event.params.amount0In,
    event.params.amount1In,
    event.params.amount0Out,
    event.params.amount1Out
  );
}
