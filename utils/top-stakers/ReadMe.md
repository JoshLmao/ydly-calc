# Top Stakers

The main purpose of the script is for obtaining local app state data from Algorand addresses. The script only looks for addresses that are opt'd in to a certain asset (the value of `opt_in_asset` declared in the `config.py`).

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