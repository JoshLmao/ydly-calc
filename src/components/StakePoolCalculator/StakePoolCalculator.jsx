import React, { Component } from 'react';
import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";

import { formatNumber, fromMicroValue, getDayDifference, toMicroValue, unitToIcon } from '../../js/utility';
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

            primaryValueUnit: props.primaryValueUnit ?? "Primary",
            rewardValueUnit: props.rewardValueUnit ?? "YLDY",

            // value staked
            stakedAmount: 1000,
            // Amount of days to display period
            daysPeriod: 1,
            // Amount determined to be claimable for user
            amountClaimable: 0,

            userValues: null,
            // Values from app contract, stored by applicationKeys
            applicationValues: null,

            // Any error message
            errorMessage: null,

            // Key used to represent total pool amount
            stakingPoolRewardKeys: rewardKeys,
        };

        this.updateResults = this.updateResults.bind(this);
        this.onTimePeriodChanged = this.onTimePeriodChanged.bind(this);
        this.onStakedAmountChanged = this.onStakedAmountChanged.bind(this);
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
                    global: contractVars,
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
         
    }

    onStakedAmountChanged(e) {
        this.setState({
                stakedAmount: e.target.value,
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

    updateResults() {
        // Check required variables are valid
        if (this.state.daysPeriod && this.state.stakedAmount && this.state.global) {
            console.log(`Amount: ${this.state.stakedAmount} | Period: ${this.state.daysPeriod}`);

            let uss = this.state.user?.stakingShares ?? 0;
            let uStakedAmount = toMicroValue(this.state.stakedAmount);

            let allClaimableRewards = [];
            for (let rewardInfo of this.state.stakingPoolRewardKeys) {
                let claimable = calculateYLDYRewardsFromDayPeriod(
                    uss,
                    this.state.daysPeriod,
                    uStakedAmount,
                    this.state.global["GSS"],
                    this.state.global[rewardInfo.key],
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

        /*
        if (this.state.stakedAmount && this.state.global) {
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
        */
    }

    render() {
        return (
            <div>
                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg && (
                        <p className="text-danger">{this.state.usrVarsErrorMsg}</p>
                    )
                }

                <Row className="py-5">
                    <Col md="6">
                        <Card className="p-3 p-md-5 my-3 bg-dark border-primary glow-pink">
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
                                unlock rewards pool at '
                                {
                                    this.state.global
                                    ? 
                                    formatNumber(
                                        (this.state.global[this.state.stakingPoolRewardKey] / 1000).toFixed(0)
                                    )
                                    : 
                                    "?"
                                }
                                ' { this.state.rewardValueUnit }
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
                        <Card className="p-3 p-md-5 my-3 bg-dark border-primary glow-pink">
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
                        this.state.global && this.state.applicationKeysConfig.map((keyConfig, index) => {
                            let globalValue = null;
                            if (this.state.global[keyConfig.key]) {
                                globalValue = this.state.global[keyConfig.key];
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
                                                    !globalValue && (
                                                        `${keyConfig.key} is not defined`
                                                    )
                                                }

                                                {
                                                    // Value type is a time value
                                                    globalValue && keyConfig.type ===  "time" && (
                                                        <>
                                                            {
                                                                new Date(globalValue * 1000).toDateString() 
                                                            }
                                                        </>
                                                    )
                                                }
                                                {
                                                    // If value type is a currency
                                                    globalValue && keyConfig.type === "currency" && (
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
                                                                    fromMicroValue(globalValue).toFixed(0)
                                                                )
                                                            }
                                                        </>
                                                    )
                                                }
                                                {
                                                    globalValue && keyConfig.type === "number" && (
                                                        <>
                                                            {
                                                                formatNumber(
                                                                    fromMicroValue(globalValue).toFixed(0)
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