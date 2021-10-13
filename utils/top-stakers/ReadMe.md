# Top Stakers

The main purpose of the script is for obtaining local app state data from Algorand addresses. The script only looks for addresses that are opt'd in to a certain asset (the value of `opt_in_asset` declared in the `config.py`). The script will only store addresses that have one or more values in the their local app state. If someone is opted in but has no local app states, then the address will not be stored in the final JSON data file.

## Running the script

Python is required to run. Edit the `config.py` file before running. You don't need to specify any parameters and shouldn't have to install any requirements.

To run, use the command `python ./top-stakers.py`

## Config

The `config.py` file is used to edit what local states are obtained from the script. Most of the variables have comments but I will explain the following ones in more details

#### `opt_in_asset`

The script will obtain every address that has opted into this asset id to parse from their local app states.

#### `user_assets`

A list of Algorand asset id's that will obtain the amounts of, alongside the app state data.

#### `user_app_values`

A map of Algorand Application ID's and their user values to obtain. The `appID` should specify an Algorand Application ID. The `local_state_keys` is an array and should contain any key's to obtain from the user's local app state.

# Result

The resulting file will look like this, depending on the config

```
{
    "snapshotEpoch":1633771820.0,
    "snapshotData":[
        {
            "address":"{REMOVED}",
            "stateData":[
                {
                    "233725844":{
                        "UA":3050000232
                    }
                },
                {
                    "233725850":{
                        "UA":121554000172
                    }
                },
                {
                    "233725850":{
                        "UA":121554000172
                    }
                },
                {
                    "352116819":{
                        "UA":10700000000
                    }
                }
            ],
            "assets":{
                "ALGO":16911123,
                "226701642":258982379,
                "300208676":67107921,
                "287867876":114310175926
            }
        }
    ]
}
```