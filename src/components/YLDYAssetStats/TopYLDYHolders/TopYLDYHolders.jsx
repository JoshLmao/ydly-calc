import React, { Component } from 'react';
import { Table, Button } from 'react-bootstrap';
import { faArrowRight, faCopy, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { 
    copyToClipboard,
    formatNumber, 
    fromMicroValue, 
    shortenAddress, 
    fromMicroFormatNumber,
    toMicroValue
} from '../../../js/utility';
import { getUserStateValues, getYieldlyHoldersStakesAsync, getYLDYTokenTopHoldersAsync } from '../../../js/AlgoExplorerAPI';
import { constants } from "../../../js/consts";

import YLDY_ICON from "../../../svg/yldy-icon.svg";
import ALGO_ICON from "../../../svg/algo-icon.svg";

// Fetches the UA value in the YLDY Staking app and sets the innerHTML of the btn to the value
function getYLDYStaked(btn, walletAddr, appID) {
    if (walletAddr) {
        getUserStateValues(walletAddr, appID, (data) => {
            let btnParent = btn.parentNode;
            if (data) {
                btnParent.innerHTML = fromMicroFormatNumber(data.userAmount, 2);
            } else {
                btnParent.innerHTML = "None";
            }
        });
    }
}

class TopYLDYHolders extends Component {
    constructor (props) {
        super(props);

        this.state = {
            // Limit the amount of entries to retrieve for table
            limit: null,
            // Minimum amount of YLDY in wallets to get table data
            C: toMicroValue( 0.001 ),
            // All holders, original data from API
            topHolders: null,
            // Current table data to display
            topHoldersTableData: null,

            yieldlyAddress: "FMBXOFAQCSAD4UWU4Q7IX5AV4FRV6AKURJQYGXLW3CTPTQ7XBX6MALMSPY",
        };

        this.refreshTopHolders = this.refreshTopHolders.bind(this);
        this.insertTableData = this.insertTableData.bind(this);
    }

    componentDidMount() {
        this.refreshTopHolders();
    }

    refreshTopHolders() {
        // Set to isLoading
        this.setState({
            loadingHolders: true,
        });
        // Get top holders
        getYLDYTokenTopHoldersAsync(this.state.limit, this.state.minimumYldy, null).then((topHolders)  => {
            this.setState({
                loadingHolders: false,
                topHolders: topHolders,
            }, () => {
                this.insertTableData();
            });
        });
    }

    insertTableData () {
        if (this.state.topHolders) {
            // Sort by highest amount
            let sort = this.state.topHolders.sort((a, b) => {
                if (a.amount > b.amount)
                    return -1;
                else if (a.mount < b.amount)
                    return 1;
                return 0;
            });
            // Set tableData
            this.setState({
                topHoldersTableData: sort,
            });
        }
    }

    render() {
        return (
            <div className="py-3">
                {/* Top YLDY Holders */}
                <h3 className="yldy-title">
                    Top YLDY Holders
                </h3>
                <p>
                    Displaying the top { this.state.topHoldersTableData?.length ?? "" } <b>holders</b> of YLDY on the Algorand blockchain, 
                    that have more than { formatNumber(fromMicroValue(this.state.minimumYldy)) } YLDY.
                    {' '}
                    <br />
                    Press the <FontAwesomeIcon icon={faArrowRight} className="mx-2" /> buttons to see how much ALGO and YLDY the address has staked in the NLL or YLDY Staking pools.
                </p>
                {/* Loading spinner for table data */}
                {
                    this.state.loadingHolders && (
                        <div className="d-flex">
                            <div className="mx-auto h-100 d-flex">
                                <FontAwesomeIcon 
                                        icon={faSpinner} 
                                        size="2x" 
                                        spin 
                                    />
                                <div className="mx-3 my-auto">
                                    This may take some time...
                                </div>
                            </div>
                        </div>
                    )
                }
                <div 
                    className="yldy-scrollbar"
                    style={{
                        maxHeight: "450px",
                    }}
                >
                {
                    this.state.topHoldersTableData && (
                        <Table 
                            bordered 
                            size="sm"
                            responsive="md"
                            className="m-0 all-text-white"
                            >
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Algorand Address</th>
                                    <th className="text-right">
                                        Total YLDY in Wallet
                                        <img 
                                            className="mx-2 my-auto"
                                            src={YLDY_ICON} 
                                            height="19" 
                                            width="19" 
                                            alt="Yieldly icon" 
                                            />
                                    </th>
                                    <th
                                        className="text-right">
                                            ALGO in NLL
                                        <img
                                            className="mx-2 my-auto"
                                            src={ALGO_ICON}
                                            height="19"
                                            width="19"
                                            alt="Algorand Icon"
                                            />
                                    </th>
                                    <th className="text-right">
                                        YLDY staked
                                        <img 
                                            className="mx-2 my-auto"
                                            src={YLDY_ICON} 
                                            height="19" 
                                            width="19" 
                                            alt="Yieldly icon" 
                                            />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.topHoldersTableData.map((holder, index) => {
                                        return (
                                            <tr 
                                                key={`${index}-${holder}`}
                                                style={{
                                                    maxHeight: "400px",
                                                    overflowY: "auto",
                                                    width: "100%"
                                                }}>
                                                <td>{ index + 1}</td>
                                                <td>
                                                    <div className="d-flex w-100">
                                                        {
                                                            holder.address === this.state.yieldlyAddress
                                                            ?
                                                            <div className="mr-2">Yieldly:</div>
                                                            :
                                                            ""
                                                        }
                                                        <a 
                                                            className={ holder.address === this.state.yieldlyAddress ? "yldy-title" : "" }
                                                            href={ "https://algoexplorer.io/address/" + holder.address }> 
                                                            { shortenAddress(holder.address, 4) }
                                                        </a>
                                                        <Button 
                                                            className="ml-auto mx-2 p-0"
                                                            variant="white" 
                                                            onClick={() => copyToClipboard(holder.address)}>
                                                            <FontAwesomeIcon 
                                                                color="white"
                                                                icon={faCopy} />
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td 
                                                    className="text-right"
                                                    title={ fromMicroValue(holder.amount) }>
                                                    { 
                                                        formatNumber(
                                                            fromMicroValue( 
                                                                holder.amount
                                                            ).toFixed(3)
                                                        ) 
                                                    }
                                                </td>
                                                <td 
                                                    className="text-right">
                                                    <Button
                                                        className="px-2 py-0"
                                                            title="Click to retrieve address' staked ALGO"
                                                            data-wallet-address={holder.address}
                                                            onClick={(e) => {
                                                                while (e.target.localName !== "button") {
                                                                    e.target = e.target.parentNode;
                                                                }
                                                                getYLDYStaked(e.target, e.target.dataset.walletAddress, constants.NO_LOSS_LOTTERY_APP_ID);
                                                            }}>
                                                            <FontAwesomeIcon 
                                                                icon={faArrowRight}
                                                                />
                                                    </Button>
                                                </td>
                                                <td className="text-right">
                                                    <Button 
                                                        className="px-2 py-0"
                                                        title="Click to retrieve address' staked YLDY"
                                                        data-wallet-address={holder.address}
                                                        onClick={(e) => {
                                                            while (e.target.localName !== "button") {
                                                                e.target = e.target.parentNode;
                                                            }
                                                            getYLDYStaked(e.target, e.target.dataset.walletAddress, constants.YLDY_STAKING_APP_ID);
                                                        }}>
                                                            <FontAwesomeIcon 
                                                                icon={faArrowRight}
                                                                />
                                                    </Button>
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
            </div>
        );
    }
}

export default TopYLDYHolders;