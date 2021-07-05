import axios from "axios";

/// Gets the global contract values from  the 
export function getContractValues(contractId, callback) {
    let endpoint = `applications/${contractId}`;
    queryAlgoExplorerAPI(endpoint, (data) => {
        let contractVars = {};
        for(let kvp of data.params["global-state"]) {
            // Check for Global Time (GT)
            if (kvp.key === btoa("GT")) {
                contractVars.globalTime = kvp.value.uint;
            }
            // Global Amount (GA) of ALGO deposited
            else if (kvp.key === btoa("GA")) {
                contractVars.globalAmount = kvp.value.uint;
            }
            // Total Yiedly Global Unlock Rewards (TYUL)
            else if (kvp.key == btoa("TYUL")) {
                contractVars.totalYiedlyUnlock = kvp.value.uint;
            }
        }
        if (callback)
            callback(contractVars);
    });
}

// Gets the UserTime and UserAmount values from the 
export function getUserStateValues (algoAddress, contractID, callback) {
    let endpoint = `accounts/${algoAddress}`;
    queryAlgoExplorerAPI(endpoint, (data) => {
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
                                userValues.uss = kvp.value.uint;
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
export function queryAlgoExplorerAPI (endpointUrl, response) {
    let baseUrl = `https://algoexplorerapi.io/v2/${endpointUrl}`;

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