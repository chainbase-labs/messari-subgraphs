import {
    test,
    assert,
    clearStore,
    describe,
    logStore,
    createMockedFunction,
    afterAll,
} from "matchstick-as/assembly/index";
import {createLogAddMarket} from './util'
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import {handleAddMarket} from "../../../src/mapping/margin";

describe("dydx",()=>{
    afterAll(()=>{
        clearStore();
    })

    test("testhandleAddMarket",()=>{
        let marketId = BigInt.fromI32(11);
        let token = "0x165a50bc092f6870dc111c349bae5fc35147ac86";
        let txHash =
            "0x6B42F21CBEF42890F4ED4505148958BA0F2D1D502B026E500B8B29E16B1FD031";
        let txIndex = BigInt.fromI32(29);
        let blockNumber = BigInt.fromI32(7575729);
        let timestamp = BigInt.fromI32(1555374561);
        let event = createLogAddMarket(
            marketId,
            token,
            txHash,
            txIndex,
            blockNumber,
            timestamp
        );
        handleAddMarket(event);
        logStore();

        assert.fieldEquals(
            "market",
            marketId.toString(),
            "token",
            token.toLowerCase()
        );
    })
})
