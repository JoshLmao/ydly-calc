import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { appIDToName, constants, unitToDecimals } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

class GEMSGEMSStakingPool extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appID: constants.GEMS_GEMS_APP_ID,
            stakeLineColor: "#0135af",
            rewardLineColor: "#0135af",

            poolName: appIDToName(constants.GEMS_GEMS_APP_ID),
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
                                    unit: "GEMS",
                                    type: "currency",
                                    title: "Total Staked (GA)",
                                    decimals: unitToDecimals("GEMS"),
                                },
                                {
                                    key: "TYUL",
                                    type: "currency",
                                    unit: "GEMS",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: unitToDecimals("GEMS"),
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit="GEMS"
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
                                unit: "GEMS",
                                decimals: unitToDecimals("GEMS"),
                                lineColor: this.state.rewardLineColor,
                            }
                        ]}
                        stakeToken="GEMS"
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
                                    unit: "GEMS",
                                    key: "GA",
                                    decimals: unitToDecimals("GEMS"),
                                    lineColor: this.state.stakeLineColor
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

export default GEMSGEMSStakingPool;