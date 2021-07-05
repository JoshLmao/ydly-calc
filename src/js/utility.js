// Converts a microALGO to an ALGO
export function microAlgoToAlgo (amount) {
    return amount / 1000000; // 10 ^6
}

// Converts a time period into UNIX
export function daysToUnix (days) {
    if (days <= 0)
        return;
    
    let now = Date.now();
    let plusDays = new Date();
    plusDays.setDate(plusDays.getDate() + days);

    let difference = plusDays - now;

    return difference;
}