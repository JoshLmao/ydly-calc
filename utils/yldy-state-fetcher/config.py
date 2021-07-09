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
# Service account: Path to service account .json file
PYREBASE_CONFIG = {
    "apiKey": "", 
    "authDomain": "",
    "databaseURL": "",
    "storageBucket": "",
    "serviceAccount": ""
}