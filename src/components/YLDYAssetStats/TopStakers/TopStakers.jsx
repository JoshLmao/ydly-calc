import { faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Card, Col, Pagination, Row, Table, Button } from 'react-bootstrap';

import { constants } from '../../../js/consts';
import { getAllStakingData } from '../../../js/FirebaseAPI';
import { shortenAddress, fromMicroFormatNumber} from '../../../js/utility';

import YLDY_ICON from "../../../svg/yldy-icon.svg";
import ALGO_ICON from "../../../svg/algo-icon.svg";

// Tries to get a value from the addrData.
// First child key should be either "assets" or "stateData"
// Second child key expected to be child key of firstChildKey
function tryGetStateValue(addrData, firstChildKey, secondChildKey, defaultVal = 0) {
    if (addrData) {
        let firstChild = addrData[firstChildKey];
        if (firstChild) {
            let foundVal = firstChild[secondChildKey];
            return isNaN(foundVal) ? defaultVal : foundVal;
        }
    }
    return defaultVal;
}

// Analyse all staking data and get stats
function analyseStakingData (stakingData) {
    let totalStakedALGO = 0;
    let totalStakedYLDY = 0
    for (let addrData of stakingData.yieldlyData) {
        totalStakedALGO += tryGetStateValue(addrData, "stateData", constants.NO_LOSS_LOTTERY_APP_ID);
        totalStakedYLDY += tryGetStateValue(addrData, "stateData", constants.YLDY_STAKING_APP_ID);
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
            // Original staking data
            stakingData: null,
            // Staking data sorted
            sortedStakingData: null,
            // Sort by code to use
            sortBy: 'staked-yldy',
            // Is staking data current being loaded?
            loadingStakers: false,

            // Should the staking data be loaded from Firebase?
            useFirebaseData: true,

            // Current active page in table pagination
            pageActive: 0,
            // How much to segment the data up between pagination
            pageSegment: 1000,
            // Height of the column header images for ALGO and YLDY 
            headerImageHeight: 21,
        };

        this.onUpdateSort = this.onUpdateSort.bind(this);
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
                }, () => this.onUpdateSort() );
            });
        }
    }

    onUpdateSort() {
        if (this.state.stakingData) {
            let sorted = [];
            switch (this.state.sortBy) {
                case "wallet-algo":
                    {
                        sorted = this.state.stakingData.yieldlyData
                                    .sort((a,b) => tryGetStateValue(b, "assets", "ALGO") - tryGetStateValue(a, "assets", "ALGO"));
                        break;
                    }
                case "wallet-yldy":
                    {
                        sorted = this.state.stakingData.yieldlyData
                                    .sort((a,b) => tryGetStateValue(b, "assets", constants.YLDY_ASSET_ID) - tryGetStateValue(a, "assets", constants.YLDY_ASSET_ID));
                        break;
                    }
                case "staked-algo":
                    {
                        sorted = this.state.stakingData.yieldlyData
                                    .sort((a,b) => tryGetStateValue(b, "stateData", constants.NO_LOSS_LOTTERY_APP_ID) - tryGetStateValue(a, "stateData", constants.NO_LOSS_LOTTERY_APP_ID));
                        break;
                    }
                case "staked-yldy":
                    {
                        sorted = this.state.stakingData.yieldlyData
                                    .sort((a,b) => tryGetStateValue(b, "stateData", constants.YLDY_STAKING_APP_ID) - tryGetStateValue(a, "stateData", constants.YLDY_STAKING_APP_ID));
                        break;
                    }
                default:
                    {
                        // Unknown key, use default data
                        sorted = this.state.stakingData;
                        break;
                    }
            }
            
            this.setState({
                sortedStakingData: sorted,
            });
        }
    }

    render() {
        let paginationTotal = 0;
        let paginationItms = [];
        if (this.state.sortedStakingData) {
            // Total is all entries / segmenting of pagination
            paginationTotal = Math.floor(this.state.sortedStakingData.length / this.state.pageSegment);
            // Add 1 for last set of 1000 data entries
            paginationTotal += 1;
            // Create all pagination items
            for (let i = 0; i < paginationTotal; i++) {
                paginationItms.push(
                    <Pagination.Item 
                        key={ "pagination-key-" + i }
                        active={ i === this.state.pageActive }
                        onClick={(e) => this.setState({ pageActive: parseInt(e.target.innerText) - 1 })}>
                        { i + 1 }
                    </Pagination.Item>,
                )
            }
        }


        return (
            <div className="py-3">
                <h2 className="yldy-title">
                    Yieldly Staking Statistics
                </h2>
                <p>
                    A snapshot of all wallets that have opted-in to the YLDY asset and have staked in a Yieldly application on the blockchain. 
                    This data is not live and requires manually updating by myself, 
                    which I aim to do every Friday.
                    <br/>
                    <small className="text-muted">
                        If the data out of date by more than a week, please send me tweet to remind me! 
                        <a 
                            className="mx-2"
                            href="https://twitter.com/joshlmao">
                            @JoshLmao
                        </a>
                    </small>
                    <br/>
                    {
                        this.state.stakingData && (
                            <>
                                The current snapshot is from { new Date(this.state.stakingData.snapshotEpoch * 1000).toLocaleString() }
                            </>
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
                    this.state.sortedStakingData && paginationTotal && (
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
                        this.state.sortedStakingData && (
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
                                        {
                                            [
                                                { 
                                                    title: "Wallet: ALGO",
                                                    src: ALGO_ICON,
                                                    alt: "Algorand asset icon",
                                                    sortKey: "wallet-algo",
                                                },
                                                {
                                                    title: "Wallet: YLDY",
                                                    src: YLDY_ICON,
                                                    alt: "Yieldly asset icon",
                                                    sortKey: "wallet-yldy",
                                                },
                                                {
                                                    title: "NLL ALGO",
                                                    src: ALGO_ICON,
                                                    alt: "Algorand asset icon",
                                                    sortKey: "staked-algo",
                                                },
                                                {
                                                    title: "YLDY Staking",
                                                    src: YLDY_ICON,
                                                    alt: "Yieldly asset icon",
                                                    sortKey: "staked-yldy",
                                                }
                                            ]
                                            .map((data, index) => {
                                                return (
                                                    <th
                                                        key={ "headings-col-" + index }>
                                                        { data.title }
                                                        <img
                                                            className="mx-2"
                                                            src={ data.src } 
                                                            alt={ data.alt }
                                                            height={ this.state.headerImageHeight }
                                                            />
                                                        <Button
                                                            size="sm"
                                                            variant={ this.state.sortBy === data.sortKey ? "info" : "primary"}
                                                            onClick={(e) => this.setState({ sortBy: data.sortKey }, () => this.onUpdateSort() )}>
                                                            <FontAwesomeIcon
                                                                icon={faChevronUp} />
                                                        </Button>
                                                    </th>
                                                )
                                            })
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.sortedStakingData.map((data, index) => {
                                            // Determine index ranges for current pagination
                                            let rangeStart = this.state.pageSegment * (this.state.pageActive);
                                            let rangeEnd = (this.state.pageSegment * (this.state.pageActive + 1)) - 1;
                                            if (index < rangeStart || index > rangeEnd) {
                                                return null;
                                            }
                                            // Get values for current data address
                                            let walletAlgo = 0, walletYldy = 0, stakeAlgo = 0, stakeYldy = 0;
                                            // Extract values from "assets" if exists
                                            if (data.assets) {
                                                walletAlgo = data.assets.ALGO;

                                                let yldyAssetKey = constants.YLDY_ASSET_ID.toString();
                                                if (data.assets[yldyAssetKey]) {
                                                    walletYldy = data.assets[yldyAssetKey];
                                                }
                                            }
                                            // Extract values from "stateData" if exists
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
                                        <Col
                                            key={ "staking-data-" + index }>
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