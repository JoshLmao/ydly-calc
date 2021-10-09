import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Pagination, Row, Col, Card, Button, Container } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

import { constants } from '../../js/consts';
import { getAllStakingData } from '../../js/FirebaseAPI';
import { shortenAddress, fromMicroFormatNumber, appIDToName } from '../../js/utility';

import NEW_STAKE_DATA from "../../new-stake-data-all.json";

import YLDY_ICON from "../../svg/yldy-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";

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
function analyseStakingData (columns, stakingData) {

    let totalStakedALGO = 0;
    let totalStakedYLDY = 0
    for (let addrData of stakingData.snapshotData) {
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
            // Is staking data current being loaded?
            loadingStakers: false,
            // Should the staking data be loaded from Firebase?
            useFirebaseData: true,
            // Height of the column header images for ALGO and YLDY 
            headerImageHeight: 21,
        };

        this.onGetStakingData = this.onGetStakingData.bind(this);
        this.generateTableData = this.generateTableData.bind(this);
    }

    onGetStakingData() {
        if (this.state.useFirebaseData) {
            // this.setState({
            //     loadingStakers: true,
            // });
            // getAllStakingData((stakingData) => {
            //     this.setState({
            //         stakingData: stakingData,
            //         loadingStakers: false,
            //     }, () => this.generateTableData() );
            // });
            this.setState({
                stakingData: NEW_STAKE_DATA,
                loadingStakers: false,
            }, () => this.generateTableData() );
        }
    }

    generateTableData () {
        if (this.state.stakingData) {
            let columns = [
                {
                    dataField: 'address',
                    text: "Address",
                },
            ];
            let data = [];

            for (let dataInfo of this.state.stakingData.snapshotData) {
                let tableDataInfo = {};
                tableDataInfo.address = shortenAddress(dataInfo.address, 4);

                for (let stateData of dataInfo.stateData) {
                    let appIDs = Object.keys(stateData);
                    for (let appID of appIDs) {

                        // If column doesnt contain a dataField of this appID, add it
                        if (columns.filter((obj) => obj.dataField === appID ).length <= 0) {
                            columns.push({
                                dataField: appID,
                                text: appIDToName(parseInt(appID)),
                                sort: true
                            });
                        }
    
                        tableDataInfo[appID.toString()] = stateData[appID].UA; // UA value
                    }
                }

                data.push(tableDataInfo);
            }

            this.setState({
                tableColumns: columns,
                tableData: data,
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
                        onClick={(e) => this.setState({ pageActive: parseInt(e.target.innerText) - 1 })}
                        >
                        { i + 1 }
                    </Pagination.Item>,
                )
            }
        }


        return (
            <div className="py-5 bg-dark text-white">
                <Container>
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
                        !this.state.stakingData && !this.state.loadingStakers && (
                            <Button
                                onClick={() => this.onGetStakingData() }>
                                Retrieve top stakers data
                            </Button>
                        )
                    }
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
                </Container>

                <Container
                    className="my-3" 
                    fluid
                    >
                <div 
                    className="yldy-scrollbar mx-5"
                    style={{
                        maxHeight: "20vm",
                        overflowX: "hidden"
                    }}
                    >
                    {
                        this.state.tableData && this.state.tableColumns && (
                            <BootstrapTable
                                bootstrap4
                                keyField="address"
                                data={ this.state.tableData }
                                columns={ this.state.tableColumns }
                                pagination={ paginationFactory({
                                    sizePerPage: 100,
                                }) }
                                />
                        )
                    }
                </div>
                {
                    this.state.stakingData && (
                        <Row className="py-3">
                            {
                                //analyseStakingData(this.state.stakingData)
                                [ ]
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
                </Container>
            </div>
        );
    }
}

export default TopStakers;