import React, { Component } from 'react';
import { 
    Container, 
    Row,
    Col,
    Form
} from 'react-bootstrap';
import { 
    formatNumber, 
    fromMicroFormatNumber,
    getBestGraphHeight
} from '../../js/utility';
import { constants } from "../../js/consts";
import { getApplicationData } from '../../js/FirebaseAPI';

import YLDY_ICON from "../../svg/yldy-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";

import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';
import TopStakers from './TopStakers';

const DATA_ENTRIES_ONE_DAY = 6;

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
            // Limit amount when retrieving firebase data
            // 6 entries in a day, 7 days in a week
            dbWeekLimit: 6 * 7,
            // NLL db data for the week
            nllWeekData: null,
            // YLDY Staking db data for week
            yldyWeekData: null,

            nllDifference: null,
            yldyDifference: null,

            tableLimit: null,
        };

        this.refreshNLLData = this.refreshNLLData.bind(this);
    }

    componentDidMount() {
        this.refreshNLLData();
        this.refreshYLDYStakingData();
    }

    refreshNLLData() {
        getApplicationData(constants.NO_LOSS_LOTTERY_APP_ID, this.state.dbWeekLimit, (data) => {
            if (data) {
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
            }
        });
    }

    refreshYLDYStakingData() {
        getApplicationData(constants.YLDY_STAKING_APP_ID, this.state.dbWeekLimit, (data) => {
            if (data) {
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
            }
        });
    }

    render() {
        return (
            <div className="bg-dark py-2 all-text-white">
                <Container className="py-5">
                    <div>
                        <h2
                            className="yldy-title">
                            Yieldly Statistics
                        </h2>
                        <p className="lead">
                            Select a time period to display the historical data stored in the currently tracked pools. It may take a while to retrieve and display the data once changed.
                        </p>
                        <Row>
                            <Col
                                md="auto my-auto">
                                <Form.Label 
                                    className="lead font-weight-bold">
                                    Time Period:
                                </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control
                                    as="select"
                                    defaultValue="7"
                                    value={this.state.fbDataDayLimit}
                                    placeholder="Week value here"
                                    onChange={(e) => this.setState({
                                        dbWeekLimit: DATA_ENTRIES_ONE_DAY * e.target.value,
                                    }, () => {
                                        this.refreshNLLData();
                                        this.refreshYLDYStakingData();
                                    }) }>
                                    {
                                        [
                                            { val: 7, name: "week" },
                                            { val: 14, name: "fortnight" },
                                            { val: 30, name: "month" },
                                        ].map((value) => {
                                            return (
                                                <option 
                                                    value={value.val} 
                                                    key={value.name}>
                                                        { value.name }
                                                </option>
                                            );
                                        })
                                    }
                                </Form.Control>
                            </Col>
                        </Row>
                    </div>
                </Container>

                <div className="bg-dark border-top border-info py-3" />

                <Container>
                    <div className="py-3">
                        <Row className="py-3">
                            <Col lg="4">
                                <h2 className="yldy-title">No Loss Lottery</h2>
                                <IndividualStatistic
                                    className="my-4"
                                    title={ `ALGO (tickets) deposited in last ${this.state.dbWeekLimit / DATA_ENTRIES_ONE_DAY} days` }
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
                                    title={ `Growth (%) in last ${this.state.dbWeekLimit / DATA_ENTRIES_ONE_DAY} days` }
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
                                    graphHeight={ getBestGraphHeight() }
                                    allowCustomTimePeriods={ true }
                                    dataLimit={ this.state.dbWeekLimit }
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <AppStateHistoryGraph
                                    applicationID={ constants.NO_LOSS_LOTTERY_APP_ID }
                                    dataKey="TYUL"
                                    valueType="YLDY"
                                    sectionTitle="Global Rewards History"
                                    sectionShortDesc="History of the global unlock rewards for the No Loss Lottery."
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of YLDY"
                                    dataTitle="YLDY in Global Unlock Rewards (TYUL)"
                                    graphHeight={ getBestGraphHeight() }
                                    displayAverage
                                    displayDataKeyDesc
                                    dataLimit={ this.state.dbWeekLimit }
                                    />
                            </Col>
                        </Row>
                    </div>
                </Container>

                <div className="border-top border-primary" />

                <Container className="py-5">
                    <div>
                        <Row className="py-3">
                            <Col lg="4">
                                <h2 className="yldy-title">YLDY Staking</h2>
                                <IndividualStatistic 
                                    className="my-4"
                                    title={ `YLDY staked in last ${this.state.dbWeekLimit / DATA_ENTRIES_ONE_DAY} days` }
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
                                    title={ `Growth (%) in last ${this.state.dbWeekLimit / DATA_ENTRIES_ONE_DAY} days` }
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
                                    graphHeight={ getBestGraphHeight() }
                                    dataLimit={ this.state.dbWeekLimit }
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <AppStateHistoryGraph
                                    applicationID={constants.YLDY_STAKING_APP_ID}
                                    dataKey="TAP"
                                    valueType="ALGO"
                                    sectionTitle="ALGO Global Rewards History"
                                    sectionShortDesc="History of ALGO as a global reward in YLDY Staking."
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of ALGO"
                                    dataTitle="ALGO in Global Unlock Rewards (TAP)"
                                    decimalPrecision={2}
                                    lineColor="#6cdef9"
                                    lineHandleColor="grey"
                                    displayAverage
                                    displayDataKeyDesc
                                    graphHeight={ getBestGraphHeight() }
                                    dataLimit={ this.state.dbWeekLimit }
                                />
                            </Col>
                            <Col>
                                <AppStateHistoryGraph
                                    applicationID={constants.YLDY_STAKING_APP_ID}
                                    dataKey="TYUL"
                                    valueType="YLDY"
                                    sectionTitle="YLDY Global Rewards History"
                                    sectionShortDesc="History of YLDY as a global reward in YLDY Staking."
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of YLDY"
                                    dataTitle="YLDY in Global Unlock Rewards (TYUL)"
                                    displayAverage
                                    displayDataKeyDesc
                                    graphHeight={ getBestGraphHeight() }
                                    dataLimit={ this.state.dbWeekLimit }
                                />
                            </Col>
                        </Row>
                    </div>
                </ Container>

                {/* Divider */}
                <div 
                    className="border-top border-primary my-3 pb-3"
                    />

                {/* <Container>
                    <TopYLDYHolders
                        />
                </Container> */}
                <Container>
                    <TopStakers
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYAssetStats;