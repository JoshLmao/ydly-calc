import React, { Component } from 'react';
import {
    Row, 
    Col,
    Form,
    Button
} from 'react-bootstrap';
import { 
    getContractValues, 
    getUserStateValues 
} from '../../js/AlgoExplorerAPI';
import { 
    calculateClaimableUserRewards, 
    calculateGlobalStakingShares,
    calculateUserStakingShares
} from '../../js/YDLYCalculation';
import {
    daysToUnix, microAlgoToAlgo
} from "../../js/utility";

import "./NLL.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Contract ID to use
            contractID: 233725844,

            fetchingUsrVars: false,
            fetchingGlobalVars: false,

            // User vars
            algoAddress: null,
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
            currentBlockTimestamp: new Date(),

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
                nllGlobalUnlock: contractVars.totalYiedlyUnlock,

                fetchingGlobalVars: false,
            });
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
                        userTime: data?.userTime,
                        userAmount: data?.userAmount,
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
        if (parseInt(e.target.value) <= 0) {
            val = 1;
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
            let unixTimePeriod = daysToUnix(this.state.timePeriodDays);
            let globalStakingShares = calculateGlobalStakingShares(this.state.currentBlockTimestamp, this.state.globalTime, unixTimePeriod, this.state.globalAmount);
            let usrStakingShares = calculateUserStakingShares(this.state.currentBlockTimestamp, this.state.userTime, unixTimePeriod, this.state.userAmount);
            let totalClaimable = calculateClaimableUserRewards(usrStakingShares, globalStakingShares, this.state.totalUnlockRewards);
            this.setState({
                globalStakingShares: globalStakingShares,
                userStakingShares: usrStakingShares,
                totalClaimableRewards: totalClaimable,
            });
        }
    }

    render() {
        return (
            <div className="main-background">
                <h1>No Loss Lottery</h1>
                <h6>Yiedly NLL Contract: <a href="https://algoexplorer.io/application/233725844">233725844</a></h6>

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
                                    value={this.state.userTime}
                                    onChange={(e) => this.setState({ userTime: e.target.value })} 
                                    disabled/>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>
                                    User Amount (UA)
                                </h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control 
                                    type="text" 
                                    placeholder="User Amount (UA)"
                                    value={this.state.userAmount}
                                    onChange={(e) => this.setState({ userAmount: e.target.value })} 
                                    disabled/>
                            </Col>
                        </Row>
                    </Col>

                    {/* Global Values */}
                    <Col md={6}>
                        <h3>Contract Variables</h3>
                        <Row>
                            <Col md={6}>
                                <h6>Global Time (GT)</h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control type="text" placeholder="Global Time (GT)" value={this.state.globalTime} disabled />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>Global Amount (GA)</h6>
                            </Col>
                            <Col md={6}>
                                <Form.Control type="text" placeholder="Global Amount (GA)" value={this.state.globalAmount} disabled />
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
                            <div>Total YDLY available in the pool to be claimed</div>
                        </Col>
                        <Col>
                            <Form.Control 
                                type="text"
                                value={ microAlgoToAlgo(this.state.nllGlobalUnlock).toFixed(0) }
                                disabled
                                />
                        </Col>
                    </Row>
                </div>

                <div className="py-2">
                    <h3>Results</h3>
                    <Row>
                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    Global Staking Shares
                                </Col>
                                <Col>
                                <Form.Control 
                                    type="text" 
                                    placeholder="TBD" 
                                    value={this.state.globalStakingShares} 
                                    disabled />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    User Staking Shares
                                </Col>
                                <Col md={6}>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="TBD" 
                                        value={this.state.userStakingShares} 
                                        disabled />
                                </Col>
                            </Row>
                        </Col>

                        <Col md={6}>
                            <Row>
                                <Col md={6}>
                                    Rewards Claimable for User
                                </Col>
                                <Col md={6}>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="TBD" 
                                        value={this.state.totalClaimableRewards} 
                                        disabled />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default NoLossLottery;