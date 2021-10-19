import YLDY_ICON from "../svg/yldy-icon.svg";
import ALGO_ICON from "../svg/algo-icon.svg";
import OPUL_LOGO from "../svg/opul-icon.svg";
import SMILE_ICON from "../svg/smile-icon.svg";

export const constants = {
    // Algorand application id for the No Loss Lottery
    NO_LOSS_LOTTERY_APP_ID: 233725844,
    // Algorand application id for YLDY staking
    YLDY_STAKING_APP_ID: 233725850,
    // Algorand application id for OPUL staking
    OPUL_STAKING_APP_ID: 348079765,
    // YLDY SMILE staking pool app id
    YLDY_SMILE_POOL_APP_ID: 352116819,
    // OPUL/OPUL app id
    OPUL_OPUL_POOL_APP_ID: 367431051,
    // SMILE/SMILE
    SMILE_SMILE_POOL_APP_ID: 373819681,

    // Algorand asset id for YLDY
    YLDY_ASSET_ID: 226701642,
};

// Converts an app id to it's display name
export function appIDToName (appID) {
    switch (appID) {
        case constants.NO_LOSS_LOTTERY_APP_ID:
            return "No Loss Lottery";
        case constants.YLDY_STAKING_APP_ID:
            return "YLDY/YLDY Staking";
        case constants.OPUL_STAKING_APP_ID:
            return "YLDY/OPUL Staking";
        case constants.YLDY_SMILE_POOL_APP_ID:
            return "YLDY/SMILE Staking";
        case constants.OPUL_OPUL_POOL_APP_ID:
            return "OPUL/OPUL Staking";
        case constants.SMILE_SMILE_POOL_APP_ID:
            return "SMILE/SMILE Staking";
        default:
            return "Unknown " + appID;
    }
}

export function appIDToIcon(appID) {
    switch(appID){ 
        case constants.NO_LOSS_LOTTERY_APP_ID:
            return unitToIcon("ALGO");
        case constants.YLDY_STAKING_APP_ID:
            return unitToIcon("YLDY");
        case constants.OPUL_STAKING_APP_ID:
            return unitToIcon("YLDY");
        case constants.YLDY_SMILE_POOL_APP_ID:
            return unitToIcon("YLDY");
        case constants.OPUL_OPUL_POOL_APP_ID:
            return unitToIcon("OPUL");
        case constants.SMILE_SMILE_POOL_APP_ID:
            return unitToIcon("SMILE");
        default:
            return null;
    }
}

// Converts an app id to the unit of currency used to stake in the pool
export function appIDToStakingUnit (appID) {
    switch(appID){ 
        case constants.NO_LOSS_LOTTERY_APP_ID:
            return "ALGO";
        case constants.YLDY_STAKING_APP_ID:
            return "YLDY";
        case constants.OPUL_STAKING_APP_ID:
            return "YLDY";
        case constants.YLDY_SMILE_POOL_APP_ID:
            return "YLDY";
        case constants.OPUL_OPUL_POOL_APP_ID:
            return "OPUL";
        case constants.SMILE_SMILE_POOL_APP_ID:
            return "SMILE";
        default:
            return null;
    }
}

// Converts a unit/currency to it's svg icon
export function unitToIcon (unit) {
    switch(unit.toLowerCase()) {
        case "opul":
            return OPUL_LOGO;
        case "algo":
            return ALGO_ICON;
        case "yldy":
            return YLDY_ICON;
        case "smile":
            return SMILE_ICON;
        default:
            return null;
    }
}

export function unitToDecimals (unit) {
    switch(unit.toLowerCase()) {
        case "opul":
            return 10;
        case "algo":
            return 6;
        case "yldy":
            return 6;
        case "smile":
            return 6;
        default:
            return null;
    }
}