import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { constants } from '../../../js/consts';
import { getAllStakingData } from '../../../js/FirebaseAPI';
import { shortenAddress, fromMicroValue, fromMicroFormatNumber } from '../../../js/utility';

import YLDY_ICON from "../../../svg/yldy-icon.svg";
import ALGO_ICON from "../../../svg/algo-icon.svg";

const YLDY_ASSET_ID = 226701642;

class TopStakers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stakingData: null,
            sortBy: 'staked-yldy',
            loadingStakers: false,
        };
    }

    componentDidMount() {
        this.setState({
            loadingStakers: true,
        });
        getAllStakingData((stakingData) => {
            this.setState({
                stakingData: stakingData,
                loadingStakers: false,
            });
        })
    }

    render() {
        return (
            <div className="py-3">
                <h3 className="yldy-title">
                    Yieldly Staking Statistics
                </h3>
                <p>
                    A snapshot of all wallets that have opted-in to the YLDY asset and their balances. This data is not live and requires manually updating by myself, 
                    which I aim to do every Friday.
                    <br />
                    {
                        this.state.stakingData && (
                            <p>
                                The current snapshot is from { new Date(this.state.stakingData.snapshotEpoch * 1000).toLocaleString() }
                            </p>
                        )
                    }
                </p>
                {
                    this.state.loadingStakers && (
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
                        this.state.stakingData && (
                            <Table
                                bordered
                                size="sm"
                                responsive="md"
                                className="m-0 all-text-white"
                                >
                                <thead>
                                    <tr>
                                        <th>Algorand Address</th>
                                        <th>
                                            Wallet: ALGO
                                            <img 
                                                className="mx-2"
                                                src={ALGO_ICON} 
                                                alt="Algorand asset icon" 
                                                height="23"
                                                />
                                        </th>
                                        <th>
                                            Wallet: YLDY
                                            <img 
                                                className="mx-2"
                                                src={YLDY_ICON} 
                                                alt="Yieldly asset icon" 
                                                height="23"
                                                />
                                        </th>
                                        <th>
                                            Staked: ALGO
                                            <img 
                                                className="mx-2"
                                                src={ALGO_ICON} 
                                                alt="Algorand asset icon" 
                                                height="23"
                                                />
                                        </th>
                                        <th>
                                            Staked: YLDY
                                            <img 
                                                className="mx-2"
                                                src={YLDY_ICON} 
                                                alt="Yieldly asset icon" 
                                                height="23"
                                                />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.stakingData.yieldlyData.map((data, index) => {
                                            let walletAlgo = 0, walletYldy = 0, stakeAlgo = 0, stakeYldy = 0;
                                            if (data.assets) {
                                                walletAlgo = data.assets.ALGO;

                                                let yldyAssetKey = YLDY_ASSET_ID.toString();
                                                if (data.assets[yldyAssetKey]) {
                                                    walletYldy = data.assets[yldyAssetKey];
                                                }
                                            }
                                            if (data.stateData) {
                                                let nllKey = constants.NO_LOSS_LOTTERY_APP_ID.toString();
                                                let yldyStakingKey = constants.YLDY_STAKING_APP_ID.toString();
                                                if (data.stateData[nllKey]) {
                                                    stakeAlgo = data.stateData[nllKey];
                                                }
                                                if (data.stateData[yldyStakingKey]) {
                                                    stakeYldy = data.stateData[yldyStakingKey];
                                                }
                                            }

                                            let emptyValue = "-";

                                            return (
                                                <tr
                                                    key={"staker-" + index}>
                                                    <td>
                                                        <a href={"https://algoexplorer.io/address/" + data.address}>
                                                            { shortenAddress(data.address, 4) }
                                                        </a>
                                                    </td>
                                                    <td
                                                        className="text-right">
                                                        { 
                                                            data.assets 
                                                            ? 
                                                            fromMicroFormatNumber(walletAlgo, 2) 
                                                            : 
                                                            emptyValue 
                                                        }
                                                    </td>
                                                    <td
                                                        className="text-right">
                                                        { 
                                                            data.assets 
                                                            ? 
                                                            fromMicroFormatNumber(walletYldy, 2) 
                                                            : 
                                                            emptyValue 
                                                        }
                                                    </td>
                                                    <td
                                                        className="text-right">
                                                        { 
                                                            data.stateData 
                                                            ? 
                                                            fromMicroFormatNumber(stakeAlgo, 2)
                                                            :
                                                            emptyValue
                                                        }
                                                    </td>
                                                    <td
                                                        className="text-right">
                                                        { 
                                                            data.stateData 
                                                            ?
                                                            fromMicroFormatNumber(stakeYldy, 2)
                                                            :
                                                            emptyValue
                                                        }
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

export default TopStakers;