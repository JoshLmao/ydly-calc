import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Table, Button } from "react-bootstrap";

import ALGO_ICON from "../../../svg/algo-icon.svg";
import YLDY_ICON from "../../../svg/yldy-icon.svg";
import { fromMicroFormatNumber, fromMicroValue, shortenAddress } from '../../../js/utility';
import { YIELDLY_APP_ID_KEY } from '../../../js/AlgoExplorerHelper';
import { constants } from '../../../js/consts';

function formatDate(date) {
    if (date) {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } else {
        return null;
    }
}

class ClaimTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            claimTransactions: props.claimTransactions,
            sortedUserClaims: props.claimTransactions,
            purposeText: props.purposeText ?? "?",
            sortEarliest: true,
        };

        this.invertUserClaims = this.invertUserClaims.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.claimTransactions !== this.props.claimTransactions) {
            this.setState({
                claimTransactions: this.props.claimTransactions,
                sortedUserClaims: this.props.claimTransactions,
            });
        }
    }

    invertUserClaims() {
        this.setState({
            sortEarliest: !this.state.sortEarliest,
            sortedUserClaims: this.state.sortedUserClaims.reverse(),
        });
    }

    render() {
        return (
            <div 
                className="yldy-scrollbar w-100"
                style={{
                    maxHeight: "400px",
                }}>
                {
                    this.state.sortedUserClaims && (
                        <Table
                            className="m-0 all-text-white">
                            <thead>
                                <tr>
                                    <th>
                                        Date 
                                        <Button 
                                            className="mx-2"
                                            onClick={ () => this.invertUserClaims() }>
                                            <FontAwesomeIcon 
                                                icon={ this.state.sortEarliest ? faSortUp : faSortDown } 
                                                />
                                        </Button>
                                    </th>
                                    <th>Tx ID</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>{this.state.purposeText} Type</th>
                                    <th>{this.state.purposeText} Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.sortedUserClaims.map((tx, index) => {
                                        let asaInfo = tx["asset-transfer-transaction"];
                                        let algoInfo = tx["payment-transaction"];

                                        // Get claim amount
                                        let claimAmt = 0;
                                        if (asaInfo) {
                                            claimAmt = asaInfo.amount;
                                        } else if (algoInfo) {
                                            claimAmt = algoInfo.amount;
                                        }

                                        // Determine receiver address
                                        let receiverAddr = "";
                                        if (asaInfo) {
                                            receiverAddr = asaInfo.receiver;
                                        } else if (algoInfo) {
                                            receiverAddr = algoInfo.receiver;
                                        }

                                        // Determine source of claim
                                        let claimSource = "";
                                        let appID = tx[YIELDLY_APP_ID_KEY];
                                        if (appID === constants.NO_LOSS_LOTTERY_APP_ID) {
                                            claimSource = "No Loss Lottery";
                                        }
                                        else if (appID === constants.YLDY_STAKING_APP_ID) {
                                            claimSource = "YLDY Staking";
                                        }
                                        return (
                                            <tr
                                                key={ `${tx.id}-${index}` }
                                                >
                                                <td>{ formatDate(new Date(tx["round-time"] * 1000)) }</td>
                                                <td>
                                                    <a href={`https://algoexplorer.io/tx/${tx.id}`}>
                                                        { shortenAddress(tx.id, 4) }
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href={`https://algoexplorer.io/address/${tx.sender}`}>
                                                        { shortenAddress(tx.sender, 4) }
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href={`https://algoexplorer.io/address/${receiverAddr}`}>
                                                        { shortenAddress(receiverAddr, 4) }
                                                    </a>
                                                </td>
                                                <td>    
                                                    <b>
                                                        { claimSource }
                                                    </b>
                                                </td>
                                                <td title={ fromMicroValue(claimAmt) }>
                                                    <img 
                                                        src={ asaInfo ? YLDY_ICON : ALGO_ICON } 
                                                        alt="Currency icon"
                                                        className="mr-2"
                                                        height="21" 
                                                        width="21" 
                                                        />
                                                    { fromMicroFormatNumber(claimAmt, 3) }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    )
                }
            </div>
        );
    }
}

export default ClaimTable;