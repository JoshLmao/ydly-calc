import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { getApplicationData } from '../../js/FirebaseAPI';
import { formatNumber, fromMicroFormatNumber, getBestGraphHeight } from '../../js/utility';
import { unitToIcon } from "../../js/consts";


import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

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

// Amount of db data entries in one day.
// atm, once every 4 hours. 6 times total in a day
const FIREBASE_DATA_ENTRIES_ONE_DAY = 6;

class PoolStatistics extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appID: props.appID ?? null,

            stakeUnit: props.stakeUnit ?? null,
            rewardUnit: props.rewardUnit ?? null,

            stakeContractKey: props.stakeContractKey ?? "GA",
            rewardContractKey: props.rewardContractKey ?? "TYUL",

            stakeConfig: props.stakeConfig ?? null,
            rewardsConfig: props.rewardsConfig ?? null,

            title: props.title ?? "Pool Statistics",
            rewardShortDesc: props.rewardShortDesc ?? null,

            // Amount in days to get data for the current period
            periodDuration: 7,

            periodDBData: null,
            periodDifference: null,
        };
        
        this.refreshData = this.refreshData.bind(this);
    }

    componentDidMount() {
        this.refreshData();
    }

    refreshData() {
        getApplicationData(this.state.appID, this.state.periodDuration * FIREBASE_DATA_ENTRIES_ONE_DAY, (data) => {
            if (data) {
                this.setState({
                    periodDBData: data,
                }, () => {
                    // Check database object contains the specific key we want to plot
                    if (this.state.periodDBData.length > 0) {
                        let specificValue = this.state.periodDBData[0][this.state.stakeContractKey];
                        if (!specificValue) {
                            console.error(`Database data for app id '${this.state.appID}' doesn't contain key '${this.state.stakeContractKey}'`);
                            return;
                        }
                    }

                    // Calculate difference from start and end db data
                    let allKeys = Object.keys(this.state.periodDBData);
                    let first = this.state.periodDBData[allKeys[0]];
                    let last = this.state.periodDBData[allKeys[allKeys.length - 1]];
                    let ticketDifference = calcDifference(first[this.state.stakeContractKey], last[this.state.stakeContractKey]);
                    let percentIncrease = calcPercentDiff(first[this.state.stakeContractKey], last[this.state.stakeContractKey]);
                    this.setState({
                        periodDifference: {
                            first: first[this.state.stakeContractKey],
                            last: last[this.state.stakeContractKey],
                            amount: ticketDifference,
                            percent: percentIncrease,
                        }
                    });
                });
            }
        });
    }

    render() {
        return (
            <div>
                <h2 className="yldy-title">{ this.state.title }</h2>
                    {
                        this.state.stakeConfig && this.state.stakeConfig.length > 0 && this.state.stakeConfig.map((config, index) => {
                            return (
                                <Row 
                                    className="py-3"
                                    key={`stake-conf-${index}`}>
                                    <Col lg="4">
                                        <IndividualStatistic
                                            className="my-4"
                                            title={ `${config.unit} deposited in last ${this.state.periodDuration} days` }
                                            value={ 
                                                this.state.periodDifference
                                                ?
                                                fromMicroFormatNumber(this.state.periodDifference?.amount, 0) 
                                                :
                                                "0"
                                            }
                                            icon={ unitToIcon( config.unit ) }
                                            />
                                        <IndividualStatistic
                                            className="my-4"
                                            title={ `Growth (%) in last ${this.state.periodDuration} days` }
                                            value={    
                                                this.state.periodDifference 
                                                ?
                                                this.state.periodDifference?.percent.toFixed(3) + "%" 
                                                :
                                                "0"
                                            }
                                            footerText={ 
                                                this.state.periodDifference
                                                ?
                                                `${ fromMicroFormatNumber( this.state.periodDifference?.first, 0 ) } ${config.unit} -> ${ fromMicroFormatNumber( this.state.periodDifference?.last, 0 ) } ${config.unit}` 
                                                :
                                                ""
                                            }
                                            />
                                    </Col>
                                    <Col lg="8">
                                        <AppStateHistoryGraph
                                            applicationID={ this.state.appID }
                                            dataKey={ config.key }
                                            valueType={ config.unit }
                                            xAxisLabel="Date/Time of Record"
                                            yAxisLabel={ `Amount of ${config.unit}` }
                                            dataTitle={ `Total ${config.unit} entered into pool (${config.key})` }
                                            lineColor={ config.lineColor }
                                            lineHandleColor={ config.lineColor }
                                            graphHeight={ getBestGraphHeight() }
                                            allowCustomTimePeriods={ true }
                                            dataLimit={ this.state.dbWeekLimit }
                                            />
                                    </Col>
                                </Row>
                            )
                        })
                    }
                <Row
                    md={ this.state.rewardsConfig && this.state.rewardsConfig.length > 1 ? 2 : 1 }>
                    {
                        this.state.rewardsConfig && this.state.rewardsConfig.length > 0 && this.state.rewardsConfig.map((config, index) => {
                            return (
                                <Col
                                    key={`reward-${index}`}>
                                    <AppStateHistoryGraph
                                        applicationID={ this.state.appID }
                                        dataKey={ config.key }
                                        valueType={ config.unit }
                                        sectionShortDesc={ 
                                            config.graphDescription 
                                            ??
                                            `History of the global unlock rewards. This plots the '${config.key}' value in the application's global state over time.`
                                        }
                                        sectionTitle="Global Rewards History"
                                        xAxisLabel="Date/Time of Record"
                                        yAxisLabel={` Amount of ${config.unit}` }
                                        dataTitle={ `${config.unit} in Global Unlock Rewards (${config.key})` }
                                        graphHeight={ getBestGraphHeight() }
                                        lineColor={ config.lineColor }
                                        lineHandleColor={ config.lineColor }
                                        displayAverage
                                        dataLimit={ this.state.dbWeekLimit }
                                        decimals={ config.decimals }
                                        />
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        );
    }
}

export default PoolStatistics;