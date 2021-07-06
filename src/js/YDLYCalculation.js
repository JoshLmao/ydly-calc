
// Calculates the global staking shares

import { fromMicroValue } from "./utility";

// Global Staking Shares = ((Current Block Timestamp – Global Time) / Time Period) * Global Amount. 
export function calculateGlobalStakingShares (currentBlockTimestamp, globalTime, timePeriodUnix, globalAmount) {
    let time = currentBlockTimestamp - globalTime;
    let afterTimePeriod = time / timePeriodUnix;
    let globalShares = afterTimePeriod * globalAmount;
    return globalShares;
}


// Calculates the user staking shares
// User Staking Shares = ((Current Block Timestamp – User Time) / Time Period) * User Amount
export function calculateUserStakingShares(currentBlockTimestamp, userTime, timePeriodUnix, userAmount) {
    let time = currentBlockTimestamp - userTime;
    let period = time / timePeriodUnix;
    let usrShares = period * userAmount;
    return usrShares;
}

// Calculates the total rewards a user can claim
// Rewards Claimable For User = (User Staking Shares / Global Staking Shares) * Total Reward Unlocked
export function calculateClaimableUserRewards(usrStakingShares, globalStakingShares, totalUnlockedRewards) {
    return (usrStakingShares / globalStakingShares) * totalUnlockedRewards;
}

/// Calculates the current rewards available to the user from the current variables from user and contract
export function calculateYDLYRewards (usrStakingShares, usrTime, globalTime, usrAmount, globalStakingShares, totalYdlyUnlockRewards) {
    // Determine day period inbetween global and user time
    let day = 86400;
    let daysDifference = (globalTime - usrTime) / day;

    // Get reward amount from remainder of formula
    return calculateYDLYRewardsFromDayPeriod(usrStakingShares, daysDifference, usrAmount, globalStakingShares, totalYdlyUnlockRewards);
}

// Calculates the ydly rewards from the given properties.
// usrStakingShares (USS)
// daysPeriod - Amount of days that the user hasn't claimed
// usrAmount (UA)
// globalStakingShares (GSS)
// totalYdlyUnlockRewards (TYDL)
export function calculateYDLYRewardsFromDayPeriod(usrStakingShares, daysPeriod, usrAmount, globalStakingShares, totalYdlyUnlockRewards) {
    let microUsrAmount = usrStakingShares + (daysPeriod * usrAmount);
    let amount = (microUsrAmount / globalStakingShares) * totalYdlyUnlockRewards;

    let finalAmount = fromMicroValue(amount);
    return finalAmount;
}