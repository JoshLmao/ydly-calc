import { isALGOTransaction, isASATransaction, YIELDLY_APP_ID_KEY } from "./AlgoExplorerHelper";

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

// Runs the value through fromMicroValue, toFixed() with the value and formats the value
export function fromMicroFormatNumber(value, toFixed = -1) {
    if (value) {
        let micro =  fromMicroValue(value);
        if (toFixed >= 0)
            micro = micro.toFixed(toFixed);
        
        return formatNumber(micro);
    }
    else {
        return value;
    }
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

// Shortens a full address into a "AAAA...BBBB" string.
// Amt is the amount of characters at the start and end of the shortened address
export function shortenAddress(address, amt) {
    if (!address || amt <= 0) {
        return null;
    }

    let start = "";
    let end = "";

    for(let i = 0; i < amt; i++) {
        start += address[i];

        let lastIndex = address.length - 1;
        end = address[lastIndex - i] + end;
    }

    return `${start}...${end}`;
}

export function copyToClipboard (content) {
    navigator.clipboard.writeText(content).then(
        function () {
            console.log("Async: Copying to clipboard was successful!", content);
        },
        function (err) {
            console.error("Async: Could not copy text: ", err);
        }
    );
};


// Builds a CSV file data from a list of transactions
export function buildCsvDataFromTxs(allTxs) {
    if (allTxs) {
        let csvData = [];
        // Add CSV headers
        csvData.push([
            "date/time", "transaction", "sender", "receiver", "staking pool", "amount", "token"
        ]);

        for (let tx of allTxs) {
            let dateTime = new Date(tx["round-time"] * 1000);
            let rowData = {
                dateTime: `${dateTime.toUTCString()}`,
                txID: tx.id,
                sender: tx.sender,
                stakingPool: tx[YIELDLY_APP_ID_KEY],
            };

            if (isASATransaction(tx)) {
                let asaTx = tx["asset-transfer-transaction"];
                rowData.amount = fromMicroValue(asaTx.amount);
                rowData.receiver = asaTx.receiver;
                rowData.token = "YLDY";
            }
            else if (isALGOTransaction(tx)) {
                let algoTx = tx["payment-transaction"];
                rowData.amount = fromMicroValue(algoTx.amount);
                rowData.receiver = algoTx.receiver;
                rowData.token = "ALGO";
            }

            // Append data
            csvData.push([
                rowData.dateTime, rowData.txID, rowData.sender, rowData.receiver, rowData.stakingPool, rowData.amount, rowData.token
            ]);
        }

        return csvData;
    } else {
        return null;
    }
}

// Converts the given date to a string in the format: DD/MM/YYYY HH:MM
export function getDateStringShort (date) {
    if (date) {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    }
    return null;
}