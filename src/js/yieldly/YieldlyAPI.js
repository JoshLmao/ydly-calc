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

    // Makes a group of txns to stake YLDY into the YLDY/YLDY contract
    static MakeYldyStakeTxns(userAddress, suggestedParams, yldyStakeAmount) {
        // Call proxy txn
        const callProxyTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.PROXY_APP_ID,
            [new Uint8Array(Buffer.from("check"))],
        );

        // Call staking
        const callStakingTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.YLDY_STAKING_APP_ID,
            [new Uint8Array(Buffer.from("S"))],
            [ constants.YLDY_ESCROW_ADDR ],
        );

        // YLDY from user to Escrow
        const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            userAddress,
            constants.YLDY_ESCROW_ADDR,
            undefined,
            undefined,
            yldyStakeAmount,
            undefined,
            constants.YLDY_ASSET_ID,
            suggestedParams,
        );

        return algosdk.assignGroupID([callProxyTxn, callStakingTxn, transferTxn]);
    }

    // Makes group of txns to make a Yldy/Yldy contract unstake txn
    static MakeYldyUnstakeTxn(userAddress, suggestedParams, yldyAmount) {
        // proxy contract
        const callProxyTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.PROXY_APP_ID,
            [new Uint8Array(Buffer.from("check"))],
        );

        // Withdraw algos from NLL contract
        const callStakingTxn = algosdk.makeApplicationNoOpTxn(
            userAddress,
            suggestedParams,
            constants.YLDY_STAKING_APP_ID,
            [new Uint8Array(Buffer.from("W"))],
            [constants.YLDY_ESCROW_ADDR],
        );

        // YLDY from escrow to user
        const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            constants.YLDY_ESCROW_ADDR,
            userAddress,
            undefined,
            undefined,
            yldyAmount,
            undefined,
            constants.YLDY_ASSET_ID,
            suggestedParams,
        );

        // Pay for withdraw txn fee
        const payFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(
            userAddress,
            constants.YLDY_ESCROW_ADDR,
            1000,
            undefined,
            undefined,
            suggestedParams,
        );

        return algosdk.assignGroupID([callProxyTxn, callStakingTxn, transferTxn, payFeeTxn]);
    }

    // Creates the LogicSig Account for the NLL escrow
    static GetLogicSigAccount() {
        const program = new Uint8Array(Buffer.from(constants.ESCROW_PROGRAM_STR, "base64"));
        return new algosdk.LogicSigAccount(program);
    }

}