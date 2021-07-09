import React, { Component } from 'react';
import {
    Form,
    Row, 
    Col
} from 'react-bootstrap';
import { 
    getContractValues,
    getUserStateValues
} from '../../js/AlgoExplorerAPI';
import {
    formatNumber,
    fromMicroValue,
    getDayDifference,
    isStringBlank
} from '../../js/utility';

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";
import { 
    calculateRewardsPoolPercentageShare,
    calculateYLDYRewardsFromDayPeriod 
} from '../../js/YLDYCalculation';
import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

class YLDYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // YLDY Staking application/contract id
            applicationID: 233725850,

            fetchingGlobalVars: false,

            // User vars
            user: null,
            // {
            //     time: null,
            //     amount: null,
            //     stakingShares: null,
            // },

            // Application Vars
            global: null,
            // {
            //     time: null,             // GT
            //     stakingShares: null,    // GSS
            //     totalAlgoRewards: null, // TYUL
            //     totalYldyRewards: null, // TAP
            // },

            // The amount of yldy staked. Shouldn't be a micro value
            yldyStaked: null,
            // Amount of days to use in calculation
            daysPeriod: 1,

            usrVarsErrorMsg: null,

            claimableYldyRewards: null,
            claimableAlgoRewards: null,
        };

        this.fetchUserVariables = this.fetchUserVariables.bind(this);
        this.onDaysPeriodChanged = this.onDaysPeriodChanged.bind(this);
        this.updateRewards = this.updateRewards.bind(this);
        this.onYldyStakedChanged = this.onYldyStakedChanged.bind(this);
    }

    componentDidMount() {
        this.setState({
            fetchingGlobalVars: true,
        });

        // Get these keys from application's state
        // Global Time (GT), Global Staking Shares (GSS), Total YLDY rewards (TYUL), Total ALGO rewards (TAP)
        let allKeys = [
            "GT", "GSS", "GA", "TYUL", "TAP"
        ];
        getContractValues(this.state.applicationID, allKeys, (appVars) => {
            if (appVars) {
                this.setState({
                    global: {
                        time: appVars["GT"],
                        amount: appVars["GA"],
                        stakingShares: appVars["GSS"],

                        totalYldyRewards: appVars["TYUL"],
                        totalAlgoRewards: appVars["TAP"],
                    },

                    fetchingGlobalVars: false,
                });
            }
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAlgoAddress !== this.props.userAlgoAddress) {
            this.setState({
                algoAddress: this.props.userAlgoAddress,
            }, () => {
                this.fetchUserVariables();
            })
        }
    }

    onDaysPeriodChanged(e) {
        let newVal;
        if (e.target.value < 0) {
            newVal = 0;
        } else {
            newVal = e.target.value;
        }

        this.setState({
            daysPeriod: newVal,
        }, () => {
            this.updateRewards();
        });
    }

    fetchUserVariables() {
        if (this.state.usrVarsErrorMsg) {
            this.setState({
                usrVarsErrorMsg: null,
            });
        }

        if (this.state.algoAddress && !this.state.fetchingUsrVars) {
            // Check address is valid
            if (isStringBlank(this.state.algoAddress)) {
                return;
            }

            this.setState({
                fetchingUsrVars: true,
            });
            console.log("Retrieving YLDY Staking user state vars...");

            getUserStateValues(this.state.algoAddress, this.state.applicationID, (data) => {
                if (data) {
                    console.log(`Successfully got user variables from application '${this.state.applicationID}' on address '${this.state.algoAddress}'`);
                    this.setState({
                        // Store user data for reuse
                        user: {
                            time: data.userTime,
                            amount: data.userAmount,
                            stakingShares: data.userStakingShares,
                        },

                        // Update yldy staked to loaded user amount
                        // Divide by 10^6 as it's expected as user input
                        yldyStaked: data.userAmount / 1000000,
                        // Determine days difference
                        daysPeriod: getDayDifference(data.userTime, this.state.global?.time),
                        fetchingUsrVars: false,
                    }, () => {
                        this.updateRewards();
                    });
                } else {
                    //console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly application or another error",
                        fetchingUsrVars: false,
                    });
                }
            });
        }
        else {
            //console.error("Algo address is empty or currently updating values!");
            this.setState({
                usrVarsErrorMsg: "Algorand address is empty or already updating values! Please try entering a new Algorand address",
                fetchingUsrVars: false,
            });
        }
    }

    onYldyStakedChanged(e) {
        this.setState({ 
            yldyStaked: e.target.value,
        }, () => {
            this.updateRewards();
        });
    }

    updateRewards() {
        if (this.state.yldyStaked && this.state.global) {
            // Attempt to parse user value, check if valid number
            let yldyStakedNum = parseFloat(this.state.yldyStaked);
            if (yldyStakedNum > 0) {
                // Multiply by 10^6
                let yldyStaked = yldyStakedNum * 1000000;
                // Determine USS
                let uss = this.state.user?.stakingShares ?? 0;

                // Calculate ALGO/YLDY rewards
                let claimableYldy = calculateYLDYRewardsFromDayPeriod(uss, this.state.daysPeriod, yldyStaked, this.state.global.stakingShares, this.state.global.totalYldyRewards);
                let claimableAlgo = calculateYLDYRewardsFromDayPeriod(uss, this.state.daysPeriod, yldyStaked, this.state.global.stakingShares, this.state.global.totalAlgoRewards);
                this.setState({
                    claimableYldyRewards: claimableYldy,
                    claimableAlgoRewards: claimableAlgo,
                });
            } else {
                // Entered value isnt valid number, reset reward values
                if (this.state.claimableAlgoRewards || this.state.claimableYldyRewards) {
                    this.setState({
                        claimableAlgoRewards: null,
                        claimableYldyRewards: null,
                    });
                }
            }
        } else {
            // Not ready to calculate, reset reward values if have them
            if (this.state.claimableAlgoRewards || this.state.claimableYldyRewards) {
                this.setState({
                    claimableAlgoRewards: null,
                    claimableYldyRewards: null,
                });
            }
        }
    }

    render() {
        return (
            <div className="main-background py-5" data-spy="scroll" data-target="#estimator-navbar">
                <h1 
                    className="yieldly-main-color"
                    id="yldy-staking">YLDY Staking</h1>
                <h6>
                    YLDY Staking Application: <a href={'https://algoexplorer.io/application/' + this.state.applicationID}>{this.state.applicationID}</a>
                </h6>

                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg &&
                    <div style={{ color: "rgb(255, 50, 50)" }}>
                        { this.state.usrVarsErrorMsg }
                    </div>
                }

                {/* All User/Application variables */}
                <Row>
                    <Col md={6}>
                        <h3>User Variables</h3>
                        <Row>
                            <Col>
                                <h6>User Time (UT)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    disabled
                                    value={ this.state.user ? new Date(this.state.user.time * 1000 ).toString() : "" }
                                    placeholder="User Time (UT)"
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Staked YLDY</h6>
                            </Col>
                            <Col className="d-flex">
                                <img
                                    src={YLDY_ICON}
                                    alt="Yieldly token icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control 
                                    type="text"
                                    value={this.state.yldyStaked}
                                    onChange={ this.onYldyStakedChanged }
                                    placeholder="User Amount (UA)"
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>User Staking Shares (USS)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    disabled
                                    value={ this.state.user?.stakingShares != null ? formatNumber(fromMicroValue(this.state.user.stakingShares).toFixed(0)) : "" }
                                    placeholder="User Staking Shares (USS)"
                                    />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={6}>
                        <h3>Application Variables</h3>

                        <Row>
                            <Col>
                                <h6>Global Time (GT)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    value={ this.state.global?.time ? new Date(this.state.global.time * 1000).toString() : "" }
                                    placeholder="Global Time (GT)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Total YLDY in YLDY Staking</h6>
                            </Col>
                            <Col className="d-flex">
                                <img
                                    src={YLDY_ICON}
                                    alt="Yieldly token icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control 
                                    type="text"
                                    value={ this.state.global?.amount ? formatNumber(fromMicroValue(this.state.global.amount).toFixed(0)) : "" }
                                    placeholder="Global Amount (GA)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Global Staking Shares (GSS)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    value={ this.state.global?.stakingShares ? formatNumber(fromMicroValue(this.state.global.stakingShares).toFixed(0)) : "" }
                                    placeholder="Global Staking Shares (GSS)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <div>
                    <h3>
                        Time Period (days)
                    </h3>
                    <Row>
                        <Col>
                            <p>Set a custom time period to see how many rewards you could earn in that period.</p>
                        </Col>
                        <Col>
                            <Form.Control 
                                type="number"
                                onChange={ this.onDaysPeriodChanged }
                                value={ this.state.daysPeriod }
                                placeholder="Amount of days"
                                />
                        </Col>
                    </Row>
                </div>

                <div>
                    <h3>
                        Global Unlock Rewards
                    </h3>
                    
                    <Row>
                        <Col>
                            Total ALGO available in pool
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={ALGO_ICON}
                                alt="Algorand icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                value={ this.state.global?.totalAlgoRewards ? formatNumber(fromMicroValue(this.state.global.totalAlgoRewards).toFixed(0)) : "" }
                                placeholder="Total ALGO in pool"
                                disabled
                                />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            Total YLDY available in pool
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={YLDY_ICON}
                                alt="Algorand icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                value={ this.state.global?.totalYldyRewards ? formatNumber(fromMicroValue(this.state.global?.totalYldyRewards).toFixed(0)) : "" }
                                placeholder="Total YLDY in pool"
                                disabled
                                />
                        </Col>
                    </Row>
                </div>

                <div>
                    <h3>YLDY & ALGO Claimable Rewards</h3>
                    <Row>
                        <Col>
                            The amount of claimable YLDY and ALGO tokens from the YLDY Staking global unlock rewards pool after '{this.state.daysPeriod}' day(s), {' '}
                            <b>
                                with a pool of '{formatNumber(fromMicroValue(this.state.global?.totalAlgoRewards).toFixed(0))}' ALGO and '{formatNumber(fromMicroValue(this.state.global?.totalYldyRewards).toFixed(0))}' YLDY
                            </b>

                            <br/>
                            <br/>
                            {
                                this.state.global?.totalYldyRewards != null && this.state.claimableYldyRewards != null &&
                                <div>
                                    { calculateRewardsPoolPercentageShare(fromMicroValue(this.state.global.totalYldyRewards), this.state.claimableYldyRewards) }% share of ALGO/YLDY global unlock rewards pool
                                </div>
                            }
                            {
                                this.state.user?.time && this.state.global?.time &&
                                <div>
                                    You currently have '{getDayDifference(this.state.user?.time, this.state.global?.time)}' days of unclaimed rewards.
                                </div>
                            }
                        </Col>
                        <Col>
                            <div className="d-flex">
                                <img
                                    src={ALGO_ICON}
                                    alt="Algorand icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control
                                    type="text"
                                    value={ this.state.claimableAlgoRewards != null ? formatNumber(this.state.claimableAlgoRewards.toFixed(3)) : "" }
                                    title={ "Raw: " + this.state.claimableAlgoRewards }
                                    placeholder="TBD | ALGO rewards"
                                    disabled
                                    />
                            </div>
                            <div className="d-flex">
                                <img
                                    src={YLDY_ICON}
                                    alt="Yieldly icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control
                                    type="text"
                                    value={ this.state.claimableYldyRewards != null ? formatNumber( this.state.claimableYldyRewards.toFixed(0)) : "" }
                                    title={ "Raw: " + this.state.claimableYldyRewards }
                                    placeholder="TBD | YLDY rewards"
                                    disabled
                                    />
                            </div>
                        </Col>
                    </Row>
                </div>

                <Row className="my-3">
                    <Col>
                        <AppStateHistoryGraph
                            applicationID={this.state.applicationID}
                            dataKey="TAP"
                            sectionTitle="ALGO Global Rewards History"
                            sectionShortDesc="History of ALGO as a global reward in YLDY Staking"
                            xAxisLabel="Date/Time of Record"
                            yAxisLabel="Amount of YLDY"
                            dataTitle="ALGO in Global Unlock Rewards"
                            decimalPrecision={2}
                            lineColor="#6cdef9"
                            lineHandleColor="grey"
                            />
                    </Col>
                    <Col>
                        <AppStateHistoryGraph
                            applicationID={this.state.applicationID}
                            dataKey="TYUL"
                            sectionTitle="YLDY Global Rewards History"
                            sectionShortDesc="History of YLDY as a global reward in YLDY Staking"
                            xAxisLabel="Date/Time of Record"
                            yAxisLabel="Amount of YLDY"
                            dataTitle="YLDY in Global Unlock Rewards"
                            />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default YLDYStaking;