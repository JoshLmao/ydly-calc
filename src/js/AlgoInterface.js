import { PeraWalletConnect } from "@perawallet/connect"
import algosdk from "algosdk";

export default class AlgoInterface {

    static _peraWallet = new PeraWalletConnect();
    static _algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

    static async Reconnect() {
        const addresses = await this._peraWallet.reconnectSession();
        if (addresses & addresses.length > 0) {
            return addresses[0];
        }
        return null;
    }

    static async Connect() {
        try {
            const accounts = await this._peraWallet.connect();
            return accounts && accounts.length > 0 ? accounts[0] : null;
        }
        catch (e) {
            console.error("MyAlgo Connect error", e);
        }
        return null;
    }

    static async GetSuggestedParams() {
        const params = await this._algodClient.getTransactionParams().do();
        return params;
    }

    static async SignTxns(txns) {
        let userSigned = null;
        txns = txns.map((txn) => {
            return {
                txn: txn
            };
        })
        try {
            userSigned = await this._peraWallet.signTransaction([ txns ]);
        }
        catch (e) {
            console.warn("Sign txn error, user cancelled?", e);
            return null;
        }
        return userSigned;
    }

    static async PublishTxns(signedTxns) {
        try {
            const published = await this._algodClient.sendRawTransaction(signedTxns).do().catch(x => console.error("Error publishing txns", x));
            if (published) {
                return true;
            }
        }
        catch (e) {
            console.error("Error submitting", e);
        }
        return false;
    }
}
