import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { constants } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import StakePoolCalculator from '../../StakePoolCalculator/StakePoolCalculator';

class OpulStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Application ID on Algorand blockchain
            opulStakingAppID: constants.OPUL_STAKING_APP_ID,
            
            // Keys to get data values of from application
            opulAppKeysConfig: [
                {
                    key: "GT",
                    type: "time",
                    title: "Global Time (GT)"
                },
                {
                    key: "GSS",
                    type: "number",
                    title: "Global Staking Shares (GSS)",
                },
                {
                    // Total amount staked
                    key: "GA",
                    unit: "YLDY",
                    type: "currency",
                    title: "Total Staked (GA)",
                },
                {
                    key: "TYUL",
                    type: "currency",
                    unit: "OPUL",
                    title: "Total Available in Pool (TYUL)",
                    isRewardKey: true,
                },
            ],
        };
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <h1
                        className="display-4 font-weight-bold text-center my-4 opul-title-shadowed">
                        OPUL Staking
                    </h1>
                    <p className="small text-center">
                        application address:{" "}
                        <a
                            href={
                            "https://algoexplorer.io/application/" +
                            this.state.opulStakingAppID
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-opul font-weight-bold">
                            { this.state.opulStakingAppID }
                        </a>
                    </p>
                </Container>

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.opulStakingAppID }
                        applicationKeysConfig={ this.state.opulAppKeysConfig }
                        primaryValueUnit="YLDY"
                        rewardValueUnit="OPUL"
                        variant="opul"
                        />
                </Container>

                <Container>
                    <HistoricalRewards
                        appID={ this.state.opulStakingAppID }
                        rewardKeysConfig={[ 
                            {
                                key: "TYUL",
                                unit: "OPUL",
                                lineColor: "#ff5400",
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={ [ "OPUL" ] }
                        />
                </Container>
            </div>
        );
    }
}

export default OpulStaking;