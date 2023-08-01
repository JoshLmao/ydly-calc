import YLDY_ICON from "../svg/yldy-icon.svg";
import ALGO_ICON from "../svg/algo-icon.svg";
import OPUL_LOGO from "../svg/opul-icon.svg";
import SMILE_ICON from "../svg/smile-icon.svg";
import ARCC_ICON from "../svg/arcc-icon.svg";
import ALGO_GEMS_ICON from "../svg/algo-gems-icon.svg";
import XET_ICON from "../svg/xet-icon.svg";
import CHOICE_ICON from "../svg/choice-icon.svg";

export const constants = {
    // Algorand application id for the No Loss Lottery
    NO_LOSS_LOTTERY_APP_ID: 233725844,
    PROXY_APP_ID: 233725848,

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
    // YLDY/ARCC
    YLDY_ARCC_APP_ID: 385089192,
    // YLDY/GEMS
    YLDY_GEMS_APP_ID: 393388133,
    // GEMS/GEMS
    GEMS_GEMS_APP_ID: 419301793,
    // YLDY/XET
    YLDY_XET_APP_ID: 424101057,
    YLDY_CHOICE_APP_ID: 447336112,

    YLDY_ESCROW_ADDR: "FMBXOFAQCSAD4UWU4Q7IX5AV4FRV6AKURJQYGXLW3CTPTQ7XBX6MALMSPY",

    // Algorand asset id for YLDY
    YLDY_ASSET_ID: 226701642,
};

// Converts an app id to it's display name
export function appIDToName (appID) {
    switch (appID) {
        case constants.NO_LOSS_LOTTERY_APP_ID:
            return "No Loss Lottery";
        case constants.YLDY_STAKING_APP_ID:
            return "YLDY/YLDY";
        case constants.OPUL_STAKING_APP_ID:
            return "YLDY/OPUL";
        case constants.YLDY_SMILE_POOL_APP_ID:
            return "YLDY/SMILE";
        case constants.OPUL_OPUL_POOL_APP_ID:
            return "OPUL/OPUL";
        case constants.SMILE_SMILE_POOL_APP_ID:
            return "SMILE/SMILE";
        case constants.YLDY_ARCC_APP_ID:
            return `YLDY/ARCC`;
        case constants.YLDY_GEMS_APP_ID:
            return 'YLDY/GEMS';
        case constants.GEMS_GEMS_APP_ID:
            return "GEMS/GEMS";
        case constants.YLDY_XET_APP_ID:
            return "YLDY/XET";
        case constants.YLDY_CHOICE_APP_ID:
            return "YLDY/CHOICE"
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
        case constants.YLDY_ARCC_APP_ID:
            return unitToIcon("ARCC");
        case constants.YLDY_GEMS_APP_ID:
        case constants.GEMS_GEMS_APP_ID:
            return unitToIcon("GEMS");
        case constants.YLDY_XET_APP_ID:
            return unitToIcon("XET");
        case constants.YLDY_CHOICE_APP_ID:
            return unitToIcon("CHOICE");
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
        case constants.OPUL_STAKING_APP_ID:
        case constants.YLDY_SMILE_POOL_APP_ID:
        case constants.YLDY_ARCC_APP_ID:
        case constants.YLDY_GEMS_APP_ID:
        case constants.YLDY_XET_APP_ID:
        case constants.YLDY_CHOICE_APP_ID:
            return "YLDY";
        case constants.OPUL_OPUL_POOL_APP_ID:
            return "OPUL";
        case constants.SMILE_SMILE_POOL_APP_ID:
            return "SMILE";
        case constants.GEMS_GEMS_APP_ID:
            return "GEMS";

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
        case "arcc":
            return ARCC_ICON;
        case "gems":
            return ALGO_GEMS_ICON;
        case "xet":
            return XET_ICON;
        case "choice":
            return CHOICE_ICON;
        default:
            return null;
    }
}

// Converts a unit to the amount of decimals in it's currency
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
        case "arcc":
        case "gems":
            return 6;
        case "xet":
            return 9;
        case "choice":
            return 2;
        default:
            return 0;
    }
}