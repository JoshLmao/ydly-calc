import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { CSVLink } from 'react-csv';

import { getDateTimeFromTransaction } from '../../js/AlgoExplorerAPI';
import { filterStakeTransactions, getLocaleStateKey, isALGOTransaction, isASATransaction, YIELDLY_APP_ID_KEY } from '../../js/AlgoExplorerHelper';
import { constants } from '../../js/consts';
import { buildCsvDataFromTxs, formatNumber, fromMicroValue, getBestGraphHeight, getDateStringShort } from '../../js/utility';

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";

import ClaimTable from '../ClaimHistory/ClaimTable/ClaimTable';

function getDepositTxs (allGroupTxs, usrAddress) {
    let allDeposits = [];
    for (let group of allGroupTxs) {
        for (let tx of group) {
            if (tx.sender !== usrAddress) {
                continue;
            }

            let asaTx = isASATransaction(tx);
            let algoTx = isALGOTransaction(tx);
            let appID = tx[YIELDLY_APP_ID_KEY];

            if (appID && (appID === constants.NO_LOSS_LOTTERY_APP_ID || appID === constants.YLDY_STAKING_APP_ID)) {
                if (algoTx) {
                    // Ignore if is a app tx fee
                    let amount = tx["payment-transaction"].amount;
                    if (amount === 1000) {
                        continue;
                    }
                }

                if (asaTx || algoTx) {
                    allDeposits.push(tx);
                    break;
                }
            }
        }
    }
    return allDeposits;
}

class StakeHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAddress: props.userAddress,
            appAddress: props.appAddress,
            allTransactions: props.allTransactions,
        };

        this.onAllTransactionsUpdated = this.onAllTransactionsUpdated.bind(this);
        this.buildGraphData = this.buildGraphData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({ userAddress: this.props.userAddress });
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
            let stakeTxs = filterStakeTransactions(this.state.allTransactions, this.state.userAddress, this.state.appAddress);
            this.setState({
                groupTransactions: stakeTxs,
                depositTransactions: getDepositTxs(stakeTxs, this.state.userAddress),
            }, () => {
                this.buildGraphData()
            });
        } else {
            this.setState({
                errorMsg: "Unable to get any transactions. Check the address and try again",
                lineData: null,
                depositTransactions: null,
            });
        }
    }

    buildGraphData() {
        if (this.state.groupTransactions) {
            if (this.state.groupTransactions.length <= 0) {
                this.setState({
                    errorMsg: "Address hasn't staked. Try staking in the Yieldly app and try again.",
                    loadingGraphData: false,
                });
                return;
            }

            let nllStakeData = [];
            let yldyStakeData = [];

            for (let tx of this.state.depositTransactions) {
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


            let cumulativeNllTotalData = [];
            let cumulativeYLDYStakingTotalData = [];

            for (let group of this.state.groupTransactions) {
                for (let tx of group) {
                    let value = getLocaleStateKey(tx, "UA", this.state.userAddress);
                    let dt = getDateTimeFromTransaction(tx);
                    let id = -1;

                    let appTx = tx["application-transaction"];
                    if (appTx) {
                        id = appTx["application-id"];
                    }

                    if (value && id) {
                        if (id === constants.NO_LOSS_LOTTERY_APP_ID) {
                            cumulativeNllTotalData.push({
                                x: dt.toISOString(),
                                y: fromMicroValue(value.uint)
                            });
                        }
                        else if (id === constants.YLDY_STAKING_APP_ID) {
                            cumulativeYLDYStakingTotalData.push({
                                x: dt.toISOString(),
                                y: fromMicroValue(value.uint)
                            });
                        }
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
                        },
                        {
                            label: "No Loss Lottery | Cumulative ALGO",
                            data: cumulativeNllTotalData,
                            backgroundColor: "rgba(169, 169, 169, 0.5)",    //cs color: DarkGrey
                            borderColor: "lightgrey",
                            borderWidth: 2,
                            fill: true,
                        },
                        {
                            label: "YLDY Staking | Cumulative YLDY",
                            data: cumulativeYLDYStakingTotalData,
                            backgroundColor: "rgba(30, 144, 255, 0.5)",     //css color: DodgetBlue
                            borderColor: "darkturquoise",
                            borderWidth: 2,
                            fill: true,
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
                            if (dataset.label.toLowerCase().includes("cumulative")) {
                                return null;   // dont show cumulative totals
                            }
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
                                                <b>Total stake:</b>
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
                    this.state.depositTransactions && this.state.depositTransactions.length > 0 && (
                        <Row
                            className="py-3">
                            <div
                                className="w-100 d-flex">
                                <h3 className="yldy-title">Deposit Transactions</h3>
                                <p className="p-0 small my-auto mx-2">
                                    All transactions where the user deposited ALGO or YLDY into the application
                                </p>
                                <CSVLink
                                    className="ml-auto my-auto"
                                    filename={`stake-history-${getDateStringShort(new Date())}-${this.state.userAddress}.csv`}
                                    data={ buildCsvDataFromTxs(this.state.depositTransactions) }
                                    >
                                    Download as CSV
                                    <FontAwesomeIcon
                                        className="mx-2"
                                        icon={faDownload}
                                        />
                                </CSVLink>
                            </div>


                            <ClaimTable
                                claimTransactions={this.state.depositTransactions}
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