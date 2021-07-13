import React, { Component } from "react";
import { Form, Row, Col, Card, InputGroup } from "react-bootstrap";
import {
  getContractValues,
  getUserStateValues,
} from "../../js/AlgoExplorerAPI";
import {
  formatNumber,
  fromMicroValue,
  getDayDifference,
  isStringBlank,
} from "../../js/utility";

import ALGO_ICON from "../../svg/algo-icon.svg";
import YLDY_ICON from "../../svg/yldy-icon.svg";
import {
  calculateRewardsPoolPercentageShare,
  calculateYLDYRewardsFromDayPeriod,
} from "../../js/YLDYCalculation";

import "../../YLDYEst-Shared.css";
import { constants } from '../../js/consts';

class YLDYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // YLDY Staking application/contract id
            applicationID: constants.YLDY_STAKING_APP_ID,

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
    };

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
        });
    }
    

    componentDidUpdate(prevProps) {
        if (prevProps.userAlgoAddress !== this.props.userAlgoAddress) {
            this.setState(
            {
                algoAddress: this.props.userAlgoAddress,
            },
            () => {
                this.fetchUserVariables();
            }
            );
        }
    }

    onDaysPeriodChanged(e) {
        let newVal;
        if (e.target.value < 0) {
            newVal = 0;
        } else {
            newVal = e.target.value;
        }

        this.setState(
            {
                daysPeriod: newVal,
            },
            () => {
                this.updateRewards();
            }
        );
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

            getUserStateValues( this.state.algoAddress, this.state.applicationID, (data) => {
                if (data) {
                    console.log(`Successfully got user variables from application '${this.state.applicationID}' on address '${this.state.algoAddress}'`);
                    this.setState(
                        {
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
                            daysPeriod: getDayDifference(
                                data.userTime,
                                this.state.global?.time
                            ),
                            fetchingUsrVars: false,
                        },
                        () => {
                            this.updateRewards();
                        }
                    );
                } else {
                    //console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly application or another error",
                        fetchingUsrVars: false,
                    });
                }
            }
            );
        } else {
            //console.error("Algo address is empty or currently updating values!");
            this.setState({
                usrVarsErrorMsg: "Algorand address is empty or already updating values! Please try entering a new Algorand address",
                fetchingUsrVars: false,
            });
        }
    }

    onYldyStakedChanged(e) {
        this.setState(
            {
                yldyStaked: e.target.value,
            },
            () => {
                this.updateRewards();
            }
        );
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
                let claimableYldy = calculateYLDYRewardsFromDayPeriod(
                    uss,
                    this.state.daysPeriod,
                    yldyStaked,
                    this.state.global.stakingShares,
                    this.state.global.totalYldyRewards
                );
                let claimableAlgo = calculateYLDYRewardsFromDayPeriod(
                    uss,
                    this.state.daysPeriod,
                    yldyStaked,
                    this.state.global.stakingShares,
                    this.state.global.totalAlgoRewards
                );
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
            <div
                className="py-5 bg-dark"
                data-spy="scroll"
                data-target="#estimator-navbar"
            >
                <h1
                    className="display-4 font-weight-bold text-info text-center my-4"
                    style={{ textShadow: "2px 2px rgb(249, 85, 144)" }}
                >
                    YLDY Staking
                </h1>
                <p className="small text-center">
                    contract address:{" "}
                    <a
                        href={
                        "https://algoexplorer.io/application/" +
                        this.state.applicationID
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-info font-weight-bold"
                    >
                        {this.state.applicationID}
                    </a>
                </p>

                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg && (
                    <p className="text-danger">{this.state.usrVarsErrorMsg}</p>
                    )
                }

                <Row className="py-5">
                    <Col md="6">
                        <Card className="p-3 p-md-5 my-3 border-info bg-dark glow-blue">
                            <p className="lead font-weight-bold">
                                <img
                                className="my-auto mr-2"
                                src={ALGO_ICON}
                                width={25}
                                height={25}
                                alt="ALGO icon"
                                />
                                ALGO Claimable Rewards
                            </p>
                            <p className="display-4">
                                {this.state.claimableAlgoRewards != null
                                ? formatNumber(this.state.claimableAlgoRewards.toFixed(3))
                                : "0"}
                            </p>
                            <p className="lead font-weight-bold">
                                <img
                                className="my-auto mr-2"
                                src={YLDY_ICON}
                                width={25}
                                height={25}
                                alt="Yieldly icon"
                                />
                                YLDY Claimable Rewards
                            </p>
                            <p className="display-4">
                                {this.state.claimableYldyRewards != null
                                ? formatNumber(this.state.claimableYldyRewards.toFixed(0))
                                : "0"}
                            </p>
                            <p className="small">
                                The amount of claimable YLDY and ALGO tokens from the YLDY
                                Staking global unlock rewards pool after '
                                {this.state.daysPeriod}' day(s), with a pool of '
                                {formatNumber(
                                fromMicroValue(this.state.global?.totalAlgoRewards).toFixed(
                                    0
                                )
                                )}
                                ' ALGO and '
                                {formatNumber(
                                fromMicroValue(this.state.global?.totalYldyRewards).toFixed(
                                    0
                                )
                                )}
                                ' YLDY
                            </p>
                            <p className="small">
                                {
                                    this.state.global?.totalYldyRewards != null &&
                                    this.state.claimableYldyRewards != null && (
                                    <div>
                                        {
                                            calculateRewardsPoolPercentageShare(
                                                fromMicroValue(this.state.global.totalYldyRewards),
                                                this.state.claimableYldyRewards
                                            ).toFixed(10)
                                        }
                                        % share of ALGO/YLDY global unlock rewards pool
                                    </div>
                                    )
                                }
                                {
                                    this.state.user?.time && this.state.global?.time && (
                                    <div>
                                        You currently have '
                                        {
                                            getDayDifference(
                                                this.state.user?.time,
                                                this.state.global?.time
                                            )
                                        }
                                        ' days of unclaimed rewards.
                                    </div>
                                    )
                                }
                            </p>
                        </Card>
                    </Col>
                    <Col md="6">
                        <Card className="p-3 p-md-5 my-3 bg-dark border-info glow-blue">
                            <Form>
                                <Form.Group controlId="tickets">
                                    <Form.Label className="lead font-weight-bold">
                                        Amount of YLDY you have staked
                                    </Form.Label>
                                    <InputGroup className="mb-2">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>
                                                <img
                                                src={YLDY_ICON}
                                                className="my-auto mr-1"
                                                height={25}
                                                width={25}
                                                alt="Yieldly icon"
                                                />
                                            </InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            size="lg"
                                            type="number"
                                            value={this.state.yldyStaked ?? ""}
                                            onChange={this.onYldyStakedChanged}
                                            placeholder="Amount of YLDY you have staked"
                                            />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group controlId="timePeriod">
                                    <Form.Label className="lead font-weight-bold">
                                        Days without claiming your rewards
                                    </Form.Label>
                                    <Form.Control
                                        size="lg"
                                        type="number"
                                        value={this.state.daysPeriod}
                                        onChange={this.onDaysPeriodChanged}
                                    />
                                    {" "}
                                    <Form.Text className="text-muted">
                                        Set a time period to see how many rewards you could earn
                                        in that period.
                                    </Form.Text>
                                </Form.Group>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-5">
                    <Col sm="12">
                        <div className="text-center">
                            <p className="lead">
                                Total YLDY Staked
                            </p>
                            <h1>
                                <img
                                src={YLDY_ICON}
                                className="my-auto mr-1"
                                height={25}
                                width={25}
                                alt="Yieldly icon"
                                />

                                {
                                    this.state.global?.amount
                                    ? 
                                    formatNumber(
                                        fromMicroValue(this.state.global.amount).toFixed(0)
                                    )
                                    : 
                                    "Global Amount (GA)"
                                }
                            </h1>
                        </div>
                    </Col>
                </Row>
                <Row className="py-5">
                    <Col lg="4">
                        <div className="text-center">
                            <p className="lead">
                                ALGO available in to claim
                            </p>
                            <h1>
                                <img
                                    className="my-auto mr-2"
                                    src={ALGO_ICON}
                                    width={25}
                                    height={25}
                                    alt="ALGO icon"
                                />
                                {
                                    this.state.global?.totalAlgoRewards
                                    ? 
                                    formatNumber(
                                        fromMicroValue(
                                            this.state.global.totalAlgoRewards
                                        ).toFixed(0)
                                    )
                                    : 
                                    ""
                                }
                            </h1>
                        </div>
                        <div className="text-center my-5">
                            <p className="lead">
                                YLDY available to claim
                            </p>
                            <h1>
                                <img
                                    className="my-auto mr-2"
                                    src={YLDY_ICON}
                                    width={25}
                                    height={25}
                                    alt="Yieldly icon"
                                />
                                {
                                    this.state.global?.totalYldyRewards
                                    ? 
                                    formatNumber(
                                        fromMicroValue(
                                            this.state.global?.totalYldyRewards
                                        ).toFixed(0)
                                    )
                                    : 
                                    ""
                                }
                            </h1>
                        </div>
                    </Col>

                    <Col lg="4">
                        <div className="text-center">
                            <p className="lead">
                                Global Staking Shares (GSS)
                            </p>
                            <h1>
                                {
                                    this.state.global?.stakingShares
                                    ? formatNumber(
                                        fromMicroValue(this.state.global.stakingShares).toFixed(
                                            0
                                        )
                                    )
                                    : 
                                    "global staking shares not defined"
                                }
                            </h1>
                        </div>
                        <div className="text-center my-5">
                            <p className="lead">
                                User Staking Shares (USS)
                            </p>
                            <h1>
                                {
                                    this.state.user?.stakingShares != null
                                    ? 
                                    formatNumber(
                                        fromMicroValue(this.state.user.stakingShares).toFixed(0)
                                    )
                                    : 
                                    "USS not defined"
                                }
                            </h1>
                            <p className="small text-muted">
                                enter your algorand address to see your USS
                            </p>
                        </div>
                    </Col>
                    <Col lg="4">
                        <div className="text-center">
                        <p className="lead">
                            Global Time (GT)
                        </p>
                        <h1>
                            {
                                this.state.global?.time
                                ? 
                                new Date(this.state.global.time * 1000).toDateString()
                                : 
                                "global time not defined"
                                }
                        </h1>
                        </div>
                        <div className="text-center my-5">
                            <p className="lead">
                                User Time (UT)
                            </p>
                            <h1>
                                {
                                    this.state.user
                                    ? 
                                    new Date(this.state.user?.time * 1000).toDateString()
                                    : 
                                    "UT not defined"
                                }
                            </h1>
                            <p className="small text-muted">
                                enter your algorand address to see your UT
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default YLDYStaking;
