// Converts a microALGO to an ALGO
export function microAlgoToAlgo (amount) {
    return fromMicroValue(amount)
}

// Converts a microValue to it's actual value (Divide by 10^6)
export function fromMicroValue(val) {
    return val / 1000000;  // 10 ^6
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