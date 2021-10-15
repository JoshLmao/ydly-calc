import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import { constants } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class YLDYYLDYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: props.userAlgoAddress ?? "",

            appID: constants.YLDY_STAKING_APP_ID,
            poolName: "YLDY/YLDY",
            applicationKeysConfig: [
                {
                    key: "GT",
                    type:"time",
                    title: "Global Time (GT)"
                },
                {
                    key: "GSS",
                    type: "number",
                    title: "Global Staking Shares (GSS)",
                },
                {
                    key: "GA",
                    unit: "YLDY",
                    type: "currency",
                    title: "Total Staked (GA)",
                    decimals: 6,
                },
                {
                    // Reward YLDY
                    key: "TYUL",
                    type: "currency",
                    unit: "YLDY",
                    title: "Total YLDY Available in Pool (TYUL)",
                    isRewardKey: true,
                    decimals: 6,
                },
                {
                    // Reward Algo
                    key: "TAP",
                    type: "currency",
                    unit: "ALGO",
                    title: "Total ALGO Available in Pool (TYUL)",
                    isRewardKey: true,
                    decimals: 6,
                },
            ],
            // Config for application keys to get from user's app info
            userKeysConfig: [
                {
                    key: "USS",
                    title: "User Staking Shares (USS)",
                    type: "number",
                },
                {
                    key: "UT",
                    title: "User Time (UT)",
                    type: "time"
                },
                {
                    key: "UA",
                    title: "User Amount (UA)",
                    type: "number",
                    hidden: true,
                }
            ],
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAlgoAddress !== this.props.userAlgoAddress) {
            this.setState({
                userAlgoAddress: this.props.userAlgoAddress,
            });
        }
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.appID }
                        title="YLDY/YLDY Staking"
                        unitVariant="yldy"
                        />
                </Container>

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.appID }
                        applicationKeysConfig={ this.state.applicationKeysConfig }
                        userAddress={ this.state.userAlgoAddress }
                        userKeysConfig={ this.state.userKeysConfig }
                        primaryValueUnit="YLDY"
                        sassSuffix="info"
                        variant="info"
                        />
                </Container>

                <div className="border-yldy border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "YLDY",
                                lineColor: "orange",
                                decimals: 6,
                            },
                            {
                                key: "TAP",
                                unit: "ALGO",
                                lineColor: "#6CDEF9",
                                stepped: true,
                                decimals: 6,
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={[ "YLDY", "ALGO" ]}
                        />
                </Container>

                <div className="border-yldy border-top mt-5 pb-5" />

                <Container>
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "GA",
                                    lineColor: this.state.yldyLineColor,
                                    decimals: 6,
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "ALGO",
                                    key: "TAP",
                                    lineColor: "#6cdef9",
                                    decimals: 6,
                                },
                                {
                                    unit: "YLDY",
                                    key: "TYUL",
                                    lineColor: "rgba(254, 215, 56, 1)",
                                    decimals: 6,
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYYLDYStaking;