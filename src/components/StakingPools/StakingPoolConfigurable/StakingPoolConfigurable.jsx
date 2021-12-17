import React, { Component } from 'react'
import { Container } from 'react-bootstrap';
import { unitToDecimals } from '../../../js/consts';

import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/PoolStatistics';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';

import PAGE_CONFIG  from "../../../data/app-pool-config.json";

export default class StakingPoolConfigurable extends Component {

    constructor(props) {
        super(props);

        let match = this.props.match;

        let primary = "", secondary = "";
        if (match && match.params) {
            primary = match.params.primary;
            secondary = match.params.secondary;
        }

        let configKey = `${primary}-${secondary}`;
        let configObject = undefined;
        if (PAGE_CONFIG[configKey]) {
            configObject = PAGE_CONFIG[configKey];
        }

        this.state = {
            appID: configObject?.appID ?? -1,
            stakeLineColor: configObject?.stakeLineColor ?? "#fed738",
            rewardLineColor: configObject?.rewardLineColor ?? "#fed738",

            poolName: configObject?.name + " Staking Pool" ?? "Unknown Staking Pool",
            borderSuffix: configObject?.borderSuffix ?? "YLDY",

            unitVariant: configObject?.unitVariant.toLowerCase() ?? "yldy",

            stakingUnits: configObject?.stakingUnits ?? [ "YLDY" ],
            rewardUnits: configObject?.rewardUnits ?? [ "YLDY" ],
            defaultStakeAmount: configObject?.defaultStakeAmount ?? 1000,
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
                        unitVariant={ this.state.unitVariant }
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
                                    unit: this.state.stakingUnits && this.state.stakingUnits.length > 0 ? this.state.stakingUnits[0] : "YLDY",
                                    type: "currency",
                                    title: "Total Staked (GA)",
                                    decimals: this.state.stakingUnits && this.state.stakingUnits.length > 0 ? unitToDecimals(this.state.stakingUnits[0]) :  unitToDecimals("YLDY"),
                                },
                                {
                                    // Total SMILE in tool
                                    key: "TYUL",
                                    type: "currency",
                                    unit: this.state.rewardUnits && this.state.rewardUnits.length > 0 ? this.state.rewardUnits[0] :  "YLDY",
                                    title: "Total Available in Pool (TYUL)",
                                    decimals: this.state.rewardUnits && this.state.rewardUnits.length > 0 ? unitToDecimals(this.state.rewardUnits[0]) :  unitToDecimals("YLDY"),
                                    isRewardKey: true,
                                }
                            ]
                        }
                        primaryValueUnit={ this.state.stakingUnits && this.state.stakingUnits.length > 0 ? this.state.stakingUnits[0] : "YLDY" }
                        rewardValueUnit={ this.state.rewardUnits && this.state.rewardUnits.length > 0 ? this.state.rewardUnits[0] :  "YLDY" }
                        variant={ this.state.unitVariant }
                        />
                </Container>

                <div className={`border-${this.state.borderSuffix} border-top mt-5 pb-5`} />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={
                            this.state.rewardUnits.map((unit, index) => {
                                return {
                                    key: "TYUL",
                                    unit: unit,
                                    decimals: unitToDecimals(unit),
                                    lineColor: this.state.rewardLineColor,
                                }
                            })
                        }
                        stakeToken={ this.state.stakingUnits && this.state.stakingUnits.length > 0 ? this.state.stakingUnits[0] : "YLDY" }
                        claimTokens={ this.state.rewardUnits }
                        defaultStakedAmount={ this.state.defaultStakeAmount }
                        />
                </Container>

                <div className={`border-${this.state.borderSuffix} border-top mt-5 pb-5`} />

                <Container
                    className="py-3">
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            this.state.stakingUnits.map((unit, index) => {
                                return {
                                    unit: unit,
                                    key: "GA",
                                    decimals: unitToDecimals(unit),
                                    lineColor: this.state.stakeLineColor
                                }
                            })
                        }
                        rewardsConfig={
                            this.state.rewardUnits.map((unit, index) => {
                                return {
                                    unit: unit,
                                    key: "TYUL",
                                    decimals: unitToDecimals(unit),
                                    lineColor: this.state.rewardLineColor
                                }
                            })
                        }
                        />
                </Container>
            </div>
        );
    }
}
