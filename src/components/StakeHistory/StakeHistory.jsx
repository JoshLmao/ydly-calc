import React, { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { getDateTimeFromTransaction } from '../../js/AlgoExplorerAPI';
import { filterStakeTransactions, isALGOTransaction, isASATransaction, YIELDLY_APP_ID_KEY } from '../../js/AlgoExplorerHelper';
import { constants } from '../../js/consts';
import { formatNumber, fromMicroValue } from '../../js/utility';

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";
import ClaimTable from '../ClaimHistory/ClaimTable/ClaimTable';

class StakeHistory extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            userAddress: props.userAddress,
            allTransactions: props.allTransactions,
        };

        this.onAllTransactionsUpdated = this.onAllTransactionsUpdated.bind(this);
        this.buildGraphData = this.buildGraphData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({ userAddress: this.props.userAddress });
        }
        if (prevProps.allTransactions !== this.props.allTransactions) {
            this.setState({ allTransactions: this.props.allTransactions }, () => this.onAllTransactionsUpdated() );
        }
    }

    onAllTransactionsUpdated() {
        if (this.state.allTransactions) {
            let stakeTxs = filterStakeTransactions(this.state.allTransactions, this.state.userAddress);
            this.setState({
                stakingTransactions: stakeTxs,
            }, () => {
                this.buildGraphData()
            });
        } else {
            this.setState({
                errorMsg: "Unable to get any transactions. Check the address and try again",
                lineData: null,
                stakingTransactions: null,
            });
        }
    }

    buildGraphData() {
        if (this.state.stakingTransactions) {
            if (this.state.stakingTransactions.length <= 0) {
                this.setState({
                    errorMsg: "Address hasn't made any claims. Try staking in the Yieldly app and try again.",
                    loadingGraphData: false,
                });
                return;
            }

            let nllStakeData = [];
            let yldyStakeData = [];

            for (let tx of this.state.stakingTransactions) {
                let dateTime = getDateTimeFromTransaction(tx);
                if (dateTime) {
                    if (isASATransaction(tx)) {
                        let asaInfo = tx["asset-transfer-transaction"];
                        let appID = tx[YIELDLY_APP_ID_KEY];

                        // Only add ASA transfer into YLDY staking app
                        if (appID === constants.YLDY_STAKING_APP_ID) {
                            yldyStakeData.push({
                                x: dateTime.toISOString(),
                                y: fromMicroValue(asaInfo.amount),
                            });
                        }
                    }
                    else if (isALGOTransaction(tx)) {
                        let algoInfo = tx["payment-transaction"];
                        nllStakeData.push({
                            x: dateTime.toISOString(),
                            y: fromMicroValue(algoInfo.amount)
                        });
                    }
                }
            }

            let nllColor = "rgb(249, 85, 144)";
            let yldyColor = "rgb(254, 215, 56)";
            this.setState({
                lineData: {
                    datasets: [
                        {
                            label: "No Loss Lottery | ALGO deposited",
                            data: nllStakeData,
                            backgroundColor: nllColor,
                            borderColor: nllColor,
                            borderWidth: 1,
                        },
                        {
                            label: "YLDY Staking | YLDY deposited",
                            data: yldyStakeData,
                            backgroundColor: yldyColor,
                            borderColor: yldyColor,
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
                <h1 className="yldy-title">
                    Stake History
                </h1>
                <p>
                    View your history of staking between No Loss Lottery and YLDY Staking. Click the button below to view your history. 
                    Make sure your algorand address is entered at the top of the page. This may take some time, depending on the amount of transactions.
                </p>
                {
                    this.state.errorMsg && (
                        <div style={{ color: "red" }}>
                            { this.state.errorMsg }
                        </div>
                    )
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
                                            unit: 'day',
                                            displayFormats: {
                                                'day': 'DD',
                                            },
                                        },
                                        title: {
                                            display: true,
                                            text: "Date",
                                            color: textColor
                                        },
                                        ticks: {
                                            color: textColor
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
                    md={2}>
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
                                                <b>Total Staked:</b>
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
                                                <b>Times staked:</b> {dataset.data.length} times.
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </Row>
                {
                    this.state.stakingTransactions && this.state.stakingTransactions.length > 0 && (
                        <Row 
                            className="py-3" >
                            <ClaimTable
                                claimTransactions={this.state.stakingTransactions}
                                purposeText="Stake"
                                />
                        </Row>
                    )
                }
            </div>
        );
    }
}

export default StakeHistory;