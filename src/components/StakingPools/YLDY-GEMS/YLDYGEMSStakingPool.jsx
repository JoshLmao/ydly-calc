import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { appIDToName, constants, unitToDecimals } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class YLDYGEMSStakingPool extends Component {

    constructor(props) {
        super(props);

        this.state = {
            appID: constants.YLDY_GEMS_APP_ID,
            stakeLineColor: "rgba(254, 215, 56, 1)",
            rewardLineColor: "#0135af",

            poolName: appIDToName(constants.YLDY_GEMS_APP_ID),
            borderSuffix: "gems",
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
                        unitVariant="GEMS"
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
                                    title: "Total Staked (GA)",
                                    decimals: unitToDecimals("YLDY"),
                                },
                                {
                                    // Total SMILE in tool
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "GEMS",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: unitToDecimals("GEMS"),
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="YLDY"
                        rewardValueUnit="GEMS"
                        variant="gems"
                        />
                </Container>

                <div className="border-gems border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "YLDY",
                                decimals: unitToDecimals("YLDY"),
                                lineColor: this.state.yldyLineColor,
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={ [ "GEMS" ] }
                        defaultStakedAmount={ 1000 }
                        />
                </Container>

                <div className={`border-${this.state.borderSuffix} border-top mt-5 pb-5`} />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "GA",
                                    decimals: unitToDecimals("YLDY"),
                                    lineColor: this.state.yldyLineColor
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "GEMS",
                                    key: "TYUL",
                                    decimals: unitToDecimals("GEMS"),
                                    lineColor: this.state.rewardLineColor
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYGEMSStakingPool;