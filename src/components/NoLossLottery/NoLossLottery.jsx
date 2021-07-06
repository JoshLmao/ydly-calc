import React, { Component } from 'react';
import {
    Row, 
    Col,
    Form,
    Button
} from 'react-bootstrap';
import { 
    getContractValues, 
    getCurrentBlockTimestamp, 
    getUserStateValues 
} from '../../js/AlgoExplorerAPI';
import { 
    calculateClaimableUserRewards, 
    calculateGlobalStakingShares,
    calculateUserStakingShares,
    calculateYDLYRewards,
    calculateYDLYRewardsFromDayPeriod
} from '../../js/YDLYCalculation';
import {
    daysToUnix, 
    microAlgoToAlgo,
    fromMicroValue
} from "../../js/utility";

import "./NLL.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import YDLY_ICON from "../../svg/ydly-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";

// https://blog.abelotech.com/posts/number-currency-formatting-javascript/
function formatNumber(num) {
    if (num)
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    else 
        return null;
}

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Contract ID to use
            contractID: 233725844,

            fetchingUsrVars: false,
            fetchingGlobalVars: false,

            // User vars
            algoAddress: "PQZ46R4RKOST3NJQS6OHHRSUGC63LEISCQHKWO5OFHRPIC65JR4DK33AIY", //null,
            userTime: null,
            userAmount: null,
            // Contract global vars
            globalTime: null,
            globalAmount: null,
            nllGlobalUnlock: null,

            // Calculated values
            globalStakingShares: null,
            userStakingShares: null, 
            totalClaimableRewards: null,

            timePeriodDays: 1,
            currentBlockTimestamp: new Date().getTime(),

            totalUnlockRewards: 2362900,

            usrVarsErrorMsg: null,
        };

        this.fetchUserVariables = this.fetchUserVariables.bind(this);
        this.updateResults = this.updateResults.bind(this);
        this.onTimePeriodChanged = this.onTimePeriodChanged.bind(this);
    }

    componentDidMount() {
        // Load global values on mount, update state
        this.setState({
            fetchingGlobalVars: true,
        });
        getContractValues(this.state.contractID, (contractVars) => {
            this.setState({
                globalTime: contractVars.globalTime,
                globalAmount: contractVars.globalAmount,
                globalStakingShares: contractVars.globalStakingShares,

                nllGlobalUnlock: contractVars.totalYiedlyUnlock,

                fetchingGlobalVars: false,
            });
        });

        // Get latest block in chain and it's transaction timestamp (ts)
        getCurrentBlockTimestamp((blockId, blockTs) => {
            this.setState({
                currentBlockTimestamp: blockTs,
            });
            console.log(`Successfully got latest block (ID '${blockId}') with timestamp ${blockTs}`);
        });
    }

    fetchUserVariables () {
        // Only fetch user vars if address is given.
        if (this.state.algoAddress && !this.state.fetchingUsrVars) {
            this.setState({
                fetchingUsrVars: true,
            });
            console.log("Retrieving user state vars...");

            getUserStateValues(this.state.algoAddress, this.state.contractID, (data) => {
                if (data) {
                    this.setState({
                        fetchingUsrVars: false,
                        userTime: data.userTime,
                        userAmount: data.userAmount,
                        userStakingShares: data.userStakingShares,
                    }, () => {
                        this.updateResults();
                    });
                } else {
                    console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly contract or another error",
                    });
                }
            });
        }
        else {
            console.error("Algo address is empty or currently updating values!");
            this.setState({
                usrVarsErrorMsg: "Algorand address is empty or already updating values! Please try again",
            });
        }
    }

    onTimePeriodChanged(e) {
        // Make sure value is more than 0
        let val;
        if (parseInt(e.target.value) < 0) {
            val = 0;
        } else {
            val = parseInt(e.target.value);
        }

        this.setState({ 
            timePeriodDays: val,
        }, () => {
            this.updateResults();
        });
    }
    
    updateResults() {
        // Check required variables are valid
        if (this.state.userTime != null && this.state.userAmount != null && this.state.globalAmount != null && this.state.globalTime != null) {
            //let totalRewards = calculateYDLYRewards(this.state.userStakingShares, this.state.userTime, this.state.globalTime, this.state.userAmount, this.state.globalStakingShares, this.state.nllGlobalUnlock);
            let totalRewards = calculateYDLYRewardsFromDayPeriod(this.state.userStakingShares, this.state.timePeriodDays, this.state.userAmount, this.state.globalStakingShares, this.state.nllGlobalUnlock);
            this.setState({
                totalClaimableRewards: totalRewards,
            });
        }
    }

    render() {
        return (
            <div className="main-background">
                <h1>No Loss Lottery</h1>
                <h6>NLL Application (Contract): <a href="https://algoexplorer.io/application/233725844">233725844</a></h6>

                <p>
                    Insert your Algorand address that you have used with Yiedly to automatically gather the values required. 
                    This app only uses your address to query the <a href="https://algoexplorer.io">algoexplorer.io</a> API to gather the required values.
                    Click the button after the wallet address to estimate your rewards
                </p>

                <div className="d-flex">
                    <h6>Algorand Address:</h6>
                    <Form.Control 
                        type="text" 
                        placeholder="Your Algorand Address that has interacted with the Yieldly platform" 
                        value={this.state.algoAddress} 
                        onChange={(e) => this.setState({ algoAddress: e.target.value })} />
                    <Button 
                        className="mx-2"
                        onClick={this.fetchUserVariables}>
                            <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                </div>

                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg &&
                        <div style={{ color: "rgb(255, 50, 50)" }}>
                            { this.state.usrVarsErrorMsg }
                        </div>
                }

                {/* Separator */}
                <div className="py-3" />

                <Row>
                    {/* User Variables, from user address App's section in algoexplorer.io */}
                    <Col md={6}>
                        <h3>User Variables</h3>
                        <Row>
                            <Col md={6}>
                                <h6>
                                    User Time (UT)
                                </h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control 
                                    type="text" 
                                    placeholder="User Time (UT)" 
                                    value={ new Date(this.state.userTime * 1000 ).toString() }
                                    onChange={(e) => this.setState({ userTime: e.target.value })} 
                                    disabled/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6 title="User Amount (UA)">
                                    Tickets
                                </h6>
                            </Col>
                            <Col md={6} className="d-flex">
                                <img src={ALGO_ICON} className="my-auto mr-1" height={25} width={25} />
                                <Form.Control 
                                    type="text" 
                                    placeholder="User Amount (UA)"
                                    value={ this.state.userAmount ? formatNumber(fromMicroValue(this.state.userAmount).toFixed(3)) : null }
                                    onChange={(e) => this.setState({ userAmount: e.target.value })} 
                                    disabled/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>
                                    User Staking Shares (USS)
                                </h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text" 
                                    placeholder="User Staking Shares (USS)"
                                    value={ this.state.userStakingShares != null ? formatNumber(fromMicroValue(this.state.userStakingShares).toFixed(0)) : null }
                                    onChange={(e) => this.setState({ userAmount: e.target.value })} 
                                    disabled/>
                            </Col>
                        </Row>
                    </Col>

                    {/* Global Values */}
                    <Col md={6}>
                        <h3>Application Variables</h3>
                        <Row>
                            <Col md={6}>
                                <h6>Global Time (GT)</h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Global Time (GT)" 
                                    value={ new Date( this.state.globalTime * 1000 ).toString() } 
                                    disabled />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>Total ALGO (tickets) in Lottery</h6>
                            </Col>
                            <Col md={6} className="d-flex">
                                <img src={ALGO_ICON} className="my-auto mr-1" height={25} width={25} />
                                <Form.Control 
                                    type="text" 
                                    placeholder="Global Amount (GA)" 
                                    value={ formatNumber(fromMicroValue(this.state.globalAmount).toFixed(0)) } 
                                    disabled />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>Global Staking Shares (GSS)</h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Global Staking Shares (GSS)" 
                                    value={ formatNumber(fromMicroValue(this.state.globalStakingShares).toFixed(0)) } 
                                    disabled />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <div>
                    <h3>Time Period (days)</h3>
                    <Row>
                        <Col md={6}>
                            <p>Set a custom time period to see how many rewards you could earn in that period.</p>
                        </Col>
                        <Col md={6}>
                            <Form.Control 
                                type="number" 
                                value={this.state.timePeriodDays} 
                                onChange={this.onTimePeriodChanged} />
                        </Col>
                    </Row>
                </div>

                <div>
                    <h3>
                        Global Unlock Rewards
                    </h3>
                    <Row>
                        <Col>
                            <div>Total YDLY available in the pool for everyone to claim from</div>
                        </Col>
                        <Col className="d-flex">
                            <img
                                className="my-auto mr-2" 
                                src={YDLY_ICON} width={25} height={25} />
                            <Form.Control 
                                type="text"
                                value={ formatNumber(microAlgoToAlgo(this.state.nllGlobalUnlock).toFixed(0)) }
                                disabled
                                />
                        </Col>
                    </Row>
                </div>

                <div className="py-2">
                    <h3>Results</h3>
                    <Row>
                        <Col md={6}>
                            The amount of rewards available to user <b>with the current global unlock rewards pool</b> after the given day period above
                        </Col>
                        <Col md={6} className="d-flex">
                            <img
                                className="my-auto mr-2" 
                                src={YDLY_ICON} width={25} height={25} />
                            <Form.Control 
                                className="my-auto"
                                type="text" 
                                placeholder="TBD" 
                                value={ this.state.totalClaimableRewards?.toFixed(2) }
                                disabled />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default NoLossLottery;