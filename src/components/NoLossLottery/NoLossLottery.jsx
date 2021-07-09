import React, { Component } from 'react';
import {
    Row, 
    Col,
    Form,
} from 'react-bootstrap';
import { 
    getContractValues, 
    getCurrentBlockTimestamp, 
    getUserStateValues 
} from '../../js/AlgoExplorerAPI';
import { 
    calculateYLDYRewardsFromDayPeriod,
    calculateRewardsPoolPercentageShare
} from '../../js/YLDYCalculation';
import {
    microAlgoToAlgo,
    fromMicroValue,
    formatNumber,
    isStringBlank,
    getDayDifference
} from "../../js/utility";

import YLDY_ICON from "../../svg/yldy-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";
import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Wallet provided
            algoAddress: this.props.userAlgoAddress,

            // Contract ID to use
            contractID: 233725844,

            fetchingUsrVars: false,
            fetchingGlobalVars: false,

            // User vars
            user: null,
            // {
            //     time: null,
            //     amount: null,
            //     stakingShares: null,
            // },
            // Contract global vars
            global: null,
            // {
            //     time: null,
            //     amount: null,
            //     stakingShares: null,
            //     // Total YLDY in rewards pool
            //     totalYldyRewards: null,
            // },

            // Amount of algo tickets in NLL
            algoTickets: null,

            // Calculated amount of YLDY user can claim
            totalClaimableRewards: null,
            // Amount of days as a time period to use in calculation
            daysPeriod: 1,
            // Time of latest block timestamp
            currentBlockTimestamp: null,

            // Any error message to display
            usrVarsErrorMsg: null,
        };

        this.fetchUserVariables = this.fetchUserVariables.bind(this);
        this.updateResults = this.updateResults.bind(this);
        this.onTimePeriodChanged = this.onTimePeriodChanged.bind(this);
        this.onTicketsChanged = this.onTicketsChanged.bind(this);
    }

    componentDidMount() {
        // Load global values on mount, update state
        this.setState({
            fetchingGlobalVars: true,
        });

        // Keys to retrieve from the contract's state. 
        // Global Time (GT), Global Amount (GA), Global Staking Shares (GSS), Total Yieldly (TYUL)
        let allKeys = [
            "GT", "GA", "TYUL", "GSS"
        ];
        // Call API and get keys
        getContractValues(this.state.contractID, allKeys, (contractVars) => {
            this.setState({
                global: {
                    time: contractVars["GT"],
                    amount: contractVars["GA"],
                    stakingShares: contractVars["GSS"],
                    totalYldyRewards: contractVars["TYUL"],
                },

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

    componentDidUpdate(prevProps) {
        if (prevProps.userAlgoAddress !== this.props.userAlgoAddress) {
            this.setState({
                algoAddress: this.props.userAlgoAddress,
            }, () => {
                this.fetchUserVariables();
            });
        }
    }

    fetchUserVariables () {
        if (this.state.usrVarsErrorMsg) {
            this.setState({
                usrVarsErrorMsg: null,
            });
        }

        // Only fetch user vars if address is given.
        if (this.state.algoAddress && !this.state.fetchingUsrVars) {
            if (isStringBlank(this.state.algoAddress)) {
                return;
            }

            this.setState({
                fetchingUsrVars: true,
            });
            console.log("Retrieving NLL user state vars...");

            getUserStateValues(this.state.algoAddress, this.state.contractID, (data) => {
                if (data) {
                    console.log(`Successfully got user variables from application '${this.state.contractID}' on address '${this.state.algoAddress}'`);
                    this.setState({
                        user: {
                            time: data.userTime,
                            amount: data.userAmount,
                            stakingShares: data.userStakingShares,
                        },
                        daysPeriod: getDayDifference(data.userTime, this.state.global.time),
                        algoTickets: data.userAmount / 1000000,
                        fetchingUsrVars: false,
                    }, () => {
                        this.updateResults();
                    });
                } else {
                    console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly contract or another error",
                        fetchingUsrVars: false,
                    });
                }
            });
        }
        else {
            console.error("Algo address is empty or currently updating values!");
            this.setState({
                usrVarsErrorMsg: "Algorand address is empty or already updating values! Please try entering a new Algorand address",
                // Reset if value existed
                totalClaimableRewards: null,
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
            daysPeriod: val,
        }, () => {
            this.updateResults();
        });
    }
    
    onTicketsChanged(e) {
        this.setState({ 
            algoTickets: e.target.value,
        }, () => {
            this.updateResults();
        });
    }

    updateResults() {
        // Check required variables are valid
        if (this.state.algoTickets && this.state.global) {
            // Parse to float and check for valid number
            let ticketsNumber = parseFloat(this.state.algoTickets);
            if (ticketsNumber > 0) {
                // Multiply by 10^6 as formula/other values are 10^6
                let algoTickets = ticketsNumber * 1000000;
                let uss = this.state.user?.stakingShares ?? 0;
                
                // Calculate YLDY rewards in current pool
                let totalRewards = calculateYLDYRewardsFromDayPeriod(uss, this.state.daysPeriod, algoTickets, this.state.global.stakingShares, this.state.global.totalYldyRewards);
                // Update value
                this.setState({ totalClaimableRewards: totalRewards });
            } else {
                // Unable to parse tickets. Validate the value and try again...
                // Reset last rewards value as new value is invalid
                if (this.state.totalClaimableRewards) {
                    this.setState({ totalClaimableRewards: null });
                }
            }
        } else if (this.state.totalClaimableRewards) {
            this.setState({ totalClaimableRewards: null });
        }
    }

    render() {
        return (
            <div className="py-5" data-spy="scroll" data-target="#estimator-navbar">
                <h1 
                    className="yieldly-main-color"
                    id="no-loss-lottery">No Loss Lottery</h1>
                <h6>No Loss Lottery Application: <a href="https://algoexplorer.io/application/233725844">233725844</a></h6>

                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg &&
                    <div style={{ color: "rgb(255, 50, 50)" }}>
                        { this.state.usrVarsErrorMsg }
                    </div>
                }

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
                                    value={ this.state.user ? new Date(this.state.user?.time * 1000 ).toString() : "" }
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
                                <img src={ALGO_ICON} className="my-auto mr-1" height={25} width={25} alt="Algorand icon" />
                                <Form.Control 
                                    type="text" 
                                    placeholder="User Amount (UA)"
                                    value={ this.state.algoTickets ?? "" }
                                    onChange={ this.onTicketsChanged }
                                    />
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
                                    value={ this.state.user?.stakingShares != null ? formatNumber(fromMicroValue(this.state.user.stakingShares).toFixed(0)) : "" }
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
                                    value={ this.state.global ? new Date( this.state.global.time * 1000 ).toString() : "" } 
                                    disabled />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <h6>Total ALGO (tickets) in Lottery</h6>
                            </Col>
                            <Col md={6} className="d-flex">
                                <img src={ALGO_ICON} className="my-auto mr-1" height={25} width={25} alt="Algorand icon" />
                                <Form.Control 
                                    type="text" 
                                    placeholder="Global Amount (GA)" 
                                    value={ this.state.global ? formatNumber(fromMicroValue(this.state.global.amount).toFixed(0)) : "" } 
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
                                    value={ this.state.global ? formatNumber(fromMicroValue(this.state.global.stakingShares).toFixed(0)) : "" } 
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
                                value={this.state.daysPeriod} 
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
                            <div>Total YLDY available in the pool for everyone to claim from</div>
                        </Col>
                        <Col className="d-flex">
                            <img
                                className="my-auto mr-2" 
                                src={YLDY_ICON} width={25} height={25} alt="Yieldly icon" />
                            <Form.Control 
                                type="text"
                                value={ this.state.global ? formatNumber(microAlgoToAlgo(this.state.global.totalYldyRewards).toFixed(0)) : "" }
                                disabled
                                />
                        </Col>
                    </Row>
                </div>

                <div className="py-2">
                    <h3>YLDY Claimable Rewards</h3>
                    <Row>
                        <Col md={6}>
                            The amount of rewards available to current address after '{this.state.daysPeriod}' day(s), <b>with the current global unlock rewards pool at '{ this.state.global ? formatNumber((this.state.global.totalYldyRewards / 1000).toFixed(0)) : "?" }' YLDY</b>
                            <br/>
                            <br/>
                            {
                                this.state.global?.totalYldyRewards != null && this.state.totalClaimableRewards != null &&
                                <div>
                                    { calculateRewardsPoolPercentageShare(fromMicroValue(this.state.global.totalYldyRewards), this.state.totalClaimableRewards) }% share of rewards pool
                                </div>
                            }
                            {
                                this.state.user?.time && this.state.global?.time &&
                                <div>You currently have '{getDayDifference(this.state.user.time, this.state.global.time)}' days of unclaimed rewards.</div>
                            }
                        </Col>
                        <Col md={6} className="d-flex">
                            <img
                                className="my-auto mr-2" 
                                src={YLDY_ICON} width={25} height={25} 
                                alt="Yieldly icon" />
                            <Form.Control 
                                className="my-auto"
                                type="text" 
                                title={"Raw: " + this.state.totalClaimableRewards}
                                placeholder="TBD | YLDY rewards" 
                                value={ 
                                    this.state.totalClaimableRewards != null 
                                    ?
                                    this.state.totalClaimableRewards?.toFixed(2)
                                    :
                                    ""
                                }
                                disabled />
                        </Col>
                    </Row>
                </div>

                <div>
                    <AppStateHistoryGraph
                        applicationID={this.state.contractID}
                        dataKey="TYUL"
                        sectionTitle="Global Rewards History"
                        sectionShortDesc="Line chart of the history of the global unlock rewards for the No Loss Lottery."
                        xAxisLabel="Date/Time of Record"
                        yAxisLabel="Amount of YLDY"
                        dataTitle="YLDY in Global Unlock Rewards"
                        graphHeight={125}
                        />
                </div>
            </div>
        );
    }
}

export default NoLossLottery;