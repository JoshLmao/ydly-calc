import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Card, Row, Col } from "react-bootstrap";
import { CSVLink } from 'react-csv';

import { constants } from "../../js/consts";
import { getDateTimeFromTransaction } from "../../js/AlgoExplorerAPI";
import { filterClaimTransactions, isALGOTransaction, isASATransaction, YIELDLY_APP_ID_KEY } from "../../js/AlgoExplorerHelper";
import { buildCsvDataFromTxs, formatNumber, fromMicroValue, getBestGraphHeight, getDateStringShort } from "../../js/utility";

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";

// Adapter for ChartJS to use dates
import 'chartjs-adapter-luxon';
import ClaimTable from "./ClaimTable/ClaimTable";

class ClaimHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAddress: props.userAddress,
            appAddress: props.appAddress,

            allTransactions: props.allTransactions,

            allUserClaims: null,

            loadingGraphData: false,
            errorMsg: null,

            sortEarliest: true,
        };

        this.buildGraphData = this.buildGraphData.bind(this);
        this.onAllTransactionsUpdated = this.onAllTransactionsUpdated.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({
                userAddress: this.props.userAddress,
                errorMsg: null,
            });
        } 
        if (prevProps.appAddress !== this.props.appAddress) {
            this.setState({ appAddress: this.props.appAddress });
        }
        if (prevProps.allTransactions !== this.props.allTransactions) {
            this.setState({ allTransactions: this.props.allTransactions }, () => this.onAllTransactionsUpdated() );
        }
    }

    onAllTransactionsUpdated() {
        if (this.state.allTransactions) {
            this.setState({
                loadingGraphData: true,
                errorMsg: null,
            });
            
            let filteredTransactions = filterClaimTransactions(this.state.allTransactions, this.state.userAddress, this.state.appAddress);
            this.setState({
                allUserClaims: filteredTransactions,
            }, () => {
                this.buildGraphData();
            });
        } else {
            this.setState({
                errorMsg: "Unable to get any transactions. Check the address and try again",
                lineData: null,
                allUserClaims: null,
            });
        }
    }

    buildGraphData () {
        if (this.state.allUserClaims && this.state.allTransactions) {
            // Check if user has any claims before building data
            if (this.state.allUserClaims.length <= 0) {
                this.setState({
                    errorMsg: "Address hasn't made any claims. Try claiming in the Yieldly app and try again.",
                    loadingGraphData: false,
                });
                return;
            }

            let labels = [];
            let yldyStakeClaimData = [];
            let algoClaimData = [];
            let nllClaimData = [];

            // Iterate through all claim transactions
            for (let transaction of this.state.allUserClaims) {
                let dateTime = getDateTimeFromTransaction(transaction);
                if (dateTime) {
                    // Flatten date: Make DT object a day, no hrs/mins/secs/ms
                    let flatDT = new Date(dateTime.getTime());
                    flatDT.setMilliseconds(0);
                    flatDT.setSeconds(0);
                    flatDT.setMinutes(0);
                    flatDT.setHours(0);

                    // Add as a label
                    labels.push(flatDT);

                    if (isASATransaction(transaction)) {
                        let asaTransaction = transaction["asset-transfer-transaction"];
                        // Retrieve custom key of related Yieldly application id
                        let appID = transaction[YIELDLY_APP_ID_KEY];

                        if (appID === constants.NO_LOSS_LOTTERY_APP_ID) {
                            // No Loss Lottery claim
                            nllClaimData.push({
                                x: dateTime.toISOString(),
                                y: fromMicroValue(asaTransaction.amount),
                            });
                        }
                        else if (appID === constants.YLDY_STAKING_APP_ID) {
                            // YLDY staking claim
                            yldyStakeClaimData.push({
                                x: dateTime.toISOString(),
                                y: fromMicroValue(asaTransaction.amount),
                            });
                        }
                    }
                    else if (isALGOTransaction(transaction)) {
                        let algoTransaction = transaction["payment-transaction"];
                        algoClaimData.push({
                            x: dateTime.toISOString(),
                            y: fromMicroValue(algoTransaction.amount),
                        });
                    }
                }
            }

            // Build final graph data
            let nllColor = "rgb(249, 85, 144)";
            let stakingYldyColor = "rgb(254, 215, 56)";
            let stakingAlgoColor = "grey";
            this.setState({
                loadingGraphData: false,
                lineData: {
                    labels: labels,
                    datasets: [
                        {
                            label: "No Loss Lottery | YLDY rewards",
                            data: nllClaimData,
                            backgroundColor: nllColor,
                            borderColor: nllColor,
                            borderWidth: 1,
                        },
                        {
                            label: "YLDY Staking | YLDY rewards",
                            data: yldyStakeClaimData,
                            backgroundColor: stakingYldyColor,
                            borderColor: stakingYldyColor,
                            borderWidth: 1,
                        },
                        {
                            label: "YLDY Staking | ALGO rewards",
                            data: algoClaimData,
                            backgroundColor: stakingAlgoColor,
                            borderColor: stakingAlgoColor,
                            borderWidth: 1,
                        }
                    ]
                }
            });
        }
    }

    render() {
        let textColor = "white";
        return (
            <div>
                <h1 
                    id="claim-history" 
                    className="yldy-title">
                    Claim History
                </h1>
                <p>
                    View your history of claimed rewards between No Loss Lottery and YLDY Staking. Click the button below to view your history. 
                    Make sure your algorand address is entered at the top of the page.
                    This may take some time, depending on the amount of transactions.
                </p>
                {
                    this.state.errorMsg && (
                        <div style={{ color: "red" }}>
                            { this.state.errorMsg }
                        </div>
                    )
                }
                {
                    this.state.loadingGraphData && (
                        <FontAwesomeIcon 
                            icon={faSpinner} 
                            size="2x" 
                            spin 
                            />
                    )
                }
                {
                    this.state.lineData && (
                        <Line
                            height={ getBestGraphHeight() }
                            data={ this.state.lineData }
                            options={{
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: {
                                            displayFormats: {
                                                'day': 'DD',
                                            },
                                            unit: 'day',
                                        },
                                        title: {
                                            display: true,
                                            text: "Date",
                                            color: textColor
                                        },
                                        ticks: {
                                            color: textColor,
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Claimed Amount",
                                            color: textColor,
                                        },
                                        ticks: {
                                            color: textColor,
                                        }
                                    }
                                }
                            }}
                        />
                    )
                }
                <Row 
                    className="py-3"
                    xs={1}
                    sm={1}
                    md={3}>
                    {
                        !this.state.lineData && (
                            <Col>
                                Nothing to show... yet
                            </Col>
                        )
                    }
                    {
                        this.state.lineData && this.state.lineData.datasets.map((dataset, index) => {
                            let isALGO = dataset.label.includes("ALGO");
                            let isNLL = dataset.label.includes("No Loss Lottery");
                            let totalAmt = dataset.data.reduce(function(accumulation, b) { 
                                return accumulation + b.y;
                            }, 0);
                            return (
                                <Col>
                                    <Card 
                                        key={index}
                                        border={ isNLL ? "primary" : "info" }
                                        className="rounded bg-dark my-2"
                                        >
                                        <Card.Body>
                                            <Card.Title 
                                                className="yldy-title">
                                                { dataset.label }
                                            </Card.Title>
                                            <div>
                                                <b>Total Claimed:</b>
                                                <img 
                                                    className="ml-2 mr-1"
                                                    alt={ isALGO ? "ALGO icon" : "YLDY icon" }
                                                    src={ isALGO ? ALGO_ICON :YLDY_ICON }
                                                    height="21"
                                                    width="21"
                                                    />
                                                <span
                                                    title={totalAmt}>
                                                    { 
                                                        formatNumber(totalAmt.toFixed(2))
                                                    }
                                                </span>
                                                <br />
                                                <b>Amount of claims:</b> {dataset.data.length} times.
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </Row>
                {
                    this.state.allUserClaims && this.state.allUserClaims.length > 0 && (
                        <Row 
                            className="py-3">
                            <div
                                className="d-flex w-100">
                                <h3 className="yldy-title">Claim Transactions</h3>
                                <p className="p-0 small my-auto mx-2">
                                    All transactions where the user claimed ALGO or YLDY from the applications.
                                </p>
                                <CSVLink
                                    className="ml-auto my-auto"
                                    filename={`claim-history-${getDateStringShort(new Date())}-${this.state.userAddress}.csv`}
                                    data={ buildCsvDataFromTxs(this.state.allUserClaims) }
                                    >
                                    Download as CSV
                                    <FontAwesomeIcon 
                                        className="mx-2"
                                        icon={faDownload}
                                        />
                                </CSVLink>
                            </div>
                            
                            <ClaimTable
                                claimTransactions={this.state.allUserClaims}
                                purposeText="Claim"
                                />
                        </Row>
                    )
                }
            </div>
        );
    }
}

export default ClaimHistory;