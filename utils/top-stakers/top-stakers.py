import logging
import requests
import json
import base64
from datetime import datetime

# Config python file
import config as config

# all addresses obtained from AlgoExplorer
all_addresses = []
pages = 0

def validate_empty_dict(dict):
    if bool(dict):
        return dict
    else:
        return None

# Compares bytes to see if they match
def compare(a, b, encoding="utf8"):
    if isinstance(a, bytes):
        a = a.decode(encoding)
    if isinstance(b, bytes):
        b = b.decode(encoding)
    return a == b

# Divides the value by 10^6
def from_micro_value(val):
    return val / 1000000

# Gets a value by its 'key' in a state's key-value list
def get_local_state_value(state, key):
    encodedKey = base64.b64encode(key.encode("utf-8"))

    if "key-value" in state:
        for obj in state['key-value']:
            if compare(obj["key"], encodedKey):
                return obj['value']['uint']
    return None

# Gets stake information from an address by getting the UA key on an address' local state
def get_local_state_info(address, appLocalStateMap):
    localStatesData = {}
    # Iterate through total local state, if exists
    if 'apps-local-state' in address:
        for state in address['apps-local-state']:
            # If state app id matches target app id
            if str(state['id']) == appLocalStateMap["appID"]:
                # Get all local state keys for this app id
                for targetKey in appLocalStateMap["local_state_keys"]:
                    value = get_local_state_value(state, targetKey)
                    if value is not None:
                        localStatesData[appLocalStateMap["appID"]] = {}
                        localStatesData[appLocalStateMap["appID"]][targetKey] = value
    
    return validate_empty_dict(localStatesData)

# 
def get_asset_amounts(address, assetIds):
    assetData = {}

    assetData['ALGO'] = address['amount']

    if 'assets' in address:
        for asset in address['assets']:
            for id in assetIds:
                if str(asset['asset-id']) == id:
                    assetData[id] = asset['amount']

    return validate_empty_dict(assetData)

# Performs an API call to algo explorer api to the given endpoint
def call_algoexplorer_api(endpoint):
    baseUrl = config.ALGOEXPLORER_API + config.INDEXER_ENDPOINT
    baseUrl = baseUrl + endpoint
    response = requests.get(baseUrl)
    if response.status_code == 200:
        if response.text is not None:
            return json.loads(response.text)
    return None

# Gets info about a single address. DEBUG
def get_single_address(address):
    endpoint = "v2/accounts/" + address
    response  = call_algoexplorer_api(endpoint)
    return response["account"]

# Gets all addresses that have opted into YLDY asset
def get_all_addresses(assetId, nextToken):
    endpoint = "v2/accounts?asset-id=" + str(assetId)
    if nextToken:
        endpoint += "&next=" + nextToken

    # make api call
    response = call_algoexplorer_api(endpoint)

    if response is not None:
        addr = response['accounts']
        if 'next-token' in response:
            logging.info("Obtained '{length}' addresses from '{endpoint}', getting next...".format(length=len(response['accounts']), endpoint=endpoint))
            nextAddr = get_all_addresses(assetId, response["next-token"])
            return addr + nextAddr
        else:
            return response['accounts']
    return None

if __name__ == '__main__':
    # Setup logging config
    logging.basicConfig(level=logging.INFO, format='%(asctime)s.%(msecs)03d %(levelname)s | %(message)s', datefmt='%d-%m-%Y %H:%M:%S')
    logging.info("Starting...")

    # Get all addresses that have opt'd in to a certain asset
    all_addresses = get_all_addresses(config.opt_in_asset, None)
    
    # DEBUG, Use single address
    # all_addresses = [
    #     get_single_address("")
    # ]

    logging.info("Obtained '" + str(len(all_addresses)) + "' addresses")
    
    logging.info("Parsing local state application data from addresses...")

    allInfo = []
    for addr in all_addresses:

        if addr['address'] == "AAG5TXAOZM5BFTUY7QTSDBGD624WZ7XRLRIOBHQGIWOVILTAAGAS72JKT4":
            logging.info("NOW")

        # Get local state info from asset map
        addressLocalAppStates = []
        for appMap in config.user_app_values:
            stateData = get_local_state_info(addr, appMap)
            if stateData is not None:
                addressLocalAppStates.append(stateData)
        # Check if its empty/set to none if so
        addressLocalAppStates = validate_empty_dict(addressLocalAppStates)

        # Get asset info, how much a wallet holds of that asset
        assetInfo = get_asset_amounts(addr, config.user_assets)

        # Check that stake info has data, ignore address if none
        if addressLocalAppStates is not None:
            # Build single json object for one address
            jsonData = {}
            jsonData['address'] = addr['address']

            # Insert local app state data
            if addressLocalAppStates is not None:
                jsonData['stateData'] = validate_empty_dict(addressLocalAppStates)
            # Insert assets of wallet
            if assetInfo is not None:
                jsonData['assets'] = validate_empty_dict(assetInfo)
            
            allInfo.append(jsonData)

    logging.info("Finished parsing. Saving to file...")

    dateTime = datetime.now()
    dateTime = dateTime.replace(microsecond=0)

    finalJSON = {}
    finalJSON['snapshotEpoch'] = dateTime.timestamp()
    finalJSON['snapshotData'] = allInfo
    
    dataStr = json.dumps(finalJSON)
    dateTimeStr = str(dateTime.date()) + "_" + str(dateTime.time()).replace(":", "-")
    fullFileName = config.SAVE_FOLDER + config.SAVE_FILENAME_PREFIX + "_" + dateTimeStr + ".json"
    file = open(fullFileName, "w")
    file.write(dataStr)
    file.close()

    logging.info("Completed | Saved '{addressCount}' addresses with staking data to file '{file}'".format(addressCount=str(len(all_addresses)), file=fullFileName))