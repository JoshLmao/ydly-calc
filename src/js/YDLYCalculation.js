
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
    let day = 86400;
    let daysDifference = (globalTime - usrTime) / day;
    let microUsrAmount = usrStakingShares + (daysDifference * usrAmount);
    let amount = (microUsrAmount / globalStakingShares) * totalYdlyUnlockRewards;

    let finalAmount = fromMicroValue(amount);
    return finalAmount;
}