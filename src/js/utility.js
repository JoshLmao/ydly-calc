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

// https://blog.abelotech.com/posts/number-currency-formatting-javascript/
export function formatNumber(num) {
    if (num)
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    else 
        return null;
}

export function isStringBlank(str) {
    return (!str || /^\s*$/.test(str));
}