import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Card, Col, Pagination, Row, Table } from 'react-bootstrap';
import { constants } from '../../../js/consts';
import { getAllStakingData } from '../../../js/FirebaseAPI';
import { shortenAddress, fromMicroFormatNumber} from '../../../js/utility';

import YLDY_ICON from "../../../svg/yldy-icon.svg";
import ALGO_ICON from "../../../svg/algo-icon.svg";

const YLDY_ASSET_ID = 226701642;

function tryGetStateValue(addrData, key, defaultVal = 0) {
    if (addrData && addrData.stateData) {
        let foundVal = addrData.stateData[key];
        return isNaN(foundVal) ? defaultVal : foundVal;
    }
    return defaultVal;
}

function analyseStakingData (stakingData) {
    let totalStakedALGO = 0;
    let totalStakedYLDY = 0
    for (let addrData of stakingData.yieldlyData) {
        totalStakedALGO += tryGetStateValue(addrData, constants.NO_LOSS_LOTTERY_APP_ID);
        totalStakedYLDY += tryGetStateValue(addrData, constants.YLDY_STAKING_APP_ID);
    }

    return [
        {
            title: "Totals",
            infos: [
                { key: "ALGO Staked", value: fromMicroFormatNumber(totalStakedALGO, 3) },
                { key: "YLDY Staked", value: fromMicroFormatNumber(totalStakedYLDY, 3) }
            ]
        },
        {
            title: "Averages",
            infos: [
                { key: "ALGO Staked", value: fromMicroFormatNumber(totalStakedALGO / stakingData.yieldlyData.length, 3) },
                { key: "YLDY Staked", value: fromMicroFormatNumber(totalStakedYLDY / stakingData.yieldlyData.length, 3) },
            ]
        }
    ]
}

class TopStakers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stakingData: null,
            sortBy: 'staked-yldy',
            loadingStakers: false,

            useFirebaseData: true,

            pageActive: 0,
            pageSegment: 1000,
        };
    }

    componentDidMount() {
        if (this.state.useFirebaseData) {
            this.setState({
                loadingStakers: true,
            });
            getAllStakingData((stakingData) => {
                this.setState({
                    stakingData: stakingData,
                    loadingStakers: false,
                });
            });
        }
    }

    render() {
        let paginationTotal = 0;
        let paginationItms = [];
        if (this.state.stakingData) {
            // Total is all entries / segmenting of pagination
            paginationTotal = Math.floor(this.state.stakingData.yieldlyData.length / this.state.pageSegment);
            // Add 1 for last set of 1000 data entries
            paginationTotal += 1;
            // Create all pagination items
            for (let i = 0; i < paginationTotal; i++) {
                paginationItms.push(
                    <Pagination.Item 
                        key={ i }
                        active={ i === this.state.pageActive }
                        onClick={(e) => this.setState({ pageActive: parseInt(e.target.innerText) })}>
                        { i }
                    </Pagination.Item>,
                )
            }
        }


        return (
            <div className="py-3">
                <h3 className="yldy-title">
                    Yieldly Staking Statistics
                </h3>
                <p>
                    A snapshot of all wallets that have opted-in to the YLDY asset and have staked in a Yieldly application on the blockchain. 
                    This data is not live and requires manually updating by myself, 
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
                {
                    this.state.stakingData && paginationTotal && (
                        <div className="w-100 text-right">
                            <Pagination>
                                { paginationItms }
                            </Pagination>
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
                                        <th>#</th>
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
                                            let rangeStart = this.state.pageSegment * (this.state.pageActive);
                                            let rangeEnd = (this.state.pageSegment * (this.state.pageActive + 1)) - 1;
                                            if (index < rangeStart || index > rangeEnd) {
                                                return null;
                                            }
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
                                                        { index + 1 }
                                                    </td>
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
                {
                    this.state.stakingData && (
                        <Row className="py-3">
                            {
                                analyseStakingData(this.state.stakingData)
                                .map((data, index) => {
                                    return (
                                        <Col>
                                            <Card
                                                key={"staking-data-infos-" + index}
                                                border="primary"
                                                className="rounded bg-dark my-2">
                                                <Card.Body>
                                                    <Card.Title 
                                                        className="yldy-title">
                                                        { data.title }
                                                    </Card.Title>
                                                    <div>
                                                        {
                                                            data.infos.map((info, index) => {
                                                                return (
                                                                    <div
                                                                        key={"data-infos" + index}>
                                                                        <b>{ info.key + ": "}</b>
                                                                        <span>{ info.value }</span>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    )
                }
            </div>
        );
    }
}

export default TopStakers;