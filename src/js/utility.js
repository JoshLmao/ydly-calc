// Converts a microALGO to an ALGO
export function microAlgoToAlgo (amount) {
    return fromMicroValue(amount)
}

// Converts a microValue to it's actual value (Divide by 10^6)
export function fromMicroValue(val) {
    return val / 1000000;  // 10 ^6
}

export function toMicroValue(val) {
    return val * 1000000; // 10 ^6
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

// Gets the difference in days between the two given times (not dates) 
// Time = new Date().getTime() / 1000
export function getDayDifference (fromTime, toTime) {
    if (fromTime && toTime) {
        let diffTime = toTime - fromTime;
        diffTime = diffTime / (60 * 60 * 24);
        return Math.abs(Math.round(diffTime));
    }
    return null;
}

// Converts an exponent value to string.
// Eg 1.432456e-4 = 0.0001432456
export function expToFixed(x) {
    if (Math.abs(x) < 1.0) {
        let e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10,e-1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        let e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10,e);
            x += (new Array(e+1)).join('0');
        }
    }
    return x;
}