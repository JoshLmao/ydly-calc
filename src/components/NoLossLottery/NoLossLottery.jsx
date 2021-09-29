import React, { Component } from "react";
import { Row, Col, Form, Card, InputGroup } from "react-bootstrap";
import {
    getContractValues,
    getCurrentBlockTimestamp,
    getUserStateValues,
} from "../../js/AlgoExplorerAPI";
import {
  calculateYLDYRewardsFromDayPeriod,
  calculateRewardsPoolPercentageShare,
} from "../../js/YLDYCalculation";
import {
  microAlgoToAlgo,
  fromMicroValue,
  formatNumber,
  isStringBlank,
  getDayDifference,
  convertToMicroValue,
} from "../../js/utility";

import YLDY_ICON from "../../svg/yldy-icon.svg";
import ALGO_ICON from "../../svg/algo-icon.svg";
import { constants } from '../../js/consts';

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Wallet provided
            algoAddress: this.props.userAlgoAddress,

            // Contract ID to use
            contractID: constants.NO_LOSS_LOTTERY_APP_ID,

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
            algoTickets: 0,

            // Calculated amount of YLDY user can claim
            totalClaimableRewards: null,
            // Amount of days as a time period to use in calculation
            daysPeriod: 1,
            // Time of latest block timestamp
            currentBlockTimestamp: null,

            // Any error message to display
            usrVarsErrorMsg: null,

            allUserClaims: null,
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
        let allKeys = ["GT", "GA", "TYUL", "GSS"];
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

    fetchUserVariables() {
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

            // Get user state values on algo address
            getUserStateValues(this.state.algoAddress, this.state.contractID, [ "USS", "UT", "UA" ],  (userAppValues) => {
                if (userAppValues) {
                    console.log(`Successfully got user variables from application '${this.state.contractID}' on address '${this.state.algoAddress}'`);
                    this.setState({
                        user: userAppValues,
                        daysPeriod: getDayDifference( userAppValues["UT"], this.state.global.time ),
                        algoTickets: userAppValues["UA"] / 1000000,
                        fetchingUsrVars: false,
                    },
                    () => {
                        this.updateResults();
                    }
                    );
                } else {
                    console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly contract or another error",
                        fetchingUsrVars: false,
                    });
                }
            });
        } else {
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

        this.setState(
            {
                daysPeriod: val,
            },
            () => {
                this.updateResults();
            }
        );
    }

    onTicketsChanged(e) {
        this.setState(
            {
                algoTickets: e.target.value,
            },
            () => {
                this.updateResults();
            }
        );
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
                let totalRewards = calculateYLDYRewardsFromDayPeriod(
                    uss,
                    this.state.daysPeriod,
                    algoTickets,
                    this.state.global.stakingShares,
                    this.state.global.totalYldyRewards
                );

                totalRewards = convertToMicroValue(totalRewards,  6);

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
                    className="font-weight-bold display-4 text-center my-4 primary-title-shadowed">
                    No Loss Lottery
                </h1>

                <p className="small text-center">
                    contract address:
                    {" "}
                    <a
                        href="https://algoexplorer.io/application/233725844"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-weight-bold">
                        233725844
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
                        <Card className="p-3 p-md-5 my-3 bg-dark border-primary glow-primary">
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
                            <p 
                                className="display-4"
                                title={this.state.totalClaimableRewards ?? ""}>
                                {
                                    this.state.totalClaimableRewards != null
                                    ? 
                                    this.state.totalClaimableRewards?.toFixed(2)
                                    : 
                                    "0"
                                }
                            </p>
                            <p className="small">
                                The amount of rewards available to current address after 
                                '{this.state.daysPeriod}' day(s), with the current global
                                unlock rewards pool at '
                                {
                                    this.state.global
                                    ? 
                                    formatNumber(
                                        (this.state.global.totalYldyRewards / 1000).toFixed(0)
                                    )
                                    : 
                                    "?"
                                }
                                ' YLDY
                            </p>
                            <p className="small">
                                {
                                    this.state.global?.totalYldyRewards != null && this.state.totalClaimableRewards != null && (
                                        <div>
                                            {
                                                calculateRewardsPoolPercentageShare(
                                                    fromMicroValue(this.state.global.totalYldyRewards),
                                                    this.state.totalClaimableRewards
                                                ).toFixed(10)
                                            }
                                            % share of rewards pool
                                        </div>
                                    )
                                }
                                {
                                    this.state.user?.time && this.state.global?.time && (
                                        <div>
                                            You currently have '
                                            {
                                                getDayDifference(
                                                    this.state.user.time,
                                                    this.state.global.time
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
                        <Card className="p-3 p-md-5 my-3 bg-dark border-primary glow-primary">
                            <Form>
                                <Form.Group controlId="tickets">
                                    <Form.Label className="lead font-weight-bold">
                                        Amount of ALGO tickets you have in the no loss lottery
                                    </Form.Label>
                                    <InputGroup className="mb-2">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>
                                                <img
                                                src={ALGO_ICON}
                                                className="my-auto mr-1"
                                                height={25}
                                                width={25}
                                                alt="Algorand icon"
                                                />
                                            </InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            size="lg"
                                            type="number"
                                            placeholder="Amount of ALGO tickets you have in the no loss lottery"
                                            value={this.state.algoTickets}
                                            onChange={this.onTicketsChanged}
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
                                        onChange={this.onTimePeriodChanged}
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

                <Row className="py-5">
                    {/* User Variables, from user address App's section in algoexplorer.io */}
                    <Col lg="4">
                        <div className="text-center">
                            <p className="lead">
                                Total ALGO (tickets) in Lottery
                            </p>
                            <h1>
                                <img
                                    src={ALGO_ICON}
                                    className="my-auto mr-1"
                                    height={25}
                                    width={25}
                                    alt="Algorand icon"
                                />
                                {
                                    this.state.global
                                    ? 
                                    formatNumber(
                                        fromMicroValue(this.state.global.amount).toFixed(0)
                                    )
                                    : 
                                    "total Algo tickets not defined"
                                }
                            </h1>
                        </div>
                        <div className="text-center my-5">
                            <p className="lead">
                                Global Unlock Rewards
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
                                    this.state.global
                                    ? 
                                    formatNumber(
                                        microAlgoToAlgo(
                                            this.state.global.totalYldyRewards
                                        ).toFixed(0)
                                    )
                                    : 
                                    "Global unlock rewards not defined"}
                            </h1>
                            <p className="small text-muted">
                                YLDY available in the pool to claim from
                            </p>
                        </div>
                    </Col>

                    <Col lg="4">
                        <div className="text-center">
                            <p className="lead">
                                Global Staking Shares (GSS)
                            </p>
                            <h1>
                                {
                                    this.state.global
                                    ? 
                                    formatNumber(
                                        fromMicroValue(this.state.global.stakingShares).toFixed(0)
                                    )
                                    : 
                                    "Global staking shares not defined"
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
                    <Col lg={4}>
                        <div className="text-center">
                            <p className="lead">
                                Global Time (GT)
                            </p>
                            <h1>
                                {
                                    this.state.global
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

export default NoLossLottery;
