import { faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { 
    Container, 
    Table,
    Row,
    Col,
    Button
} from 'react-bootstrap';
import { getUserStateValues, getYLDYTokenTopHoldersAsync } from '../../js/AlgoExplorerAPI';
import { 
    formatNumber, 
    fromMicroFormatNumber, 
    fromMicroValue, 
    shortenAddress, 
    toMicroValue 
} from '../../js/utility';
import { constants } from "../../js/consts";
import { getApplicationData } from '../../js/FirebaseAPI';

import YLDY_ICON from "../../svg/yldy-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";

import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

function getYLDYStaked(btn, walletAddr) {
    if (walletAddr) {
        getUserStateValues(walletAddr, constants.YLDY_STAKING_APP_ID, (data) => {
            let btnParent = btn.parentNode;
            if (data) {
                btnParent.innerHTML = fromMicroFormatNumber(data.userAmount, 2);
            } else {
                btnParent.innerHTML = "No value found.";
            }
        });
    }
}

function calcDifference (initial, final) {
    return final - initial;
}

function calcPercentDiff(initial, final) {
    return 100 * ((final - initial) / Math.abs(initial));
}

function IndividualStatistic (props) {
    return (
        <div className={`text-center ${props.className ? props.className : ""}`}>
            <p className="lead">
                { props.title }
            </p>
            <h1>
                {
                    props.icon && (
                        <img
                            src={ props.icon }
                            height="25"
                            width="25"
                            alt="YLDY"
                            className="mx-2"
                            />
                    )
                }
                {
                    formatNumber( props.value )
                }
            </h1>
            {
                props.footerText && (
                    <p className="small text-muted">
                        { props.footerText }
                    </p>
                )
            }
        </div>
    );
}

class YLDYAssetStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            limit: null,
            minimumYldy: toMicroValue(1),

            // All holders, original data from API
            topHolders: null,
            // Limit amount when retrieving firebase data
            // 6 entries in a day, 7 days in a week
            dbWeekLimit: 6 * 7,
            // NLL db data for the week
            nllWeekData: null,
            // YLDY Staking db data for week
            yldyWeekData: null,
            // Current table data to display
            topHoldersTableData: null,

            nllDifference: null,
            yldyDifference: null,

            tableLimit: null,
        };

        this.refreshTopHolders = this.refreshTopHolders.bind(this);
        this.refreshNLLData = this.refreshNLLData.bind(this);
        this.refreshYLDYStakingData = this.refreshYLDYStakingData.bind(this);
        this.insertTableData = this.insertTableData.bind(this);
    }

    componentDidMount() {
        this.refreshTopHolders();
        this.refreshNLLData();
        this.refreshYLDYStakingData();
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

    refreshNLLData() {
        getApplicationData(constants.NO_LOSS_LOTTERY_APP_ID, this.state.dbWeekLimit, (data) => {
            this.setState({
                nllWeekData: data,
            }, () => {
                let allKeys = Object.keys(this.state.nllWeekData);
                let first = this.state.nllWeekData[allKeys[0]];
                let last = this.state.nllWeekData[allKeys[allKeys.length - 1]];
                let ticketDifference = calcDifference(first.GA, last.GA);
                let percentIncrease = calcPercentDiff(first.GA, last.GA);
                this.setState({
                    nllDifference: {
                        first: first.GA,
                        last: last.GA,
                        amount: ticketDifference,
                        percent: percentIncrease,
                    }
                });
            });
        });
    }

    refreshYLDYStakingData() {
        getApplicationData(constants.YLDY_STAKING_APP_ID, this.state.dbWeekLimit, (data) => {
            this.setState({
                yldyWeekData: data,
            }, () => {
                let allKeys = Object.keys(this.state.yldyWeekData);
                let first = this.state.yldyWeekData[allKeys[0]];
                let last = this.state.yldyWeekData[allKeys[allKeys.length - 1]];
                let ticketDifference = calcDifference(first.GA, last.GA);
                let percentIncrease = calcPercentDiff(first.GA, last.GA);
                this.setState({
                    yldyDifference: {
                        amount: ticketDifference,
                        first: first.GA,
                        last: last.GA,
                        percent: percentIncrease,
                    },
                });
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
            <div className="bg-dark py-2 all-text-white">
                <Container className="py-5">
                    {/* Moving averages */}
                    <div className="py-3">
                        <Row className="py-3">
                            <Col lg="4">
                                <h2 className="yldy-title">No Loss Lottery</h2>
                                <IndividualStatistic
                                    className="my-4"
                                    title="ALGO (tickets) deposited in last 7 days"
                                    value={ 
                                        this.state.nllDifference
                                        ?
                                        fromMicroFormatNumber(this.state.nllDifference?.amount, 0) 
                                        :
                                        "0"
                                    }
                                    icon={ ALGO_ICON }
                                    />
                                <IndividualStatistic
                                    className="my-4"
                                    title="Growth (%) in last 7 days"
                                    value={    
                                        this.state.nllDifference 
                                        ?
                                        this.state.nllDifference?.percent.toFixed(3) + "%" 
                                        :
                                        "0"
                                    }
                                    footerText={ 
                                        this.state.nllDifference
                                        ?
                                        `${ fromMicroFormatNumber( this.state.nllDifference?.first, 0 ) } ALGO -> ${ fromMicroFormatNumber( this.state.nllDifference?.last, 0 ) } ALGO` 
                                        :
                                        ""
                                    }
                                    />
                                
                            </Col>
                            <Col lg="8">
                                <AppStateHistoryGraph
                                    applicationID={ constants.NO_LOSS_LOTTERY_APP_ID }
                                    dataKey="GA"
                                    valueType="ALGO"
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of ALGO"
                                    dataTitle="Total ALGO entered into NLL by everybody (GA)"
                                    lineColor="#6cdef9"
                                    lineHandleColor="grey"
                                    />
                            </Col>
                        </Row>

                        

                        <Row className="py-3">
                            <Col lg="4">
                                <h2 className="yldy-title">YLDY Staking</h2>
                                <IndividualStatistic 
                                    className="my-4"
                                    title="YLDY staked in last 7 days"
                                    value={ 
                                        this.state.yldyDifference
                                        ?
                                        fromMicroFormatNumber(this.state.yldyDifference?.amount, 0) 
                                        :
                                        "0"
                                    }
                                    icon={ YLDY_ICON }
                                    />
                                <IndividualStatistic
                                    className="my-4" 
                                    title="Growth (%) in last 7 days"
                                    value={ 
                                        this.state.yldyDifference
                                        ?
                                        this.state.yldyDifference?.percent.toFixed(3) + "%"
                                        :
                                        "0"
                                    }
                                    footerText={ 
                                        this.state.yldyDifference
                                        ?
                                        `${ fromMicroFormatNumber(this.state.yldyDifference?.first, 0) }  YLDY -> ${ fromMicroFormatNumber(this.state.yldyDifference?.last, 0) } YLDY` 
                                        :
                                        ""
                                    }
                                    />
                            </Col>
                            <Col lg="8">
                                <AppStateHistoryGraph
                                    applicationID={ constants.YLDY_STAKING_APP_ID }
                                    dataKey="GA"
                                    valueType="YLDY"
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of YLDY"
                                    dataTitle="Total YLDY being staked by everybody (GA)"
                                    />
                            </Col>
                        </Row>
                    </div>
                </ Container>

                {/* Divider */}
                <div 
                    className="border-top border-primary my-3 pb-3"
                    />

                <Container>
                    {/* Top Holders parent */}
                    <div className="py-3">
                        {/* Top YLDY Holders */}
                        <h3 className="yldy-title">
                            Top YLDY Holders
                        </h3>
                        <p>
                            Displaying the top '{this.state.topHoldersTableData?.length ?? "-1"}' <b>holders</b> of YLDY on the Algorand blockchain, 
                            that have more than '{formatNumber(fromMicroValue(this.state.minimumYldy))}' YLDY.
                            {' '}
                            <br />
                            Press the <FontAwesomeIcon icon={faArrowRight} className="mx-2" /> button to see how much YLDY the address has staked.
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
                                                Total YLDY
                                                <img 
                                                    className="mx-2 my-auto"
                                                    src={YLDY_ICON} 
                                                    height="19" 
                                                    width="19" 
                                                    alt="Yieldly icon" 
                                                    />
                                            </th>
                                            <th className="text-right">
                                                YLDY Staked
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
                                                            <a href={ "https://algoexplorer.io/address/" + holder.address }> 
                                                                { shortenAddress(holder.address, 4) }
                                                            </a>
                                                        </td>
                                                        <td className="text-right">
                                                            { 
                                                                formatNumber(
                                                                    fromMicroValue( 
                                                                        holder.amount
                                                                    ).toFixed(3)
                                                                ) 
                                                            }
                                                        </td>
                                                        <td className="text-right">
                                                            <Button 
                                                                className="px-2 py-0"
                                                                data-wallet-address={holder.address}
                                                                onClick={(e) => {
                                                                    while (e.target.localName !== "button") {
                                                                        e.target = e.target.parentNode;
                                                                    }
                                                                    getYLDYStaked(e.target, e.target.dataset.walletAddress) 
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
                </Container>
            </div>
        );
    }
}

export default YLDYAssetStats;