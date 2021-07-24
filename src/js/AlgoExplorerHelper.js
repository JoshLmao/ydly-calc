/*
*   Utility functions for interacting with the AlgoExplorerAPI
*/

import { constants } from "./consts";

export const YIELDLY_APP_ID_KEY = "yieldly-app-id";

// Filters out irrelevant transactions and returns only the transactions where
// the address made a claim through Yieldly
export function filterClaimTransactions(allTransactions, userAddress, appAddress) {
    if (!allTransactions) {
        return null;
    }

    let claimTransactions = [];

    // Iterate through all claim transactions
    for (let transaction of allTransactions) {
        if (transaction.sender !== appAddress) {
            continue;
        }

        let isASA = isASATransaction(transaction);
        let isALGO = isALGOTransaction(transaction);

        // If is a ASA transaction (Transferred YLDY)
        if (isASA) {
            // Check group transactions for Yieldly application id's
            let transactionAppIDTarget = -1;
            if (transaction.group) {
                transactionAppIDTarget = doesTransactionGroupModifyState(transaction, userAddress, allTransactions);
            }

            // Check appID is either NLL or YLDY staking, add to relevant data array
            // YLDY from NLL or YLDY Staking
            if (transactionAppIDTarget === constants.YLDY_STAKING_APP_ID || transactionAppIDTarget === constants.NO_LOSS_LOTTERY_APP_ID) {
                // Insert target application id as a new key of transaction
                transaction[YIELDLY_APP_ID_KEY] = transactionAppIDTarget;
                claimTransactions.push(transaction);
            }
        }
        // If is an algo transaction, add to algo data
        else if (isALGO) {
            let transactionAppIDTarget = -1;

            // Check group transactions for Yieldly application id's
            if (transaction.group) {
                transactionAppIDTarget = doesTransactionGroupModifyState(transaction, userAddress, allTransactions);
            }

            // ALGO from YLDY Staking
            if (transactionAppIDTarget === constants.YLDY_STAKING_APP_ID) {
                // Insert target application id as a new key of transaction
                transaction[YIELDLY_APP_ID_KEY] = transactionAppIDTarget;
                claimTransactions.push(transaction);
            }
        }
    }

    return claimTransactions;
}

// Checks if the given transaction modifies a local state and contains the 
// given target key on the target address.
// Returns true/false if local state is modified with targetKey & targetAddress
export function stateContainsKey(transaction, targetKey, targetAddress) {
    let localStateModify = transaction["local-state-delta"];
    if (localStateModify) {
        for (let modifyState of localStateModify) {
            if (modifyState.address === targetAddress) {
                // Iterate through modified keys, looking for UA
                for (let kvp of modifyState.delta) {
                    if (kvp.key === targetKey) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// Finds if given transaction has a group of transactions, and if the group modifies
// a local state and sets the local state key "UA". 
// Returns the related application id of the local state modified. Can be < 0 for invalid
export function doesTransactionGroupModifyState(transaction, userAddress, allTransactions) {
    let transactionAppIDTarget = -1;
    for(let trans of allTransactions) {
        if (trans.group === transaction.group && trans["application-transaction"]) {
            // Check if this transaction is to modify user amount local state
            // Modify UA local state means user withdrew YLDY from contract so exclude transaction
            let contains = stateContainsKey(trans, btoa("UA"), userAddress);
            if (contains) {
                break;
            }

            // Retrieve app id from transaction, return it if related on contracts
            let appID = trans["application-transaction"]["application-id"];
            if (appID === constants.NO_LOSS_LOTTERY_APP_ID || appID === constants.YLDY_STAKING_APP_ID) {
                transactionAppIDTarget = appID;
                break;
            }
        }
    }
    return transactionAppIDTarget;
}

// Iterates through allTxs and gets any other txs with the same group id
// Returns array of all grouped txs
export function getGroupedTransactions (allTxs, groupID) {
    if (!allTxs || !groupID) {
        return null;
    }

    let txGroup = [];
    for (let tx of allTxs) {
        if (tx.group === groupID) {
            txGroup.push(tx);
        }
    }
    return txGroup;
}

export function isASATransaction (transaction) {
    return transaction["asset-transfer-transaction"] != null;
}

export function isALGOTransaction (transaction) {
    return transaction["payment-transaction"] != null;
}

// Filters out transactions that deposited ALGO or YLDY into the 
// NLL/YLDY Staking apps and returns them
export function filterStakeTransactions(allTransactions, userAddress) {
    if (!allTransactions) {
        return null;
    }

    // All txs when deposited in NLL or YLDY staking
    let stakeTxs = [];

    // Gets the related group txs, checks if UA is modified, then returns app id that modified UA
    let getGroupModifyUATargetAppId = function (allTxs, groupID, usrAddr) {
        if (groupID) {
            let groupTxs = getGroupedTransactions(allTxs, groupID);
            for (let groupTx of groupTxs) {
                let containsUA = stateContainsKey(groupTx, btoa("UA"), usrAddr);
                if (containsUA) {
                    return groupTx["application-transaction"]["application-id"];
                }
            }
        }
        return -1;
    }

    for (let tx of allTransactions) {
        // Ignore any tx not send by user
        if (tx.sender !== userAddress) {
            continue;
        }

        let isASA = isASATransaction(tx);
        let isALGO = isALGOTransaction(tx);

        if (isASA) {
            let transactionAppIDTarget = getGroupModifyUATargetAppId(allTransactions, tx.group, userAddress);

            // appID target should be YLDY Staking. Deposit YLDY into YLDY Staking
            if (transactionAppIDTarget === constants.YLDY_STAKING_APP_ID) {
                // Insert target application id as a new key of transaction
                tx[YIELDLY_APP_ID_KEY] = transactionAppIDTarget;
                stakeTxs.push(tx);
            }
        }
        else if (isALGO) {
            let transactionAppIDTarget = getGroupModifyUATargetAppId(allTransactions, tx.group, userAddress);

            // Check app id target is NLL app. Deposit ALGO into NLL
            if (transactionAppIDTarget === constants.NO_LOSS_LOTTERY_APP_ID) {
                // Insert target application id as a new key of transaction
                tx[YIELDLY_APP_ID_KEY] = transactionAppIDTarget;
                stakeTxs.push(tx);
            }
        }
    }

    return stakeTxs;
}