import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Pagination, Row, Col, Card, Button, Container } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter, numberFilter } from 'react-bootstrap-table2-filter';

import { getAllStakingData } from '../../js/FirebaseAPI';
import { appIDToName, appIDToIcon, appIDToStakingUnit, unitToDecimals } from "../../js/consts";
import { shortenAddress, convertToMicroValue, formatNumber } from '../../js/utility';

function priceFormatter (column, colIndex, sortElement, filterElement, appID) {
    return (
      <div>
        <div
            className="d-flex">
            { column.text }
            <img
                alt="Primary Staking Currency"
                className="ml-2"
                src={ appIDToIcon(appID) }
                width="25"
                />
        </div>
        { sortElement }
        { filterElement }
      </div>
    );
}

function arrayContains(originalArray, entry) {
    if (originalArray.length <= 0)
        return false;

    return originalArray.filter((obj) => obj === entry ).length > 0;
}

// Analyse all staking data and get stats
function analyseStakingData (originalData, tableData) {
    if (!originalData || !tableData) {
        return null;
    }


    // All staking pools as keys (strings)
    let allStakingPoolsKeys = [];
    // Amount of account data to check to parse all app id's
    let safetyRange = 50;
    for (let i = 0; i < safetyRange; i++) {
        for (let app of originalData.snapshotData[i].stateData) {
            let appIDs = Object.keys(app);

            for (let appID of appIDs) {
                if (!arrayContains(allStakingPoolsKeys, appID)) {
                    allStakingPoolsKeys.push(appID);
                }
            }   
        }
    }
    

    let totalStakedMap = {};
    let stakedCountMap = {};
    for (let dataInfo of tableData) {
        
        for (let appID of allStakingPoolsKeys) {
            // If current address (dataInfo) has an amount staked in appID pool
            let amountStaked = dataInfo[appID];
            if (amountStaked) {

                // Add on amount person has staked
                if (totalStakedMap[appID]) {
                    totalStakedMap[appID] += amountStaked;
                } else {
                    totalStakedMap[appID] = amountStaked;
                }

                // increment counts of amount of stakers
                if (stakedCountMap[appID]) {
                    stakedCountMap[appID] += 1;
                } else {
                    stakedCountMap[appID] = 1;
                }
            }
        }
    }

    let totalsInfos = [];
    for (let appID of allStakingPoolsKeys) {

        let intAppID = parseInt(appID);

        let unitDecimals = unitToDecimals(appIDToStakingUnit(intAppID));
        let fixed = convertToMicroValue(totalStakedMap[appID], unitDecimals).toFixed(0);
        
        totalsInfos.push({
            key: `${appIDToName(intAppID)} Staked`,
            appID: appID,
            value: fixed
        });
    }

    let countInfos = [];
    for (let totalInfo of totalsInfos) {
        countInfos.push({
            key: `${appIDToName(parseInt(totalInfo.appID))} Stakers`,
            value: stakedCountMap[totalInfo.appID]
        });
    }

    let averagesInfos = [];
    for (let totalInfo of totalsInfos) {
        averagesInfos.push({
            key: totalInfo.key,
            value: (totalInfo.value / stakedCountMap[totalInfo.appID]).toFixed(2),
        });
    }

    return [
        {
            title: "Totals",
            desc: "Total amount staked in each pool",
            infos: totalsInfos,
        },
        {
            title: "Unique Stakers",
            desc: "Amount of unique addresses in each staking pool",
            infos: countInfos,
        },
        {
            title: "Averages",
            desc: "Total staked divided by the amount of unique stakers. The average in each staking pool",
            infos: averagesInfos,
        }
    ];
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
            // Default app id to sort
            defaultAppIDSort: 233725850,
            // Amount of items/entries to display per page in table pagination
            entriesPerPage: 1000,
        };

        this.onGetStakingData = this.onGetStakingData.bind(this);
        this.generateTableData = this.generateTableData.bind(this);
    }

    onGetStakingData() {
        if (this.state.useFirebaseData) {
            this.setState({
                loadingStakers: true,
            });
            getAllStakingData((stakingData) => {
                this.setState({
                    stakingData: stakingData,
                    loadingStakers: false,
                }, () => this.generateTableData() );
            });
        }
    }

    generateTableData () {
        if (this.state.stakingData) {
            let columns = [
                {
                    // Blank column for row index
                    dataField: '',
                    text: "Index",
                    formatter: (cellData, row, rowIndex) => {
                        return rowIndex + 1;
                    },
                    headerStyle: (colum, colIndex) => {
                        return { 
                            width: '100px'
                        };
                    }
                },
                {
                    dataField: 'address',
                    text: "Address",
                    filter: textFilter(),
                    formatter: (cellData) => {
                        return (
                            <a
                                href={`https://algoexplorer.io/address/${cellData}`}
                                target="noreferrer"
                                >
                                { shortenAddress(cellData, 4) }
                            </a>
                        )
                    }
                },
            ];
            let data = [];

            for (let dataInfo of this.state.stakingData.snapshotData) {
                let tableDataInfo = {};
                tableDataInfo.address = dataInfo.address;

                for (let stateData of dataInfo.stateData) {
                    let appIDs = Object.keys(stateData);
                    for (let appID of appIDs) {

                        // If column doesnt contain a dataField of this appID, add it
                        if (columns.filter((obj) => obj.dataField === appID ).length <= 0) {
                            columns.push({
                                dataField: appID,
                                text: appIDToName(parseInt(appID)),
                                sort: true,
                                // Filter by number, original data value
                                filter: numberFilter(),
                                // Cell data formatter
                                formatter: (cellData) => {
                                    if (cellData) {
                                        let unitDecimals = unitToDecimals(appIDToStakingUnit(parseInt(appID)));
                                        let fixed = convertToMicroValue(cellData, unitDecimals).toFixed(0);
                                        return formatNumber(fixed);
                                    } else {
                                        return "None";
                                    }
                                },
                                // Style for column header
                                headerFormatter: (column, colIndex, { sortElement, filterElement }) => priceFormatter(column, colIndex, sortElement, filterElement, parseInt(appID)),
                                // Hover title formatting
                                title: (cell, row, rowIndex, colIndex) => {
                                    return `${cell ?  `${convertToMicroValue(cell, 6)} ${appIDToStakingUnit(parseInt(appID))}` : "No value | Address hasn't staked in pool"}`;
                                }
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
                        Yieldly Top Stakers
                    </h2>
                    <p>
                        A snapshot of all wallets that have opted-in to the YLDY asset and have staked in a Yieldly application on the blockchain. 
                        This data is not live and requires manually updating by myself, which I aim to do every Friday.
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

                <Container>
                    {
                        this.state.stakingData && this.state.tableData && (
                            <Row className="py-3">
                                {
                                    analyseStakingData(this.state.stakingData, this.state.tableData)
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
                                                        <p
                                                            className="text-muted">
                                                            { data.desc }
                                                        </p>
                                                        <div>
                                                            {
                                                                data.infos.map((info, index) => {
                                                                    return (
                                                                        <div
                                                                            key={"data-infos" + index}>
                                                                            <b>{ info.key + ": "}</b>
                                                                            <span>{ formatNumber(info.value) }</span>
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

                <Container
                    className="my-3" 
                    fluid
                    >
                    <div 
                        className="yldy-scrollbar mx-5 py-3"
                        style={{
                            maxHeight: "20vm",
                        }}
                        >
                        {
                            this.state.tableData && this.state.tableColumns && (
                                <BootstrapTable
                                    bootstrap4
                                    keyField="address"
                                    data={ this.state.tableData }
                                    columns={ this.state.tableColumns }
                                    sort={{ dataField: this.state.defaultAppIDSort.toString(), order: 'desc' }
                                    }
                                    pagination={ paginationFactory({
                                            sizePerPage: this.state.entriesPerPage,
                                        }) 
                                    }
                                    filter={ filterFactory() }
                                    />
                            )
                        }
                    </div>
                </Container>
            </div>
        );
    }
}

export default TopStakers;