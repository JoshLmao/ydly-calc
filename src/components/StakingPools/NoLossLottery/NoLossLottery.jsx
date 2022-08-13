import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo';

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appID: constants.NO_LOSS_LOTTERY_APP_ID,
            poolName: "No Loss Lottery",
            lineColor: "#6cdef9",
            yldyLineColor: "rgba(254, 215, 56, 1)",
            borderVariant: "info",
            customAddr: "",
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
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.appID }
                        title={ this.state.poolName }
                        unitVariant="ALGO"
                        />
                </Container>

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.appID }
                        applicationKeysConfig={ 
                            [
                                {
                                    key: "GT",
                                    type: "time",
                                    title: "Global Time (GT)"
                                },
                                {
                                    key: "GSS",
                                    type: "number",
                                    title: "Global Staking Shares (GSS)"
                                },
                                {
                                    key: "GA",
                                    unit: "ALGO",
                                    type: "currency",
                                    title: "Total Staked (GA)",
                                    decimals: 6,
                                },
                                {
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "YLDY",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: 6,
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="ALGO"
                        rewardValueUnit="YLDY"
                        variant="algo"
                        userKeysConfig={ this.state.userKeysConfig }
                        />
                </Container>

                <div className={`border-${this.state.borderVariant} border-top mt-5 pb-5`} />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "YLDY",
                                decimals: 6,
                                lineColor: this.state.yldyLineColor,
                            }
                        ]}
                        stakeToken="ALGO"
                        claimTokens={ [ "YLDY" ] }
                        defaultStakedAmount={ 1000 }
                        />
                </Container>

                <div className={`border-${this.state.borderVariant} border-top mt-5 pb-5`} />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            [
                                {
                                    unit: "ALGO",
                                    key: "GA",
                                    decimals: 6,
                                    lineColor: this.state.lineColor
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "TYUL",
                                    decimals: 6,
                                    lineColor: this.state.yldyLineColor
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        )
    }

}

export default NoLossLottery;