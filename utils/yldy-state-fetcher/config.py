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
# YLDY/CHOICE
yldyChoiceAppID = 447336112
# CHOICE/CHOICE
choiceChoiceAppID = 464365150
# XET/XET
xetXetAppID = 470390215
# ARCC/ARCC
arccArccAppID = 498747685
# YLDY/AKITA
yldyAkitaAppID = 511597182
# AKITA/ALGO LP
akitaAlgoLPAppID = 511593477

# Dictionary of all application id's and their global state keys
# to retrieve every X hours
APP_ID_STATE_KEYS_DICT = {
    # No Loss Lottery (NLL) Global State keys to track. Refer to yieldly-app-states.md for more info
    nllApplicationID: [ 
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
    ],
    # YLDY Staking global state keys to track. Refer to yieldly-app-states.md for more info
    yldyStakingApplicationID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
    ],
    yldySmileStakingAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    smileSmileAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    yldyArccAppID: [ 
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    yldyGemsAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    gemsGemsAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    yldyXetAppId: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    yldyChoiceAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    choiceChoiceAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    xetXetAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    arccArccAppID: [
        { "key": "TYUL", "type": "uint" },
        { "key": "TYL", "type": "uint" },
        { "key": "GA", "type": "uint" },
        { "key": "GSS", "type": "uint" },
        { "key": "SA", "type": "uint" },
        { "key": "RA", "type": "uint" },
    ],
    yldyAkitaAppID: [
        { "key": "Global_Stake", "type": "bytes" },
        { "key": "Staking_Token", "type": "uint" },
        { "key": "Rewards_Unlocked_1", "type": "bytes" },
        { "key": "Reward_Token_1", "type": "uint" },
        { "key": "Token_Per_Share_1", "type": "bytes" },
    ],
    akitaAlgoLPAppID: [
        { "key": "Global_Stake", "type": "bytes" },
        { "key": "Staking_Token", "type": "uint" },
        { "key": "Rewards_Unlocked_1", "type": "bytes" },
        { "key": "Reward_Token_1", "type": "uint" },
        { "key": "Token_Per_Share_1", "type": "bytes" },
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