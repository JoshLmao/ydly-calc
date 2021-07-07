
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
export function calculateYLDYRewards (usrStakingShares, usrTime, globalTime, usrAmount, globalStakingShares, totalYldyUnlockRewards) {
    // Determine day period inbetween global and user time
    let day = 86400;
    let daysDifference = (globalTime - usrTime) / day;

    // Get reward amount from remainder of formula
    return calculateYLDYRewardsFromDayPeriod(usrStakingShares, daysDifference, usrAmount, globalStakingShares, totalYldyUnlockRewards);
}

// Calculates the yldy rewards from the given properties.
// Formula: Claimable YLDY Rewards = ((USS + ((GT-UT) / 86400) * UA) / GSS) * TYUL / 1000000
// usrStakingShares (USS)
// daysPeriod - Amount of days that the user hasn't claimed
// usrAmount (UA)
// globalStakingShares (GSS)
// totalYldyUnlockRewards (TYDL)
export function calculateYLDYRewardsFromDayPeriod(usrStakingShares, daysPeriod, usrAmount, globalStakingShares, totalYldyUnlockRewards) {
    let microUsrAmount = usrStakingShares + (daysPeriod * usrAmount);
    let amount = (microUsrAmount / globalStakingShares) * totalYldyUnlockRewards;

    let finalAmount = fromMicroValue(amount);
    return finalAmount;
}

// Calculates how much share of the current rewards pool the user has
// Returned value as a percentage
export function calculateRewardsPoolPercentageShare(totalRewards, userShare) {
    if (userShare && totalRewards) {
        return (userShare / totalRewards) * 100;
    }
    return null;
}