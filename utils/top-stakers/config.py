# Path to save the top stakers .json file to.
# Leave blank to save the file in the same running environment (next to the running .py file)
SAVE_FOLDER = "utils/top-stakers/history/"

# Prefix of file name. Adds the date/time and file extension after
# For example: {filename_prefix}_2021-06-09_04-20-00.json
SAVE_FILENAME_PREFIX = "yldy-top-stakers"

# Main URL of api
ALGOEXPLORER_API = "https://algoexplorerapi.io"
# endpoint for indexing accounts in AlgoExplorer
INDEXER_ENDPOINT =  "/idx2/"


# Starting point for getting all addresses that have opted in to this certain asset
# For Yieldly, providing the YLDY asset is wise as YLDY is used in most staking or as a reward for NLL
opt_in_asset = 226701642
# List of algorand asset id's to obtain balances of in the user's wallet
# You DONT need to include ALGO (Algorand's currency) as it's included for you
user_assets = [
    "226701642",    # YLDY
    "287867876",    # OPUL
    "300208676"     # SMILE
]
# List of all algorand application id's to obtain from the user's local state
# App Local State can be seen by going to https://algoexplorer.io/address/XXXX -> Apps tab -> Connected tab -> Hover over eye of any app
user_app_values = [
    {
        "appID": "233725844",   # NLL
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "233725850",   # YLDY/YLDY Staking
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "348079765",   # YLDY/OPUL Staking
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "352116819",   # YLDY/SMILE Staking
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "367431051",   # OPUL/OPUL
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "373819681",    # SMILE/SMILE
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "385089192",   # YLDY/ARCC
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "393388133",   # YLDY/GEMS
        "local_state_keys": [
            "UA"
        ]
    },
    {
        "appID": "419301793",   # GEMS/GEMS
        "local_state_keys": [
            "UA"
        ]
    }
]