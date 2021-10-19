import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class SMILESMILEStakingPool extends Component {

    constructor(props) {
        super(props);

        this.state = {
            appID: constants.SMILE_SMILE_POOL_APP_ID,
            lineColor: "#21dbcc",

            poolName: "SMILE/SMILE",
            smileDecimals: 6,
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.appID }
                        title={ this.state.poolName + " Staking" }
                        unitVariant="smile"
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
                                    unit: "SMILE",
                                    type: "currency",
                                    title: "Total Staked (GA)",
                                    decimals: this.state.smileDecimals,
                                },
                                {
                                    // Total SMILE in tool
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "SMILE",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: this.state.smileDecimals,
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="SMILE"
                        rewardValueUnit="SMILE"
                        variant="smile"
                        />
                </Container>

                <div className="border-smile border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "SMILE",
                                decimals: this.state.smileDecimals,
                                lineColor: this.state.lineColor,
                            }
                        ]}
                        stakeToken="SMILE"
                        claimTokens={ [ "SMILE" ] }
                        defaultStakedAmount={ 100 }
                        />
                </Container>

                <div className="border-smile border-top mt-5 pb-5" />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            [
                                {
                                    unit: "SMILE",
                                    key: "GA",
                                    decimals: this.state.smileDecimals,
                                    lineColor: this.state.lineColor
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "SMILE",
                                    key: "TYUL",
                                    decimals: this.state.smileDecimals,
                                    lineColor: this.state.lineColor
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default SMILESMILEStakingPool;