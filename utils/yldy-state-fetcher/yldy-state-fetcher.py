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
from datetime import datetime, timedelta
import requests
import json
import base64
import pyrebase
import logging

# Config python file
import config as config

# Firebase API
FIREBASE = None

# Global, last epoch time the backup has run
LastBackupEpochTime = -1

# Gets the amount of milliseconds since 1970, 1, 1
def get_epoch_time():
    return int(time.time() * 1000)

# Saves the given values into the Firebase database
def save_to_firebase(appID, values):
    # Get database from Firebase
    db = FIREBASE.database()

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

# Calculates the awake time rounded to the hour after startTime plus sleepHours.
# For example, startTime = 12:10:12 (in epoch ms unit), sleepHours = 4
# returns datetime object with hh:mm:ss until 14:00, which would be 3:50:48
def calc_awake_datetime(startEpochMsTime, sleepHours):
    startDateTime = datetime.fromtimestamp(startEpochMsTime / 1000)
    # Add sleepHours offset
    endDT = startDateTime + timedelta(hours = sleepHours)
    # Flatten minutes & seconds to rounded hour
    flatDT = endDT.replace(minute=0, second=0)
    # Determine duration until flattened datetime
    durationDT = flatDT - startDateTime
    return durationDT

if __name__ == '__main__':
    # Setup logging config
    logging.basicConfig(level=logging.INFO, format='%(asctime)s.%(msecs)03d %(levelname)s | %(message)s', datefmt='%d-%m-%Y %H:%M:%S')

    # Check if necessary values exist before running
    if config.PYREBASE_CONFIG["apiKey"] is None or config.PYREBASE_CONFIG["apiKey"] is "":
        logging.error("No API key provided. Check config and try again")
        exit()  #Exit as dont have the required config info

    # Check if sleep hours is more than 1
    if config.SLEEP_HOURS < 1:
        logging.error("Config SLEEP_HOURS can't be less than 1! Change and try again")
        exit()

    logging.info("Starting YLDY Firebase fetching program")

    # Init firebase & assign user
    FIREBASE = pyrebase.initialize_app(config.PYREBASE_CONFIG)

    # Start constant loop
    while True:
        # Get new epoch time on new start
        LastBackupEpochTime = get_epoch_time()

        # Loop over Dictionary with key value pairs
        for idKey in config.APP_ID_STATE_KEYS_DICT:
            logging.info("Beginning saving of '{id}' global values".format(id = idKey))
            appStateKeys = config.APP_ID_STATE_KEYS_DICT[idKey]
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
        awakeDateTime = calc_awake_datetime(LastBackupEpochTime, config.SLEEP_HOURS)
        logging.info("Sleeping for '{period}' hours, awaking in '{awakeDateTime}' (HH:MM::SS)".format(period = config.SLEEP_HOURS, awakeDateTime = str(awakeDateTime)))
        time.sleep(awakeDateTime.seconds)