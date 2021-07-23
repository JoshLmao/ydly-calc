import axios from "axios";

import CONFIG from "../config.json";

/// Gets the global contract values from  the 
export function getContractValues(contractId, keys, callback) {
    // Query endpoint with id
    let endpoint = `applications/${contractId}`;
    queryAlgoExplorerAPI("v2", endpoint, (data) => {
        let contractVars = {};
        // Iterate through all application state values
        for(let kvp of data.params["global-state"]) {
            // Iterate through given keys and store in dict if a match
            for (let key of keys) {
                if (kvp.key === btoa(key)) {
                    contractVars[key] = kvp.value.uint
                }
            }
        }
        // Callback if supplied
        if (callback)
            callback(contractVars);
    });
}

// Gets the UserTime and UserAmount values from the 
export function getUserStateValues (algoAddress, contractID, callback) {
    let endpoint = `accounts/${algoAddress}`;
    queryAlgoExplorerAPI("v2", endpoint, (data) => {
        if (data) {
            // Get all app states
            let appStates = data["apps-local-state"];
            if (appStates) {
                for (let appState of appStates) {
                    // Check current app is the app id we want
                    if (appState.id === contractID) {
                        let userValues = {};
                        // Iterate through all states of this app
                        for (let kvp of appState["key-value"]) {
                            // User Time
                            if (kvp.key === btoa("UT")) {   
                                userValues.userTime = kvp.value.uint;
                            }
                            // User Amount
                            else if (kvp.key === btoa("UA")) {  
                                userValues.userAmount = kvp.value.uint;
                            }
                            else if (kvp.key === btoa("USS")) {
                                userValues.userStakingShares = kvp.value.uint;
                            }
                        }
                        // Once successful, use callback
                        if (userValues) {
                            if (callback)
                                callback(userValues);

                            return;
                        }
                    }
                }
            }            
        }

        // No app state or no app state to match contract id
        if (callback)
            callback(null);
    });
}

// Queries the AlgoExplorer API with the given endpoint and uses the response callback if data is found
export function queryAlgoExplorerAPI (endpointPrefix, endpointUrl, response) {
    // Use base URL of API, with the given prefix and url
    let baseUrl = `https://algoexplorerapi.io/${endpointPrefix}/${endpointUrl}`;
    // Send off request
    axios({
        url: `${baseUrl}`,
        method: 'GET',
    }).then(result => {
        if (result && result.data) {
            response(result.data);
        } else {
            console.error(`Problem quering Algoexplorer API at ${endpointUrl}`);
        }
    });
}

// Gets the last block id and timestamp
export function getCurrentBlockTimestamp(callback) {
    let endpoint = "health";
    queryAlgoExplorerAPI("idx2", endpoint, (data) => {
        if (data && data.round) {
            let lastRound = data.round;

            let blockEndpoint = `blocks/${lastRound}?format=json`;
            queryAlgoExplorerAPI("v2", blockEndpoint, (data) => {
                if (data && data.block && data.block.ts) {
                    if (callback) {
                        callback(lastRound, data.block.ts);
                    }
                }
            })
        }
    })
}

// Gets all holders of the YLDY token within the supplied parameters.
// Limit: the amount of results should be limited to
// minAmount: Minimum amount of YLDY in wallet
// Next: Can be null, next-token given from API for next data
export async function getYLDYTokenTopHoldersAsync (limit, minAmount, next) {
    // Build endpoint url with params
    let endpoint = `v2/assets/${CONFIG.yldy_asset_id}/balances?`;
    if (limit && limit > 0) {
        endpoint += `&limit=${limit}`;
    }
    if (minAmount && minAmount > 0) {
        endpoint += `&currency-greater-than=${minAmount}`;
    }
    if (next && next != null) {
        endpoint += `&next=${next}`;
    }

    // Build full api url, await axios call
    let all = `https://algoexplorerapi.io/idx2/${endpoint}`;
    let response = await axios.get(all);
    let data = response.data;

    let allHolders = data.balances;
    // If next-token is supplied, get the next set of data
    if (data["next-token"]) {
        // Append data to allHolders
        return allHolders.concat( 
            await getYLDYTokenTopHoldersAsync(limit, minAmount, data["next-token"])
        );
    } else {
        // No more next, return all holders
        return allHolders;
    }
}

// Gets the current YLDY price from the data provided by Yieldly
export function getYLDYPrice (callback) {
    let priceUrl = `${CONFIG.proxy_url}/http://data.yieldly.finance/price`;
    axios({
        url: priceUrl,
        method: 'GET',
        // headers: {
        //     origin: "https://yldy-estimator.joshlmao.com",
        // }
    }).then((result) => {
        if (result && result.data) {
            if (callback)
                callback(result.data.YLDYPrice);
        }
    })
}

// Gets all transactions from an address.
export async function getAddressTransactionsAsync(address, nextToken) {
    let endpoint = `v2/transactions?address=${address}`;

    if (nextToken) {
        endpoint += `&next=${nextToken}`;
    }

    // Build URL and await request
    let fullUrl = `https://algoexplorerapi.io/idx2/${endpoint}`;
    let result = await axios.get(fullUrl);
    let data = result.data;

    let allTransactions = data.transactions;

    // if next token given
    if (data["next-token"]) {
        // Get next pages of transactions
        let nextTransactions = await getAddressTransactionsAsync(address, data["next-token"]);
        // Merge gathered transactions
        allTransactions.concat(nextTransactions);
        // Reverse and return
        return allTransactions.reverse();
    } else {
        return allTransactions;
    }
}