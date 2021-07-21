import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import { getClaimHistoryAsync } from "../../js/AlgoExplorerAPI";
import { formatNumber, fromMicroValue } from "../../js/utility";
import { constants } from "../../js/consts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Row, Col } from "react-bootstrap";

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";

// Adapter for ChartJS to use dates
import 'chartjs-adapter-luxon';

class ClaimHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAddress: props.userAddress,
            appAddress: props.appAddress,

            allTransactions: null,
            allUserClaims: null,

            loadingGraphData: false,
            errorMsg: null,
        };

        this.getClaimHistory = this.getClaimHistory.bind(this);
        this.buildGraphData = this.buildGraphData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({
                userAddress: this.props.userAddress,
                errorMsg: null,
            });
        } else if (prevProps.appAddress !== this.props.appAddress) {
            this.setState({ appAddress: this.props.appAddress });
        }
    }

    getClaimHistory() {
        if (this.state.userAddress) {
            this.setState({
                loadingGraphData: true,
                errorMsg: null,
            });

            getClaimHistoryAsync(
                this.state.userAddress, 
                this.state.appAddress
            ).then((data) => {
                this.setState({
                    allUserClaims: data.claim,
                    allTransactions: data.all,
                }, () => {
                    this.buildGraphData();
                });
            });   
        } else {
            this.setState({
                errorMsg: "No address entered!"
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
                let asaT = transaction["asset-transfer-transaction"];
                let algoTransaction = transaction["payment-transaction"];

                let dateTime = null;
                if (transaction["round-time"]) {
                    // Label as locale date time of transaction
                     dateTime = new Date(transaction["round-time"] * 1000);

                    // Flatten date: Make DT object a day, no hrs/mins/secs/ms
                    let flatDT = new Date(dateTime.getTime());
                    flatDT.setMilliseconds(0);
                    flatDT.setSeconds(0);
                    flatDT.setMinutes(0);
                    flatDT.setHours(0);

                    // Add as a label
                    labels.push(flatDT);
                }

                // If is a ASA transaction
                if (asaT && dateTime) {
                    // Iterate through all transactions finding the related group transaction and get it's app id.
                    // Check app id is either NLL or YLDY staking.
                    let transactionAppIDTarget = -1;
                    if (transaction.group) {
                        for(let t of this.state.allTransactions) {
                            if (t.group === transaction.group && t["application-transaction"]) {
                                
                                // Check if this transaction is to modify user amount local state
                                // Mofify UA local state means user withdrew YLDY from contract
                                let localStateModify = t["local-state-delta"];
                                if (localStateModify) {
                                    if (localStateModify[0]?.delta[0]?.key === btoa("UA")) {
                                        break;
                                    }
                                }
                                
                                let appID = t["application-transaction"]["application-id"];
                                if (appID === constants.NO_LOSS_LOTTERY_APP_ID || appID === constants.YLDY_STAKING_APP_ID) {
                                    transactionAppIDTarget = appID;
                                    break;
                                }
                            }
                        }
                    }

                    // Still check var is either NLL or YLDY staking, add to relevant data array
                    if (transactionAppIDTarget === constants.YLDY_STAKING_APP_ID) {
                        // YLDY staking claim
                        yldyStakeClaimData.push({
                            x: dateTime.toISOString(),
                            y: fromMicroValue(asaT.amount),
                        });
                    }
                    else if (transactionAppIDTarget === constants.NO_LOSS_LOTTERY_APP_ID) {
                        // No Loss Lottery claim
                        nllClaimData.push({
                            x: dateTime.toISOString(),
                            y: fromMicroValue(asaT.amount),
                        });
                    }
                } 
                // If is an algo transaction, add to algo data
                else if (algoTransaction) {
                    let algoAmt = algoTransaction.amount;
                    algoClaimData.push({
                        x: dateTime.toISOString(),
                        y: fromMicroValue(algoAmt),
                    });
                }
            }

            this.setState({
                loadingGraphData: false,
                lineData: {
                    labels: labels,
                    datasets: [
                        {
                            label: "No Loss Lottery | YLDY rewards",
                            data: nllClaimData,
                            backgroundColor: "orange",
                            borderColor: "orange",
                            borderWidth: 1,
                        },
                        {
                            label: "YLDY Staking | YLDY rewards",
                            data: yldyStakeClaimData,
                            backgroundColor: "rgb(254, 215, 56)",
                            borderColor: "rgb(254, 215, 56)",
                            borderWidth: 1,
                        },
                        {
                            label: "YLDY Staking | ALGO rewards",
                            data: algoClaimData,
                            backgroundColor: "grey",
                            borderColor: "grey",
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
                    !this.state.lineData && !this.state.loadingGraphData && (
                        <Button onClick={() => this.getClaimHistory() }>
                            View Claim History
                        </Button>
                    )
                }
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
                    this.state.lineData && !this.state.loadingGraphData &&
                        <Button 
                            variant="primary" 
                            onClick={() => this.getClaimHistory() }
                            >
                            Refresh Claim History
                        </Button>
                }
                {
                    this.state.lineData && (
                        <Line
                            data={ this.state.lineData }
                            options={{
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: {
                                            displayFormats: 'day',
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
            </div>
        );
    }
}

export default ClaimHistory;