import algosdk from "algosdk";
import { constants } from "../consts";

export default class YieldlyAPI {

    // Make opt in txn for No loss lottery
    static MakeOptInNll(userAddress, suggestedParams) {
        return algosdk.makeApplicationOptInTxnFromObject({
            from: userAddress,
            appIndex: constants.NO_LOSS_LOTTERY_APP_ID,
            suggestedParams: suggestedParams,
        });
    }

    static MakeOptInYldyYldy(userAddress, suggestedParams) {
        return algosdk.makeApplicationOptInTxnFromObject({
            from: userAddress,
            appIndex: constants.YLDY_STAKING_APP_ID,
            suggestedParams: suggestedParams,
        });
    }

    static MakeYldyStakeTxns(userAddress, suggestedParams, yldyStakeAmount) {
        const callProxyTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.PROXY_APP_ID,
            [new Uint8Array(Buffer.from("check"))],
        );

        const callStakingTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.YLDY_STAKING_APP_ID,
            [new Uint8Array(Buffer.from("S"))],
            [constants.YLDY_ESCROW_ADDR],
        );

        const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            constants.YLDY_ESCROW_ADDR,
            userAddress,
            undefined,
            undefined,
            yldyStakeAmount,
            undefined,
            constants.YLDY_ASSET_ID,
            suggestedParams
        );

        const payFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(
            userAddress,
            constants.YLDY_ESCROW_ADDR,
            1000,
            undefined,
            undefined,
            suggestedParams
        );

        return algosdk.assignGroupID([callProxyTxn, callStakingTxn, transferTxn, payFeeTxn]);
    }

    // Makes group of txns to make a Yldy/Yldy contract unstake txn
    static MakeYldyUnstakeTxn(userAddress, suggestedParams, yldyAmount) {
        const callProxyTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.PROXY_APP_ID,
            [new Uint8Array(Buffer.from("check"))],
        );

        const callStakingTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.YLDY_STAKING_APP_ID,
            [new Uint8Array(Buffer.from("W"))],
            [constants.YLDY_ESCROW_ADDR],
        );

        const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            constants.YLDY_ESCROW_ADDR,
            userAddress,
            undefined,
            undefined,
            yldyAmount,
            undefined,
            constants.YLDY_ASSET_ID,
            suggestedParams
        );

        const payFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(
            userAddress,
            constants.YLDY_ESCROW_ADDR,
            1000,
            undefined,
            undefined,
            suggestedParams
        );

        return algosdk.assignGroupID([callProxyTxn, callStakingTxn, transferTxn, payFeeTxn]);
    }

}