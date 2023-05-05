import { log, ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  OrderFulfilled,
  OrderFulfilledConsiderationStruct,
  OrderFulfilledOfferStruct,
} from "../generated/templates/SeaportContract/SeaportExchange";
import {
  Collection,
  _OrderFulfillment,
  Trade,
  _Item,
} from "../generated/schema";
import {
  BIGDECIMAL_HUNDRED,
  BIGDECIMAL_ZERO,
  BIGINT_ZERO,
  orderFulfillmentMethod,
  tradeStrategy,
  ERC1155_INTERFACE_IDENTIFIER,
  ERC721_INTERFACE_IDENTIFIER,
  isERC1155,
  isERC721,
  isMoney,
  isNFT,
  isOpenSeaFeeAccount,
  MANTISSA_FACTOR,
  NftStandard,
  SeaportItemType,
  WETH_ADDRESS,
} from "./helper";
import { NftMetadata } from "../generated/templates/SeaportContract/NftMetadata";
import { ERC165 } from "../generated/templates/SeaportContract/ERC165";
import { SafeCreate2Call } from "../generated/ImmutableCreate2Factory/ImmutableCreate2Factory";
import { SeaportContract } from "../generated/templates";

class Sale {
  constructor(
    public readonly buyer: Address,
    public readonly seller: Address,
    public readonly nfts: NFTs,
    public readonly money: Money,
    public readonly fees: Fees
  ) {}
}

class NFTs {
  constructor(
    public readonly collection: Address,
    public readonly standard: string,
    public readonly tokenIds: Array<BigInt>,
    public readonly amounts: Array<BigInt>
  ) {}
}

class Money {
  constructor(public readonly amount: BigInt) {}
}

class Fees {
  constructor(
    public readonly protocolRevenue: BigInt,
    public readonly creatorRevenue: BigInt
  ) {}
}

/**
 * OrderFulfilled is good because it contains literally all neede data build up a `Trade` entity.
 * OrderFulfilled is also bad because it is very generic, requiring a lot of hidden knowledge to decipher its actual meaning.
 *
 * Hidden knowledge:
 * - `offer` and `consideration` are key to determine a NFT sale details.
 * - usually a pair of (offer, consideration) contains 4 items: the NFT, the sale volume, the protocol fee, and the royalty fee.
 * - both protocol fee and royalty fee exist in `consideration`
 * - protocol fee goes to a few addresses owned by opensea, see method `isOpenSeaFeeAccount`
 * - royalty fee goes to beneficiary account, the NFT collector admin can specify this
 * - the NFT and the sale volume exists in either `offer` or `consideration`
 * - if `offer` = [NFT], `consideration` = [sale volume, protocol fee, royalty fee], then the OrderFulfilled represents a ask, offerer = seller
 * - if `offer` = [sale volume], `consideration` = [NFT, protocol fee, royalty fee], then the OrderFulfilled represents a bid, offerer = buyer
 *
 * Note that the situation we describe above are usual cases. There are know corner cases that we need to handle:
 * - `offer` empty
 * - `consideration` empty, eg https://etherscan.io/tx/0xf72b9782adb5620fa20b8f322d231f8724728fd5411cabc870cbc24c6ca89527
 * - cannot find protocol fee from `consideration`, eg https://etherscan.io/tx/0xaaa0a8fd58c62952dbd198579826a1fefb48f34e8c97b7319e365e74eaaa24ec
 *
 * Know limitations:
 * - We are not handling bundle sale where NFTs from multiple collections are exchanged since we don't know how to treat the price, eg https://etherscan.io/tx/0xd8d2612fe4995478bc7537eb46786c3d6f0b13b1c50e01e04067eb92ba298d17
 */
export function handleOrderFulfilled(event: OrderFulfilled): void {
  const offerer = event.params.offerer;
  const recipient = event.params.recipient;
  const offer = event.params.offer;
  const consideration = event.params.consideration;

  const saleResult = tryGetSale(
    event,
    offerer,
    recipient,
    offer,
    consideration
  );
  if (!saleResult) {
    return;
  }

  const isBundle = saleResult.nfts.tokenIds.length > 1;
  const collectionAddr = saleResult.nfts.collection.toHexString();
  const collection = getOrCreateCollection(collectionAddr);
  const buyer = saleResult.buyer.toHexString();
  const seller = saleResult.seller.toHexString();
  const royaltyFee = saleResult.fees.creatorRevenue
    .toBigDecimal()
    .div(saleResult.money.amount.toBigDecimal())
    .times(BIGDECIMAL_HUNDRED);
  const totalNftAmount = saleResult.nfts.amounts.reduce(
    (acc, curr) => acc.plus(curr),
    BIGINT_ZERO
  );
  const volumeETH = saleResult.money.amount.toBigDecimal().div(MANTISSA_FACTOR);
  const priceETH = volumeETH.div(totalNftAmount.toBigDecimal());

  //
  // new trade
  //
  const nNewTrade = saleResult.nfts.tokenIds.length;
  for (let i = 0; i < nNewTrade; i++) {
    const tradeID = isBundle
      ? event.transaction.hash
          .toHexString()
          .concat("-")
          .concat(event.logIndex.toString())
          .concat("-")
          .concat(i.toString())
      : event.transaction.hash
          .toHexString()
          .concat("-")
          .concat(event.logIndex.toString());

    const trade = new Trade(tradeID);
    trade.transactionHash = event.transaction.hash.toHexString();
    trade.logIndex = event.logIndex.toI32();
    trade.timestamp = event.block.timestamp;
    trade.blockNumber = event.block.number;
    trade.isBundle = isBundle;
    trade.collection = collectionAddr;
    trade.tokenId = saleResult.nfts.tokenIds[i];
    trade.priceETH = priceETH;
    trade.amount = saleResult.nfts.amounts[i];
    // if it is a basic order then STANDARD_SALE
    // otherwise ANY_ITEM_FROM_SET.
    // TODO: ANY_ITEM_FROM_SET correct strategy? Cannot find docs on how to decide
    trade.strategy = tradeStrategy(event);
    trade.buyer = buyer;
    trade.seller = seller;
    trade.save();

    // Save details of how trade was fulfilled
    const orderFulfillment = new _OrderFulfillment(tradeID);
    orderFulfillment.trade = tradeID;
    orderFulfillment.orderFulfillmentMethod = orderFulfillmentMethod(event);
    orderFulfillment.save();
  }

  //
  // update collection
  //
  collection.tradeCount += nNewTrade;
  collection.royaltyFee = royaltyFee;
  const buyerCollectionAccountID = "COLLECTION_ACCOUNT-BUYER-"
    .concat(collection.id)
    .concat("-")
    .concat(buyer);
  let buyerCollectionAccount = _Item.load(buyerCollectionAccountID);
  if (!buyerCollectionAccount) {
    buyerCollectionAccount = new _Item(buyerCollectionAccountID);
    buyerCollectionAccount.save();
    collection.buyerCount += 1;
  }
  const sellerCollectionAccountID = "COLLECTION_ACCOUNT-SELLER-"
    .concat(collection.id)
    .concat("-")
    .concat(seller);
  let sellerCollectionAccount = _Item.load(sellerCollectionAccountID);
  if (!sellerCollectionAccount) {
    sellerCollectionAccount = new _Item(sellerCollectionAccountID);
    sellerCollectionAccount.save();
    collection.sellerCount += 1;
  }
  collection.cumulativeTradeVolumeETH =
    collection.cumulativeTradeVolumeETH.plus(volumeETH);
  const deltaMarketplaceRevenueETH = saleResult.fees.protocolRevenue
    .toBigDecimal()
    .div(MANTISSA_FACTOR);
  const deltaCreatorRevenueETH = saleResult.fees.creatorRevenue
    .toBigDecimal()
    .div(MANTISSA_FACTOR);
  collection.marketplaceRevenueETH = collection.marketplaceRevenueETH.plus(
    deltaMarketplaceRevenueETH
  );
  collection.creatorRevenueETH = collection.creatorRevenueETH.plus(
    deltaCreatorRevenueETH
  );
  collection.totalRevenueETH = collection.marketplaceRevenueETH.plus(
    collection.creatorRevenueETH
  );
  collection.save();
}

function getOrCreateCollection(collectionID: string): Collection {
  let collection = Collection.load(collectionID);
  if (!collection) {
    collection = new Collection(collectionID);
    collection.nftStandard = getNftStandard(collectionID);
    const contract = NftMetadata.bind(Address.fromString(collectionID));
    const nameResult = contract.try_name();
    if (!nameResult.reverted) {
      collection.name = nameResult.value;
    }
    const symbolResult = contract.try_symbol();
    if (!symbolResult.reverted) {
      collection.symbol = symbolResult.value;
    }
    const totalSupplyResult = contract.try_totalSupply();
    if (!totalSupplyResult.reverted) {
      collection.totalSupply = totalSupplyResult.value;
    }
    collection.royaltyFee = BIGDECIMAL_ZERO;
    collection.cumulativeTradeVolumeETH = BIGDECIMAL_ZERO;
    collection.marketplaceRevenueETH = BIGDECIMAL_ZERO;
    collection.creatorRevenueETH = BIGDECIMAL_ZERO;
    collection.totalRevenueETH = BIGDECIMAL_ZERO;
    collection.tradeCount = 0;
    collection.buyerCount = 0;
    collection.sellerCount = 0;
    collection.save();
  }
  return collection;
}

function getNftStandard(collectionID: string): string {
  const erc165 = ERC165.bind(Address.fromString(collectionID));

  const isERC721Result = erc165.try_supportsInterface(
    Bytes.fromHexString(ERC721_INTERFACE_IDENTIFIER)
  );
  if (isERC721Result.reverted) {
    log.warning("[getNftStandard] isERC721 reverted on {}", [collectionID]);
  } else {
    if (isERC721Result.value) {
      return NftStandard.ERC721;
    }
  }

  const isERC1155Result = erc165.try_supportsInterface(
    Bytes.fromHexString(ERC1155_INTERFACE_IDENTIFIER)
  );
  if (isERC1155Result.reverted) {
    log.warning("[getNftStandard] isERC1155 reverted on {}", [collectionID]);
  } else {
    if (isERC1155Result.value) {
      return NftStandard.ERC1155;
    }
  }

  return NftStandard.UNKNOWN;
}

// Use best effort to figure out the following data that construct a `Sale`:
// - Who is the buyer and seller?
// - What's the sale volume? (money)
// - What NFTs are involved? (nfts)
// - What fees are allocated? (fees)
//
// This can be tricky because it is either a bid offer or an ask offer :(
function tryGetSale(
  // this `event` param is entirely for logging purpose
  event: ethereum.Event,
  offerer: Address,
  recipient: Address,
  offer: Array<OrderFulfilledOfferStruct>,
  consideration: Array<OrderFulfilledConsiderationStruct>
): Sale | null {
  const txn = event.transaction.hash.toHexString();
  const txnLogIdx = event.transactionLogIndex.toString();

  // if non weth erc20, ignore
  for (let i = 0; i < offer.length; i++) {
    if (
      offer[i].itemType == SeaportItemType.ERC20 &&
      offer[i].token != WETH_ADDRESS
    ) {
      return null;
    }
  }
  for (let i = 0; i < consideration.length; i++) {
    if (
      consideration[i].itemType == SeaportItemType.ERC20 &&
      consideration[i].token != WETH_ADDRESS
    ) {
      return null;
    }
  }

  // offer empty or consideration empty is odd but it happens
  // when a transaction emits more than 1 OrderFulfilled events
  // these events are usually relevant to each other in a way
  // though haven't figured out how to treat them correctly to match etherscan result :(
  if (offer.length == 0) {
    log.warning("[{}-{}] offer empty", [txn, txnLogIdx]);
    return null;
  }
  if (consideration.length == 0) {
    log.warning("[{}-{}] consideration empty", [txn, txnLogIdx]);
    return null;
  }

  // if money is in `offer` then NFTs are must in `consideration`
  const moneyInOffer = offer.length == 1 && isMoney(offer[0].itemType);
  if (moneyInOffer) {
    const considerationNFTsResult = tryGetNFTsFromConsideration(consideration);
    if (!considerationNFTsResult) {
      log.warning(
        "[{}] nft not found or multiple nfts found in consideration: {}",
        [
          txn,
          _DEBUG_join(
            consideration.map<string>((c) => _DEBUG_considerationToString(c))
          ),
        ]
      );
      return null;
    }
    return new Sale(
      offerer,
      recipient,
      considerationNFTsResult,
      getMoneyFromOffer(offer[0]),
      getFees(txn, recipient, consideration)
    );
  } else {
    // otherwise, money is in `consideration` and NFTs are in `offer`
    const considerationMoneyResult =
      tryGetMoneyFromConsideration(consideration);
    if (!considerationMoneyResult) {
      log.warning("[{}] money not found in consideration: {}", [
        txn,
        _DEBUG_considerationToString(consideration[0]),
        _DEBUG_join(
          consideration.map<string>((c) => _DEBUG_considerationToString(c))
        ),
      ]);
      return null;
    }
    const offerNFTsResult = tryGetNFTsFromOffer(offer);
    if (!offerNFTsResult) {
      log.warning("[{}] nft not found or multiple nfts found in offer: {}", [
        txn,
        _DEBUG_join(offer.map<string>((o) => _DEBUG_offerToString(o))),
      ]);
      return null;
    }
    return new Sale(
      recipient,
      offerer,
      offerNFTsResult,
      considerationMoneyResult,
      getFees(txn, offerer, consideration)
    );
  }
}

function getMoneyFromOffer(o: OrderFulfilledOfferStruct): Money {
  return new Money(o.amount);
}

// Add up all money amounts in consideration in order to get the trade volume
function tryGetMoneyFromConsideration(
  consideration: Array<OrderFulfilledConsiderationStruct>
): Money | null {
  let hasMoney = false;
  let amount = BIGINT_ZERO;
  for (let i = 0; i < consideration.length; i++) {
    if (isMoney(consideration[i].itemType)) {
      hasMoney = true;
      amount = amount.plus(consideration[i].amount);
    }
  }
  if (!hasMoney) {
    return null;
  }
  return new Money(amount);
}

function tryGetNFTsFromOffer(
  offer: Array<OrderFulfilledOfferStruct>
): NFTs | null {
  if (offer.some((o) => !isNFT(o.itemType))) {
    return null;
  }
  const collection = offer[0].token;
  const tpe = offer[0].itemType;
  const tokenIds: Array<BigInt> = [];
  const amounts: Array<BigInt> = [];
  for (let i = 0; i < offer.length; i++) {
    const o = offer[i];
    if (o.token != collection) {
      log.warning(
        "[tryGetNFTsFromOffer] we're not handling collection > 1 case",
        []
      );
      return null;
    }
    tokenIds.push(o.identifier);
    amounts.push(o.amount);
  }
  const standard = isERC721(tpe)
    ? NftStandard.ERC721
    : isERC1155(tpe)
    ? NftStandard.ERC1155
    : NftStandard.UNKNOWN;
  return new NFTs(collection, standard, tokenIds, amounts);
}

function tryGetNFTsFromConsideration(
  consideration: Array<OrderFulfilledConsiderationStruct>
): NFTs | null {
  const nftItems = consideration.filter((c) => isNFT(c.itemType));
  if (nftItems.length == 0) {
    return null;
  }
  const collection = nftItems[0].token;
  const tpe = nftItems[0].itemType;
  const tokenIds: Array<BigInt> = [];
  const amounts: Array<BigInt> = [];
  for (let i = 0; i < nftItems.length; i++) {
    const item = nftItems[i];
    if (item.token != collection) {
      log.warning(
        "[tryGetNFTsFromConsideration] we're not handling collection > 1 case",
        []
      );
      return null;
    }
    tokenIds.push(item.identifier);
    amounts.push(item.amount);
  }
  const standard = isERC721(tpe)
    ? NftStandard.ERC721
    : isERC1155(tpe)
    ? NftStandard.ERC1155
    : NftStandard.UNKNOWN;
  return new NFTs(collection, standard, tokenIds, amounts);
}

// `consideration` could contain: royalty transfer, opeasea fee, and sale transfer itself
// known edge cases are:
// - opensea fee not found
function getFees(
  txn: string,
  excludedRecipient: Address,
  consideration: Array<OrderFulfilledConsiderationStruct>
): Fees {
  const protocolFeeItems = consideration.filter((c) =>
    isOpenSeaFeeAccount(c.recipient)
  );
  let protocolRevenue = BIGINT_ZERO;
  if (protocolFeeItems.length == 0) {
    log.warning("[{}] known issue: protocol fee not found, consideration {}", [
      txn,
      _DEBUG_join(
        consideration.map<string>((c) => _DEBUG_considerationToString(c))
      ),
    ]);
  } else {
    protocolRevenue = protocolFeeItems[0].amount;
  }

  const royaltyFeeItems: Array<OrderFulfilledConsiderationStruct> = [];
  for (let i = 0; i < consideration.length; i++) {
    const c = consideration[i];
    if (!isOpenSeaFeeAccount(c.recipient) && c.recipient != excludedRecipient) {
      royaltyFeeItems.push(c);
    }
  }
  const royaltyRevenue =
    royaltyFeeItems.length > 0 ? royaltyFeeItems[0].amount : BIGINT_ZERO;

  return new Fees(protocolRevenue, royaltyRevenue);
}

//
// Useful utilities for finding unhandled edge cases
//

function _DEBUG_offerToString(item: OrderFulfilledOfferStruct): string {
  return `Offer(type=${
    item.itemType
  }, token=${item.token.toHexString()}, id=${item.identifier.toString()}, amount=${item.amount.toString()})`;
}

function _DEBUG_considerationToString(
  item: OrderFulfilledConsiderationStruct
): string {
  return `Consideration(type=${
    item.itemType
  }, token=${item.token.toHexString()}, id=${item.identifier.toString()}, amount=${item.amount.toString()}, recipient=${item.recipient.toHexString()})`;
}

function _DEBUG_join(ss: Array<string>): string {
  let s = "";
  for (let i = 0; i < ss.length; i++) {
    if (i > 0) {
      s += " ";
    }
    s += ss[i];
  }
  return s;
}

export function handleSafeCreate2Call(call: SafeCreate2Call): void {
  if (
    call.from.toHexString().toLowerCase() ==
      "0x939c8d89ebc11fa45e576215e2353673ad0ba18a" &&
    call.inputs.initializationCode
      .toHexString()
      .toLowerCase()
      .indexOf(
        "9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31"
      ) != -1
  ) {
    const poolFactoryAddress = call.outputs.deploymentAddress;
    SeaportContract.create(poolFactoryAddress);
  }
}
