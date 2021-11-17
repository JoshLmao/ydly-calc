# Amount of hours to sleep before updating
SLEEP_HOURS = 4

# NLL application id
nllApplicationID = 233725844
# YLDY Staking ID
yldyStakingApplicationID = 233725850
# OPUL Staking ID
opulStakingAppID = 348079765
# YLDY/SMILE app id
yldySmileStakingAppID = 352116819
# OPUL/OPUL app id
opulOpulAppID = 367431051
# SMILE/SMILE
smileSmileAppID = 373819681
# YLDY/ARCC
yldyArccAppID = 385089192
# YLDY/GEMS
yldyGemsAppID = 393388133
# GEMS/GEMS
gemsGemsAppID = 419301793
# YLDY/XET
yldyXetAppId = 424101057

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
    ],
    # Opul state keys to track
    opulStakingAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    yldySmileStakingAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    opulOpulAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    smileSmileAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    yldyArccAppID: [ 
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    yldyGemsAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    gemsGemsAppID: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
    yldyXetAppId: [
        "TYUL", "TYL", "GA", "GSS", "SA", "RA"
    ],
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