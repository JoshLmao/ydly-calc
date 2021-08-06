import logging
import requests
import json
import base64
from datetime import datetime

# Config python file
import config as config

# all addresses obtained from AlgoExplorer
all_addresses = []

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
def get_stake_info(address, appIds):
    stakeData = {}

    # Iterate through total local state, if exists
    if 'apps-local-state' in address:
        for state in address['apps-local-state']:
            # Iterate over target app ids
            for targetAppId in appIds:
                # If state app id matches target app id
                if state['id'] == targetAppId:
                    # Get UA key and store in data object
                    stakeData[targetAppId] = get_local_state_value(state, "UA")
    
    return validate_empty_dict(stakeData)

# 
def get_asset_amounts(address, assetIds):
    assetData = {}

    assetData['ALGO'] = address['amount']

    if 'assets' in address:
        for asset in address['assets']:
            for id in assetIds:
                if asset['asset-id'] == id:
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
            nextAddr = get_all_addresses(assetId, response["next-token"])
            return addr + nextAddr
        else:
            return response['accounts']
    return None

if __name__ == '__main__':
    # Setup logging config
    logging.basicConfig(level=logging.INFO, format='%(asctime)s.%(msecs)03d %(levelname)s | %(message)s', datefmt='%d-%m-%Y %H:%M:%S')
    logging.info("Starting...")

    all_addresses = get_all_addresses(config.YLDY_ASSET_ID, None)
    logging.info("Obtained '" + str(len(all_addresses)) + "' addresses")
    logging.info("Parsing staking info...")

    allInfo = []
    for addr in all_addresses:
        # Get local state info
        allAppIds =  [ config.NLL_APP_ID, config.YLDY_STAKING_APP_ID ]
        stakeInfo = get_stake_info(addr, allAppIds)

        # Get asset info, including ALGO
        allAssetIds = [ config.YLDY_ASSET_ID ]
        assetInfo = get_asset_amounts(addr, allAssetIds)

        # Check that stake info has data, ignore address if none
        if stakeInfo is not None:
            # Build single json object for one address
            jsonData = {}
            jsonData['address'] = addr['address']

            stateData = {}
            for id in allAppIds:
                if id in stakeInfo:
                    stateData[str(id)] = stakeInfo[id]

            assetData = {}
            assetData['ALGO'] = assetInfo['ALGO']
            for id in allAssetIds:
                if id in assetInfo:
                    assetData[str(id)] = assetInfo[id]
            
            assetData = validate_empty_dict(assetData)
            stateData = validate_empty_dict(stateData)

            if assetData is not None:
                jsonData['assets'] = validate_empty_dict(assetData)
            if stateData is not None:
                jsonData['stateData'] = validate_empty_dict(stateData)
            
            allInfo.append(jsonData)

    logging.info("Finished parsing stake info. Saving...")

    dateTime = datetime.utcnow()
    dateTime = dateTime.replace(microsecond=0)

    finalJSON = {}
    finalJSON['yieldlyData'] = allInfo
    finalJSON['snapshotEpoch'] = dateTime.timestamp()

    dataStr = json.dumps(finalJSON)
    dateTimeStr = str(dateTime.date()) + "_" + str(dateTime.time()).replace(":", "-")
    fullFileName = config.SAVE_FOLDER + config.SAVE_FILENAME_PREFIX + "_" + dateTimeStr + ".json"
    file = open(fullFileName, "w")
    file.write(dataStr)
    file.close()

    logging.info("Completed | Saved '{addressCount}' addresses with staking data to file '{file}'".format(addressCount=str(len(all_addresses)), file=fullFileName))