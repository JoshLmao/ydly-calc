
// Calculates the global staking shares
// Global Staking Shares = ((Current Block Timestamp – Global Time) /Time Period) * Global Amount. 
export function calculateGlobalStakingShares (currentBlockTimestamp, globalTime, timePeriodUnix, globalAmount) {
    return ((currentBlockTimestamp - globalTime) / timePeriodUnix) * globalAmount;
}


// Calculates the user staking shares
// User Staking Shares = ((Current Block Timestamp – User Time) /Time Period) * User Amount
export function calculateUserStakingShares(currentBlockTimestamp, userTime, timePeriodUnix, userAmount) {
    return ((currentBlockTimestamp - userTime) / timePeriodUnix) * userAmount;
}

// Calculates the total rewards a user can claim
// Rewards Claimable For User = (User Staking Shares / Global Staking Shares) * Total Reward Unlocked
export function calculateClaimableUserRewards(usrStakingShares, globalStakingShares, totalUnlockedRewards) {
    return (usrStakingShares / globalStakingShares) * totalUnlockedRewards;
}