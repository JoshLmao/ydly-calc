import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import { constants } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import StakePoolCalculator from '../../StakePoolCalculator/StakePoolCalculator';

class YLDYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            yldyStakingAppID: constants.YLDY_STAKING_APP_ID,
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
                },
                {
                    // Reward YLDY
                    key: "TYUL",
                    type: "currency",
                    unit: "YLDY",
                    title: "Total YLDY Available in Pool (TYUL)",
                    isRewardKey: true,
                },
                {
                    // Reward Algo
                    key: "TAP",
                    type: "currency",
                    unit: "ALGO",
                    title: "Total ALGO Available in Pool (TYUL)",
                    isRewardKey: true,
                },
            ]
        }
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <h1
                        className="display-4 font-weight-bold text-center my-4 info-title-shadowed">
                        YLDY Staking
                    </h1>
                    <p className="small text-center">
                        contract address:{" "}
                        <a
                            href={
                            "https://algoexplorer.io/application/" +
                            this.state.yldyStakingAppID
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-info font-weight-bold">
                            { this.state.yldyStakingAppID }
                        </a>
                    </p>
                </Container>

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.yldyStakingAppID }
                        applicationKeysConfig={ this.state.applicationKeysConfig }
                        primaryValueUnit="YLDY"
                        />
                </Container>

                <Container>
                    <HistoricalRewards
                        appID={ this.state.yldyStakingAppID }
                        stakeToken="YLDY"
                        claimTokens={[ "YLDY", "ALGO" ]}
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYStaking;