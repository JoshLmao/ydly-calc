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
            appID: constants.YLDY_SMILE_POOL_APP_ID,
            lineColor: "#21dbcc",
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.appID }
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
                                    decimals: 6,
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
                                decimals: 6,
                                lineColor: this.state.lineColor,
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
                        appID={ this.state.appID }
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
                                    decimals: 6,
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

export default YLDYSMILEStakingPool;