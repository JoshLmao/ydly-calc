'''
Yieldly App State Fetcher
Author: JoshLmao
License: MIT
Project: github.com/JoshLmao/ydly-calc
--
Infinitly running script aimed at retrieving the relevant global state values
of the given application id's from the AlgoExplorer Web API and save them to a given
Firebase Realtime Database. Runs once and then sleeps for the given amount of hours before running again
Edit the configuration variables below the import statements before running.
'''

import time
import requests
import json
import base64
import pyrebase
import logging

## CONFIG START
# Amount of hours to sleep before updating
SLEEP_HOURS = 6

# NLL application id
nllApplicationID = 233725844
# YLDY Staking ID
yldyStakingApplicationID = 233725850

# Dictionary of all application id's and their global state keys
# to retrieve every X hours
APP_ID_STATE_KEYS_DICT = {
    ## No Loss Lottery (NLL) Global State keys to track
    # GSS: Global Staking Shares
    # GA: Global Amount (Amount of ALGO staked in NLL)
    # TYUL: Total YLDY Global Rewards (Amount of YLDY in reward pool now)
    nllApplicationID: [ 
        "TYUL", "GA", "GSS" 
    ],
    ## YLDY Staking global state keys to track
    # TYUL: Total YLDY Global Rewards
    # TAP: Total Algo global rewards
    # GA: Global Amount
    yldyStakingApplicationID: [
        "TYUL", "TAP", "GA", "GSS"
    ]
}

# Pyrebase config
PYREBASE_CONFIG = {
    "apiKey": "", 
    "authDomain": "",
    "databaseURL": "",
    "storageBucket": "",
}

## END CONFIG

# Global, last epoch time the backup has run
LastBackupEpochTime = -1

# Gets the amount of milliseconds since 1970, 1, 1
def get_epoch_time():
    return int(time.time() * 1000)

# Saves the given values into the Firebase database
def save_to_firebase(appID, values):
    # Init firebase and get DB
    firebase = pyrebase.initialize_app(PYREBASE_CONFIG)
    db = firebase.database()

    for key in values:
        db.child(appID).child(LastBackupEpochTime).child(key).set(values[key])

# Compares bytes to see if they match
def compare(a, b, encoding="utf8"):
    if isinstance(a, bytes):
        a = a.decode(encoding)
    if isinstance(b, bytes):
        b = b.decode(encoding)
    return a == b

# Makes an API request to Algo Explorer to the given endpoint
def algo_api_request(endpoint):
    base = "https://algoexplorerapi.io/"
    response = requests.get(base + endpoint)
    if response.status_code == 200:
        if response.text is not None:
            return json.loads(response.text)

    # Log error and return
    logging.error("Unable to get text from endpoint " + endpoint)

# Gets the given appStateKeys from the given app id's global state by
# making API request to AlgoExplorer to retrieve the values
def get_application_vals(applicationID, appStateKeys):
    endpoint = "v2/applications/" + str(applicationID) + "?"
    data = algo_api_request(endpoint)
    if data is not None:
        applicationValues = { }
        # Iterate through global state to parse values
        for val in data["params"]["global-state"]:
            for targetKey in appStateKeys:
                # Encode key as base64
                encoded = base64.b64encode(targetKey.encode("utf-8"))
                # Compare from API with encded
                if compare(val["key"], encoded):
                    # Add to dictionary if the same key
                    applicationValues[targetKey] = val["value"]["uint"]
        return applicationValues
    else:
        logging.error("Error: No data at application id", applicationID)
        
if __name__ == '__main__':
    # Setup logging config
    logging.basicConfig(level=logging.INFO, format='%(asctime)s.%(msecs)03d %(levelname)s | %(message)s', datefmt='%d-%m-%Y %H:%M:%S')

    logging.info("Starting YLDY Firebase fetching program")

    # Start constant loop
    while True:
        # Get new epoch time on new start
        LastBackupEpochTime = get_epoch_time()

        # Loop over Dictionary with key value pairs
        for idKey in APP_ID_STATE_KEYS_DICT:
            logging.info("Beginning saving of '{id}' global values".format(id = idKey))
            appStateKeys = APP_ID_STATE_KEYS_DICT[idKey]
            # Get global state values for app
            appValues = get_application_vals(idKey, appStateKeys)
            # Check if valid or not
            if appValues is not None:
                # Save to Firebase DB
                save_to_firebase(idKey, appValues)
                logging.info("Successfully saved application state '{id}' values at '{time}'".format(id = idKey, time = LastBackupEpochTime))
            else:
                logging.error("Error saving application state '{id}' values at '{time}'".format(id = idKey, time = LastBackupEpochTime))

        # Completed all fetching of data, sleep for hour period
        logging.info("Sleeping for '{period}' hours".format(period = SLEEP_HOURS))
        time.sleep(SLEEP_HOURS * 60 * 60)