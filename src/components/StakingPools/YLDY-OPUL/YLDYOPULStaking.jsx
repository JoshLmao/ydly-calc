import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class YLDYOPULStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Application ID on Algorand blockchain
            opulStakingAppID: constants.OPUL_STAKING_APP_ID,

            opulLineColor: "#ff5400",
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.opulStakingAppID }
                        title="YLDY/OPUL Staking"
                        unitVariant="opul"
                        />
                </Container>

                

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.opulStakingAppID }
                        applicationKeysConfig={ [
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
                                    // Total amount staked
                                    key: "GA",
                                    unit: "YLDY",
                                    type: "currency",
                                    title: "Total YLDY Staked (GA)",
                                    decimals: 6,
                                },
                                {
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "OPUL",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: 10,
                                    isRewardKey: true,
                                },
                            ]
                        }
                        primaryValueUnit="YLDY"
                        rewardValueUnit="OPUL"
                        variant="opul"
                        />
                </Container>

                <div className="border-opul border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.opulStakingAppID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "OPUL",
                                decimals: 10,
                                lineColor: "#ff5400",
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={ [ "OPUL" ] }
                        />
                </Container>

                <div className="border-opul border-top mt-5 pb-5" />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title="YLDY/OPUL Pool Statistics"
                        appID={ this.state.opulStakingAppID }
                        stakeConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "GA",
                                    decimals: 6
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "OPUL",
                                    key: "TYUL",
                                    decimals: 10,
                                    lineColor: this.state.opulLineColor
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYOPULStaking;