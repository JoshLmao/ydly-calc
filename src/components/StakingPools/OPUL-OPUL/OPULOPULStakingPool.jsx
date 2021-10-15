import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class OPULOPULStakingPool extends Component {

    constructor(props) {
        super(props);

        this.state = {
            appID: constants.OPUL_OPUL_POOL_APP_ID,
            lineColor: "#ff5400",

            poolName: "OPUL/OPUL"
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
                        unitVariant="opul"
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
                                    unit: "OPUL",
                                    type: "currency",
                                    title: "Total OPUL Staked (GA)",
                                    decimals: 10,
                                },
                                {
                                    // Total SMILE in tool
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "OPUL",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: 10,
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="OPUL"
                        rewardValueUnit="OPUL"
                        variant="opul"
                        />
                </Container>

                <div className="border-smile border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "OPUL",
                                decimals: 10,
                                lineColor: this.state.lineColor,
                            }
                        ]}
                        stakeToken="OPUL"
                        claimTokens={ [ "OPUL" ] }
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
                                    unit: "OPUL",
                                    key: "GA",
                                    decimals: 10,
                                    lineColor: this.state.lineColor
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "OPUL",
                                    key: "TYUL",
                                    decimals: 10,
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

export default OPULOPULStakingPool;