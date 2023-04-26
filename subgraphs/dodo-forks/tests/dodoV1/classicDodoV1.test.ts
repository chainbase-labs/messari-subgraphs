import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createBuyBaseTokenEvent,
  createDepositEvent,
  createFunctionBase,
  createNewDodo,
  createNewDodoCall,
  createSellBaseTokenEvent,
  createUpdateLiquidityProviderFeeRateEvent,
  createWithdrawEvent,
} from "./util";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  handleAddDODO,
  handleBuyBaseToken,
  handleDeposit,
  handleDODOBirth,
  handleSellBaseToken,
  handleUpdateLiquidityProviderFeeRate,
  handleWithdraw,
} from "../../protocols/dodo-v1/src/mappings/classicPoolFromV1";
import {
  CLASSIC_FACTORY_ADDRESS,
  STABLE_TWO_ADDRESS,
  WRAPPED_BASE_COIN,
} from "../../src/common/constant";
import { LiquidityPool, Token } from "../../generated/schema";

describe("handleDodo-v1", () => {
  beforeAll(() => {
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
  });

  afterAll(() => {
    clearStore();
  });

  test(
    "handleDodoBirth",
    () => {
      let address = "0x3a97247df274a17c59a3bd12735ea3fcdfb49950";
      let newBornAddress = "0xd4a36b0acfe2931cf922ea3d91063ddfe4aff01f";
      let txHash =
        "0x07c9963ef979e526bee008cd0aaa9f08b6a58aea3a5a3bd128a63e8744a24210";
      let baseToken = "0x57ab1ec28d129707052df4df418d58a2d46d5f51";
      let quoteToken = "0xdac17f958d2ee523a2206206994597c13d831ec7";
      let event = createNewDodo(
        address,
        newBornAddress,
        baseToken,
        quoteToken,
        txHash,
        BigInt.fromI32(11),
        BigInt.fromI32(12197699),
        BigInt.fromI32(15555)
      );

      let baseCapitalToken =
        "0x17f784741CB0A71F0F5AC12b5259e1eec32a7D8F".toLowerCase();
      let quoteCapitalToken =
        "0xE6735fd5D46307d404047aFe6E9C6661c717A577".toLowerCase();

      createMockedFunction(
        Address.fromString(newBornAddress),
        "_BASE_CAPITAL_TOKEN_",
        "_BASE_CAPITAL_TOKEN_():(address)"
      ).returns([
        ethereum.Value.fromAddress(Address.fromString(baseCapitalToken)),
      ]);
      createMockedFunction(
        Address.fromString(newBornAddress),
        "_QUOTE_CAPITAL_TOKEN_",
        "_QUOTE_CAPITAL_TOKEN_():(address)"
      ).returns([
        ethereum.Value.fromAddress(Address.fromString(quoteCapitalToken)),
      ]);
      createMockedFunction(
        Address.fromString(newBornAddress),
        "_LP_FEE_RATE_",
        "_LP_FEE_RATE_():(uint256)"
      ).returns([
        ethereum.Value.fromSignedBigInt(BigInt.fromString("100000000000000")),
      ]);
      createFunctionBase(baseToken, "sUSD", "Synth sUSD", 18, "0");
      createFunctionBase(
        baseCapitalToken,
        "DLP",
        "Synth sUSD_DODO_LP_TOKEN_",
        18,
        "0"
      );
      createFunctionBase(
        quoteCapitalToken,
        "DLP",
        "Tether USD_DODO_LP_TOKEN_",
        6,
        "0"
      );

      handleDODOBirth(event);

      assert.fieldEquals(
        "DexAmmProtocol",
        CLASSIC_FACTORY_ADDRESS,
        "totalPoolCount",
        "14"
      );
      assert.fieldEquals(
        "LiquidityPool",
        newBornAddress,
        "inputTokenWeights",
        "[1000000000000000000, 1000000000000000000]"
      );
      assert.fieldEquals(
        "LiquidityPool",
        newBornAddress,
        "inputTokenBalances",
        "[0, 0]"
      );

      assert.entityCount("LiquidityPool", 14);
      let pool = LiquidityPool.load(newBornAddress) as LiquidityPool;
      assert.assertNull(pool._creator);
      assert.stringEquals(pool.inputTokens[0], baseToken);
      assert.stringEquals(pool.inputTokens[1], quoteToken);
      assert.stringEquals(pool._baseLpToken!, baseCapitalToken);
      assert.stringEquals(pool._quoteLpToken!, quoteCapitalToken);

      let token = Token.load(baseToken) as Token;
      assert.assertNull(token._pool);
      assert.fieldEquals("Token", baseCapitalToken, "_pool", newBornAddress);
    },
    false
  );

  test("handleAddDODOCall", () => {
    let address = "0x3a97247df274a17c59a3bd12735ea3fcdfb49950";
    let dodoAddress = "0x85f9569b69083c3e6aeffd301bb2c65606b5d575";
    let txHash =
      "0xa9499960192a31065dd7229d017b7763adbf940232b41b122665ad625d1768ee";

    let baseToken = "0xa0afAA285Ce85974c3C881256cB7F225e3A1178a".toLowerCase();
    let quoteToken = "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase();
    let baseCapitalToken =
      "0xCFBA2e0F1BBF6aD96960D8866316b02e36ed1761".toLowerCase();
    let quoteCapitalToken =
      "0xe236b57de7F3e9c3921391C4CB9A42d9632c0022".toLowerCase();
    let call = createNewDodoCall(
      address,
      dodoAddress,
      txHash,
      BigInt.fromI32(11),
      BigInt.fromI32(11359294),
      BigInt.fromI32(15555)
    );
    handleAddDODO(call);
    assert.fieldEquals(
      "DexAmmProtocol",
      CLASSIC_FACTORY_ADDRESS,
      "totalPoolCount",
      "14"
    );
    assert.fieldEquals(
      "LiquidityPool",
      dodoAddress,
      "inputTokenWeights",
      "[1000000000000000000, 1000000000000000000]"
    );
    assert.fieldEquals(
      "LiquidityPool",
      dodoAddress,
      "inputTokenBalances",
      "[0, 0]"
    );
    assert.fieldEquals(
      "LiquidityPool",
      dodoAddress,
      "_creator",
      "0x9c59990ec0177d87ED7D60A56F584E6b06C639a2".toLowerCase()
    );

    assert.entityCount("LiquidityPool", 14);
    let pool = LiquidityPool.load(dodoAddress) as LiquidityPool;
    assert.stringEquals(pool.inputTokens[0], baseToken);
    assert.stringEquals(pool.inputTokens[1], quoteToken);
    assert.stringEquals(pool._baseLpToken!, baseCapitalToken);
    assert.stringEquals(pool._quoteLpToken!, quoteCapitalToken);

    let token = Token.load(baseToken) as Token;
    assert.assertNull(token._pool);
    assert.fieldEquals("Token", baseCapitalToken, "_pool", dodoAddress);
  });

  test("handleDeposit", () => {
    let address = "0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650";
    let payer = "0xd35dc42c3812ace3d313f8303114b731d428a0fa";
    let receiver = "0xd35dc42c3812ace3d313f8303114b731d428a0fa";
    let txHash =
      "0x1d0e36595742349b86530e701c8394dfe58bedf0dbf03fb88c7ea1dae90749a8";
    let amount = "1956000000000000000000";
    let lpTokenAmount = "1955981759276386587267";
    let isBaseToken = true;
    let logIndex = "218";

    let baseToken = "0x514910771af9ca656af840dff83e8264ecf986ca".toLowerCase();
    let baseTokenBalance = "180161444746161361272";
    let quoteToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();
    let quoteTokenBalance = "857012621";
    let baseCapitalToken =
      "0xF03F3d2FbeE37F92eC91aE927a8019CACef4b738".toLowerCase();
    let quoteCapitalToken =
      "0x0F769BC3EcbdA8e0d78280c88e31609E899A1F78".toLowerCase();
    let event = createDepositEvent(
      address,
      payer,
      receiver,
      isBaseToken,
      amount,
      lpTokenAmount,
      txHash,
      BigInt.fromString(logIndex),
      BigInt.fromString("10726572"),
      BigInt.fromString("15555")
    );
    createMockedFunction(
      Address.fromString(baseToken),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([
        ethereum.Value.fromSignedBigInt(BigInt.fromString(baseTokenBalance)),
      ]);
    createMockedFunction(
      Address.fromString(quoteToken),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([
        ethereum.Value.fromSignedBigInt(BigInt.fromString(quoteTokenBalance)),
      ]);
    handleDeposit(event);
    assert.entityCount("Deposit", 1);
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "inputTokens",
      "[" + baseToken + ", " + quoteToken + "]"
    );
    assert.fieldEquals("Deposit", txHash + "-" + logIndex, "to", receiver);
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "outputToken",
      baseCapitalToken
    );
    assert.fieldEquals("Deposit", txHash + "-" + logIndex, "amountUSD", "0");
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "inputTokenAmounts",
      "[" + amount + ", 0]"
    );
    assert.fieldEquals(
      "Deposit",
      txHash + "-" + logIndex,
      "outputTokenAmount",
      lpTokenAmount
    );

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + baseTokenBalance + ", " + quoteTokenBalance + "]"
    );
    assert.fieldEquals(
      "Token",
      baseToken,
      "_totalSupply",
      "1000001956000000000000000000"
    );
    assert.fieldEquals(
      "Token",
      baseCapitalToken,
      "_totalSupply",
      lpTokenAmount
    );
    assert.fieldEquals("Token", quoteCapitalToken, "_totalSupply", "0");
  });

  test("handleWithdraw", () => {
    let address = "0x75c23271661d9d143dcb617222bc4bec783eff34";
    let payer = "0xaaa2ef3e6d7ecb10678e9c8688bd79ab9118e3c6";
    let receiver = "0xaaa2ef3e6d7ecb10678e9c8688bd79ab9118e3c6";
    let txHash =
      "0x987a23ffe309e070b040dfaf1b150a93e84df736d21490f5d0c6a34ec31da2c6";
    let amount = "10012884020";
    let lpTokenAmount = "9951180079";
    let isBaseToken = false;
    let logIndex = "54";

    let baseToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase();
    let baseTokenBalance = "180161444746161361272";
    let quoteToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();
    let quoteTokenBalance = "857012621";
    let baseCapitalToken =
      "0xc11eCCDee225d644f873776A68A02eCD8c015697".toLowerCase();
    let quoteCapitalToken =
      "0x6a5Eb3555cBbD29016Ba6F6fFbCcEE28D57b2932".toLowerCase();
    let event = createWithdrawEvent(
      address,
      payer,
      receiver,
      isBaseToken,
      amount,
      lpTokenAmount,
      txHash,
      BigInt.fromString(logIndex),
      BigInt.fromString("10709888"),
      BigInt.fromString("15555")
    );
    createMockedFunction(
      Address.fromString(baseToken),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([
        ethereum.Value.fromSignedBigInt(BigInt.fromString(baseTokenBalance)),
      ]);
    createMockedFunction(
      Address.fromString(quoteToken),
      "balanceOf",
      "balanceOf(address):(uint256)"
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(address))])
      .returns([
        ethereum.Value.fromSignedBigInt(BigInt.fromString(quoteTokenBalance)),
      ]);
    handleWithdraw(event);
    assert.entityCount("Withdraw", 1);
    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "inputTokens",
      "[" + baseToken + ", " + quoteToken + "]"
    );
    assert.fieldEquals("Withdraw", txHash + "-" + logIndex, "to", receiver);
    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "outputToken",
      quoteCapitalToken
    );
    assert.fieldEquals("Withdraw", txHash + "-" + logIndex, "amountUSD", "0");

    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "inputTokenAmounts",
      "[0, " + amount + "]"
    );

    assert.fieldEquals(
      "Withdraw",
      txHash + "-" + logIndex,
      "outputTokenAmount",
      lpTokenAmount
    );

    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + baseTokenBalance + ", " + quoteTokenBalance + "]"
    );
    assert.fieldEquals(
      "Token",
      baseToken,
      "_totalSupply",
      "3855761620390936910524136"
    );
    assert.fieldEquals(
      "Token",
      quoteToken,
      "_totalSupply",
      BigInt.fromString("30788496417169550")
        .minus(BigInt.fromString(amount))
        .toString()
    );

    assert.fieldEquals("Token", baseCapitalToken, "_totalSupply", "0");
    assert.fieldEquals(
      "Token",
      quoteCapitalToken,
      "_totalSupply",
      "-" + lpTokenAmount
    );
  });

  test("handleSellBaseToken", () => {
    let address = "0xc9f93163c99695c6526b799ebca2207fdf7d61ad";
    let seller = "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0";
    let payBase = "93035548157";
    let txHash =
      "0x6d46dfd72f10e87d73eac483572b389fb1bd2e7c6f74d893e0fce6d14b744e80";
    let receiveQuote = "93024335291";
    let logIndex = "55";

    let baseToken = "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase();
    let quoteToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();

    let event = createSellBaseTokenEvent(
      address,
      seller,
      payBase,
      receiveQuote,
      txHash,
      BigInt.fromString(logIndex),
      BigInt.fromString("10709888"),
      BigInt.fromString("15555")
    );
    handleSellBaseToken(event);
    assert.entityCount("Swap", 1);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenIn",
      baseToken
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenOut",
      quoteToken
    );
    assert.fieldEquals("Swap", "swap-" + txHash + "-" + logIndex, "to", seller);

    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountIn",
      payBase
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountOut",
      receiveQuote
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "pool",
      address
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeBase",
      "0"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeQuote",
      "279073005.873"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_baseVolume",
      payBase
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_quoteVolume",
      receiveQuote
    );

    assert.fieldEquals("LiquidityPool", address, "_txCount", "1");
    assert.fieldEquals("LiquidityPool", address, "_volumeBaseToken", payBase);
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "_volumeQuoteToken",
      receiveQuote
    );
    assert.fieldEquals("LiquidityPool", address, "_feeBase", "0");
    assert.fieldEquals("LiquidityPool", address, "_feeQuote", "279073005.873");
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" + payBase + ", -" + receiveQuote + "]"
    );
  });

  test("handleBuyBaseToken", () => {
    let address = "0xc9f93163c99695c6526b799ebca2207fdf7d61ad";
    let buyer = "0x7122db0ebe4eb9b434a9f2ffe6760bc03bfbd0e0";
    let payQuote = "93035548157";
    let txHash =
      "0x6d46dfd72f10e87d73eac483572b389fb1bd2e7c6f74d893e0fce6d14b744e80";
    let receiveBase = "93024335291";
    let logIndex = "54";

    let baseToken = "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase();
    let quoteToken = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase();

    let event = createBuyBaseTokenEvent(
      address,
      buyer,
      payQuote,
      receiveBase,
      txHash,
      BigInt.fromString(logIndex),
      BigInt.fromString("16593891"),
      BigInt.fromString("15555")
    );
    handleBuyBaseToken(event);
    assert.entityCount("Swap", 2);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenIn",
      quoteToken
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "tokenOut",
      baseToken
    );
    assert.fieldEquals("Swap", "swap-" + txHash + "-" + logIndex, "to", buyer);
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountIn",
      payQuote
    );

    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "amountOut",
      receiveBase
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "pool",
      address
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeBase",
      "279073005.873"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_feeQuote",
      "0"
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_baseVolume",
      receiveBase
    );
    assert.fieldEquals(
      "Swap",
      "swap-" + txHash + "-" + logIndex,
      "_quoteVolume",
      payQuote
    );

    assert.fieldEquals("LiquidityPool", address, "_txCount", "2");
    assert.fieldEquals("LiquidityPool", address, "_feeBase", "279073005.873");
    assert.fieldEquals("LiquidityPool", address, "_feeQuote", "279073005.873");
    assert.fieldEquals(
      "LiquidityPool",
      address,
      "inputTokenBalances",
      "[" +
        BigInt.fromString(payQuote)
          .minus(BigInt.fromString(receiveBase))
          .toString() +
        ", " +
        BigInt.fromString(payQuote)
          .minus(BigInt.fromString(receiveBase))
          .toString() +
        "]"
    );
  });

  test("handleUpdateLiquidityProviderFee", () => {
    let address = "0x75c23271661d9d143dcb617222bc4bec783eff34";
    let oldfee = "4000000000000000";
    let newfee = "5000000000000000";

    let event = createUpdateLiquidityProviderFeeRateEvent(
      address,
      oldfee,
      newfee
    );
    handleUpdateLiquidityProviderFeeRate(event);

    assert.fieldEquals("LiquidityPool", address, "_lpFeeRate", newfee);
  });
});
