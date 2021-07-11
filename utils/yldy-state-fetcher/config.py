# Amount of hours to sleep before updating
SLEEP_HOURS = 4

# NLL application id
nllApplicationID = 233725844
# YLDY Staking ID
yldyStakingApplicationID = 233725850

# Dictionary of all application id's and their global state keys
# to retrieve every X hours
APP_ID_STATE_KEYS_DICT = {
    # No Loss Lottery (NLL) Global State keys to track. Refer to yieldly-app-states.md for more info
    nllApplicationID: [ 
        "TYUL", "TYL", "GA", "GSS" 
    ],
    # YLDY Staking global state keys to track. Refer to yieldly-app-states.md for more info
    yldyStakingApplicationID: [
        "TYUL", "TAP", "GA", "GSS"
    ]
}

# Pyrebase config
# Service account: Path to service account .json file
PYREBASE_CONFIG = {
    "apiKey": "", 
    "authDomain": "",
    "databaseURL": "",
    "storageBucket": "",
    "serviceAccount": ""
}