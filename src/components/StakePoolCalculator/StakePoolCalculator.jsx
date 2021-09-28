import React, { Component } from 'react';
import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";

import { formatNumber, fromMicroValue, getDayDifference, isStringBlank, toMicroValue, unitToIcon } from '../../js/utility';
import { calculateRewardsPoolPercentageShare, calculateYLDYRewardsFromDayPeriod } from '../../js/YLDYCalculation';
import {
    getContractValues,
    getCurrentBlockTimestamp,
    getUserStateValues,
} from "../../js/AlgoExplorerAPI";

class StakePoolCalculator extends Component {
    constructor(props) {
        super(props);

        // Determine which value is the one that users can claim from
        let rewardKeys = [];
        if (props.applicationKeysConfig) {
            for( let configInfo of props.applicationKeysConfig) {
                if (configInfo.isRewardKey) {
                    rewardKeys.push(configInfo);
                }
            }
        }

        this.state = {
            // Algorand blockchain ID of application
            stakePoolID: props.stakePoolID,
            // Array of keys to get values out of application to display
            applicationKeysConfig: props.applicationKeysConfig,
            // User's algo address to use with userKeyConfig
            userAddress: props.userAddress ?? null,
            // Array of keys to get values out of user address
            userKeysConfig: props.userKeysConfig,
            
            primaryValueUnit: props.primaryValueUnit ?? "Primary",
            rewardValueUnit: props.rewardValueUnit ?? "YLDY",

            // value staked
            stakedAmount: 0,
            // Amount of days to display period
            daysPeriod: 1,
            // Amount determined to be claimable for user
            amountClaimable: 0,

            // Values from user's algo address
            userValues: null,
            // Values from app contract, stored by applicationKeys
            applicationValues: null,

            // Any error message
            errorMessage: null,

            // Key used to represent total pool amount
            stakingPoolRewardKeys: rewardKeys,

            // is loading flags
            fetchingGlobalVars: false,
            fetchingUserVars: false,

            // What sass/bootstrap variant to use
            variant: props.variant ?? "primary"
        };

        this.updateResults = this.updateResults.bind(this);
        this.onTimePeriodChanged = this.onTimePeriodChanged.bind(this);
        this.onStakedAmountChanged = this.onStakedAmountChanged.bind(this);
        this.fetchUserVariables = this.fetchUserVariables.bind(this);
    }
    
    componentDidMount() {
        if (this.state.applicationKeysConfig) {
            // Load global values on mount, update state
            this.setState({
                fetchingGlobalVars: true,
            });

            let allKeys = this.state.applicationKeysConfig.map((info) => {
                return info.key;
            });
            // Call API and get keys
            getContractValues(this.state.stakePoolID, allKeys, (contractVars) => {
                this.setState({
                    applicationValues: contractVars,
                    fetchingGlobalVars: false,
                }, () => {
                    this.updateResults();
                });
            });
        }

        // Get latest block in chain and it's transaction timestamp (ts)
        getCurrentBlockTimestamp((blockId, blockTs) => {
            this.setState({
                currentBlockTimestamp: blockTs,
            });
            console.log(`Successfully got latest block (ID '${blockId}') with timestamp ${blockTs}`);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({
                userAddress: this.props.userAddress
            }, () => {
                this.fetchUserVariables();
            });
        }
    }

    onStakedAmountChanged(e) {
        this.setState({
                stakedAmount: e.target.value < 0 ? 0 : e.target.value,
            },
            () => {
                this.updateResults();
            }
        );
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
            },
            () => {
                this.updateResults();
            }
        );
    }

    fetchUserVariables() {
        if (this.state.errorMessage) {
            this.setState({
                errorMessage: null,
            });
        }

        // Only fetch user vars if address is given.
        if (this.state.userAddress && !this.state.fetchingUserVars && this.state.userKeysConfig) {
            if (isStringBlank(this.state.userAddress)) {
                return;
            }

            this.setState({
                fetchingUserVars: true,
            });
            console.log("Retrieving NLL user state vars...");

            // Get user state values on algo address
            let allKeys = this.state.userKeysConfig.map((info) => {
                return info.key;
            });
            getUserStateValues(this.state.userAddress, this.state.stakePoolID, allKeys, (userAppValues) => {
                if (userAppValues) {
                    console.log(`Successfully got user variables from application '${this.state.stakePoolID}' on address '${this.state.userAddress}'`);
                    this.setState({
                        userValues: userAppValues,
                        daysPeriod: getDayDifference( userAppValues["UT"], this.state.applicationValues["GT"] ),
                        stakedAmount: userAppValues["UA"] / 1000000,
                        fetchingUserVars: false,
                    },
                    () => {
                        this.updateResults();
                    }
                    );
                } else {
                    console.error("No user state values in address!");
                    this.setState({
                        errorMessage: "Address hasn't interacted with Yiedly contract or another error",
                        fetchingUserVars: false,
                    });
                }
            });
        } else {
            console.error("Algo address is empty or currently updating values!");
            this.setState({
                errorMessage: "Algorand address is empty or already updating values! Please try entering a new Algorand address",
                // Reset if value existed
                totalClaimableRewards: null,
            });
        }
    }

    updateResults() {
        // Check required variables are valid
        if (this.state.daysPeriod && this.state.stakedAmount > -1 && this.state.applicationValues) {
            console.log(`Amount: ${this.state.stakedAmount} | Period: ${this.state.daysPeriod}`);

            // Get USS if available, convert amount to microValue
            let uss = this.state.user?.stakingShares ?? 0;
            let uStakedAmount = toMicroValue(this.state.stakedAmount);

            let allClaimableRewards = [];
            for (let rewardInfo of this.state.stakingPoolRewardKeys) {
                let claimable = calculateYLDYRewardsFromDayPeriod(
                    uss,
                    this.state.daysPeriod,
                    uStakedAmount,
                    this.state.applicationValues["GSS"],
                    this.state.applicationValues[rewardInfo.key],
                );

                allClaimableRewards.push({
                    key: rewardInfo.key,
                    unit: rewardInfo.unit,
                    claimable: claimable,
                });
            }
            this.setState({
                totalClaimableRewards: allClaimableRewards,
            });
        }
    }

    render() {
        return (
            <div>
                {/* Display error message if one is set*/}
                {
                    this.state.errorMessage && (
                        <p 
                            className="text-danger">
                            {this.state.errorMessage}
                        </p>
                    )
                }

                <Row className="py-5">
                    <Col md="6">
                        <Card 
                            className={`p-3 p-md-5 my-3 bg-dark border-${this.state.variant} glow-${this.state.variant}` }
                            >
                            {
                                this.state.totalClaimableRewards && this.state.totalClaimableRewards.map((claimableInfo) => {
                                    return (
                                        <>
                                            <p className="lead font-weight-bold">
                                                <img
                                                    className="my-auto mr-2"
                                                    src={ unitToIcon(claimableInfo.unit) }
                                                    width={25}
                                                    height={25}
                                                    alt="Yieldly icon"
                                                />
                                                { claimableInfo.unit } Claimable Rewards
                                            </p>
                                            <p 
                                                className="display-4"
                                                title={`${claimableInfo.claimable} ${claimableInfo.unit}` ?? ""}>
                                                {
                                                    claimableInfo.claimable.toFixed(2)
                                                }
                                            </p>
                                        </>
                                    );
                                })
                            }
                            <p className="small">
                                The amount of rewards available to current address after 
                                '{this.state.daysPeriod}' day(s), with the current global
                                unlock rewards pool at 
                                {" "}
                                {
                                    this.state.applicationValues && this.state.stakingPoolRewardKeys.map((info, index) => {
                                        return (
                                            <>
                                            '{
                                                formatNumber(
                                                    (this.state.applicationValues[info.key] / 1000).toFixed(0)
                                                )
                                            }'
                                            { info.unit }
                                            {
                                                index < this.state.stakingPoolRewardKeys.length - 1 && (
                                                    <>
                                                        {" and "}
                                                    </>
                                                )
                                            }
                                            </>
                                        )
                                    })
                                }
                            </p>
                            <p className="small">
                                {
                                    this.state.applicationValues?.totalYldyRewards != null && this.state.totalClaimableRewards != null && (
                                        <div>
                                            {
                                                calculateRewardsPoolPercentageShare(
                                                    fromMicroValue(this.state.applicationValues?.totalYldyRewards),
                                                    this.state.totalClaimableRewards
                                                ).toFixed(10)
                                            }
                                            % share of rewards pool
                                        </div>
                                    )
                                }
                                {
                                    this.state.user?.time && this.state.applicationValues?.time && (
                                        <div>
                                            You currently have '
                                            {
                                                getDayDifference(
                                                    this.state.userValues["GT"],
                                                    this.state.applicationValues["GT"]
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
                        <Card 
                            className={ `p-3 p-md-5 my-3 bg-dark border-${this.state.variant} glow-${this.state.variant}` }
                            >
                            <Form>
                                <Form.Group controlId="tickets">
                                    <Form.Label 
                                        className="lead font-weight-bold">
                                        Amount of { this.state.primaryValueUnit } staked
                                    </Form.Label>
                                    <InputGroup className="mb-2">
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>
                                                <img
                                                src={ unitToIcon(this.state.primaryValueUnit) }
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
                                            placeholder={ `Amount of ${this.state.primaryValueUnit} staked` }
                                            value={ this.state.stakedAmount }
                                            onChange={ this.onStakedAmountChanged }
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
                                        value={ this.state.daysPeriod }
                                        onChange={ this.onTimePeriodChanged }
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

                <Row 
                    className="py-5"
                    md={3}>
                    {
                        this.state.applicationValues && this.state.applicationKeysConfig.map((keyConfig, index) => {
                            let appValue = null;
                            if (this.state.applicationValues[keyConfig.key]) {
                                appValue = this.state.applicationValues[keyConfig.key];
                            }

                            return (
                                <Card
                                    bg="dark"
                                    key={ `${keyConfig.key}-${index}`}
                                    >
                                    <Card.Body>
                                        <div className="text-center">
                                            <p className="lead">
                                                {
                                                    keyConfig.title 
                                                    ?
                                                    keyConfig.title
                                                    :
                                                    keyConfig.key
                                                }
                                            </p>
                                            <h1>
                                                {
                                                    // Value couldn't be found, null
                                                    !appValue && (
                                                        `${keyConfig.key} is not defined`
                                                    )
                                                }

                                                {
                                                    // Value type is a time value
                                                    appValue && keyConfig.type ===  "time" && (
                                                        <>
                                                            {
                                                                new Date(appValue * 1000).toDateString() 
                                                            }
                                                        </>
                                                    )
                                                }
                                                {
                                                    // If value type is a currency
                                                    appValue && keyConfig.type === "currency" && (
                                                        <>
                                                            <img
                                                                src={ unitToIcon(keyConfig.unit) }
                                                                className="my-auto mr-2"
                                                                height={25}
                                                                width={25}
                                                                alt="Currency icon for key"
                                                            />
                                                            {
                                                                formatNumber(
                                                                    fromMicroValue(appValue).toFixed(0)
                                                                )
                                                            }
                                                        </>
                                                    )
                                                }
                                                {
                                                    appValue && keyConfig.type === "number" && (
                                                        <>
                                                            {
                                                                formatNumber(
                                                                    fromMicroValue(appValue).toFixed(0)
                                                                )
                                                            }
                                                        </>
                                                    )
                                                }
                                            </h1>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )
                        })
                    }
                </Row>
            </div>
        );
    }
}

export default StakePoolCalculator;