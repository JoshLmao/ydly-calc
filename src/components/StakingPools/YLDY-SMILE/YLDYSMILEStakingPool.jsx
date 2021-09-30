import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class YLDYSMILEStakingPool extends Component {

    constructor(props) {
        super(props);

        this.state = {
            appID: constants.OPUL_STAKING_APP_ID,
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        apID={ this.state.appID }
                        title="YLDY/SMILE Staking"
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
                                    unit: "YLDY",
                                    type: "currency",
                                    title: "Total YLDY Staked (GA)",
                                },
                                {
                                    // Total SMILE in tool
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "SMILE",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: 6,
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="YLDY"
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
                                decimals: 10,
                                lineColor: "#21dbcc",
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={ [ "SMILE" ] }
                        />
                </Container>

                <div className="border-smile border-top mt-5 pb-5" />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title="YLDY/SMILE Pool Statistics"
                        appID={ this.state.opulStakingAppID }
                        stakeConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "GA"
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "SMILE",
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

export default YLDYSMILEStakingPool;