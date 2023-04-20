import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  BancorNetwork1,
  Conversion,
} from "../../generated/BancorNetwork2/BancorNetwork1";
import { LiquidityPool, Swap, Token } from "../../generated/schema";
import {
  convertToExp18,
  getOrCreateLiquidityPool,
  getOrCreateSmartToken,
  getOrCreateToken,
  ZERO_BD,
  ZERO_BI,
} from "./helper";

// Converter events
export function handleBancorNetworkConversion(event: Conversion): void {
  const swapID = "swap-"
    .concat(event.transaction.hash.toHexString())
    .concat("-")
    .concat(event.logIndex.toString());

  const fromToken = getOrCreateToken(event.params._fromToken) as Token;
  const toToken = getOrCreateToken(event.params._toToken) as Token;

  const fromAmount = convertToExp18(
    event.params._fromAmount,
    fromToken.decimals
  );
  const toAmount = convertToExp18(event.params._toAmount, toToken.decimals);

  const anchorAddress = event.params._smartToken;
  let anchor = Token.load(anchorAddress.toHexString());
  // if not exist is not bancor2.1 event
  if (!anchor) {
    log.warning(
      "When BancorNetwork Swap, Anchor not exist in store,anchor: {}, blockNumber: {}, txHash: {}, logIndex: {}",
      [
        anchorAddress.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
        event.logIndex.toString(),
      ]
    );
    return;
  }
  anchor = getOrCreateSmartToken(
    event.address.toHexString(),
    anchorAddress,
    event.block.timestamp,
    event.block.number
  );

  let swap = Swap.load(swapID);
  if (!swap) {
    const poolAddress = anchor._pool!;
    let pair = LiquidityPool.load(poolAddress);
    if (!pair) {
      log.warning(
        "When BancorNetwork Swap, pool not exist in store,pool: {}, blockNumber: {}, txHash: {}, logIndex: {}",
        [
          poolAddress,
          event.block.number.toString(),
          event.transaction.hash.toHexString(),
          event.logIndex.toString(),
        ]
      );
      return;
    }
    pair = getOrCreateLiquidityPool(
      event.address.toHexString(),
      Address.fromString(poolAddress),
      event.block.timestamp,
      event.block.number
    );

    swap = new Swap(swapID);
    swap.hash = event.transaction.hash.toHexString();
    swap.from = event.transaction.from.toHexString();
    swap.to = event.params._trader.toHexString();
    swap.logIndex = event.logIndex.toI32();
    swap._trader = event.transaction.from.toHexString();
    swap.timestamp = event.block.timestamp;
    swap.tokenIn = fromToken.id;
    swap.amountIn = BigInt.fromString(fromAmount.toString());
    swap.tokenOut = toToken.id;
    swap.amountOut = BigInt.fromString(toAmount.toString());
    swap.pool = pair.id;
    swap._conversionFee = ZERO_BI;
    swap._price = ZERO_BD;
    swap._inversePrice = toAmount.div(fromAmount);
    swap._slippage = ZERO_BD;

    swap.protocol = pair.protocol;
    swap.blockNumber = event.block.number;
    swap.amountInUSD = ZERO_BD;
    swap.amountOutUSD = ZERO_BD;
    swap._isBancorNetwork = true;
  }
  const bancorNetworkContract = BancorNetwork1.bind(event.address);
  const res = bancorNetworkContract.try_conversionPath(
    Address.fromString(fromToken.id),
    Address.fromString(toToken.id)
  );
  if (!res.reverted) {
    const path = res.value.map<string>((value) => value.toHexString());
    swap._conversionPath = path;
  }
  //save
  swap.save();
}
