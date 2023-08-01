import React, { Component } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

import { constants, unitToIcon } from '../../../js/consts';
import HistoricalRewards from '../../HistoricalRewards';
import PoolStatistics from '../../PoolStatistics/';
import StakePoolCalculator from '../../StakePoolCalculator';
import StakePoolJumbo from '../../StakePoolJumbo/StakePoolJumbo';
import AlgoInterface from '../../../js/AlgoInterface';
import YieldlyAPI from '../../../js/yieldly/YieldlyAPI';
import { DateTime } from 'luxon';
import algosdk from 'algosdk';

class YLDYYLDYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: props.userAlgoAddress ?? "",

            appID: constants.YLDY_STAKING_APP_ID,
            poolName: "YLDY/YLDY",
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
                    decimals: 6,
                },
                {
                    // Reward YLDY
                    key: "TYUL",
                    type: "currency",
                    unit: "YLDY",
                    title: "Total YLDY Available in Pool (TYUL)",
                    isRewardKey: true,
                    decimals: 6,
                },
                {
                    // Reward Algo
                    key: "TAP",
                    type: "currency",
                    unit: "ALGO",
                    title: "Total ALGO Available in Pool (TYUL)",
                    isRewardKey: true,
                    decimals: 6,
                },
            ],
            // Config for application keys to get from user's app info
            userKeysConfig: [
                {
                    key: "USS",
                    title: "User Staking Shares (USS)",
                    type: "number",
                },
                {
                    key: "UT",
                    title: "User Time (UT)",
                    type: "time"
                },
                {
                    key: "UA",
                    title: "User Amount (UA)",
                    type: "number",
                    hidden: true,
                }
            ],


            yldyStakeAmt: 0,
            yldyUnstakeAmt: 0,
            yldyClaimAmt: 0,
            connectedWallet: null,
        }
    }

    async componentDidMount() {
        const address = await AlgoInterface.Reconnect();
        this.setState({ connectedWallet: address }, () => { console.log("mounted wallet " + this.state.connectedWallet)});
    }

    async ConnectWallet() {
        const address = await AlgoInterface.Connect();
        this.setState({ connectedWallet: address });
    }

    async OptInYldyContract() {
        const suggestedParamTxn = await AlgoInterface.GetSuggestedParams();
        if (!suggestedParamTxn) {
            return;
        }

        const optInYldyYldyContractTxn = YieldlyAPI.MakeOptInYldyYldy(this.state.connectedWallet, suggestedParamTxn);

        const signedTxns = await AlgoInterface.SignTxns([optInYldyYldyContractTxn]);
        const result = await AlgoInterface.PublishTxns(signedTxns);
        if (!result) {
            console.error("Not published!");
            this.setState({ operationError: "Unable to publish opt in Nll txn" });
        }
    }

    async StakeAmount() {
        const suggestedParams = await AlgoInterface.GetSuggestedParams();
        const stakeGroupedTxns = YieldlyAPI.MakeYldyStakeTxns(this.state.connectedWallet, suggestedParams, this.state.yldyStakeAmt * 1000000);
        const signedTxns = await AlgoInterface.SignTxns(stakeGroupedTxns);
        const result = await AlgoInterface.PublishTxns(signedTxns);
        if (!result) {
            console.error("Error staking!");
        }
        else {
            console.log("Successfully submitted!")
        }
    }

    async UnstakeAmount() {
        const suggestedParams = await AlgoInterface.GetSuggestedParams();
        const unstakeGroupedTxns = YieldlyAPI.MakeYldyUnstakeTxn(this.state.connectedWallet, suggestedParams, this.state.yldyUnstakeAmt * 1000000);
        const signedTxns = await AlgoInterface.SignTxns(unstakeGroupedTxns);

        // get lsig txn back out to sign
        const lsigAccount = YieldlyAPI.GetLogicSigAccount();
        const signedEscrowTxn = algosdk.signLogicSigTransactionObject(unstakeGroupedTxns[2], lsigAccount);

        const allSignedTxns = [ signedTxns[0], signedTxns[1], signedEscrowTxn.blob, signedTxns[2] ];
        const result = await AlgoInterface.PublishTxns(allSignedTxns);
        if (!result) {
            console.error("Error unstaking!");
        }
    }

    render() {
        return (
            <div
                className="bg-dark py-5 text-white">
                <Container>
                    <StakePoolJumbo
                        appID={ this.state.appID }
                        title="YLDY/YLDY Staking"
                        unitVariant="yldy"
                        />
                </Container>

                <Container>
                    <StakePoolCalculator
                        stakePoolID={ this.state.appID }
                        applicationKeysConfig={ this.state.applicationKeysConfig }
                        userAddress={ this.state.userAlgoAddress }
                        userKeysConfig={ this.state.userKeysConfig }
                        primaryValueUnit="YLDY"
                        sassSuffix="info"
                        variant="info"
                        />
                </Container>

                <Container
                    className="mb-3 mt-2 border border-info rounded p-3"
                    >
                    <div
                        className="d-flex flex-column justify-content-center mb-3"
                        >

                        <div
                            className="mx-auto"
                            >
                            <Button
                                variant="info mb-3"
                                onClick={ async () => {
                                    await this.ConnectWallet();
                                }}
                                >
                                Connect Wallet
                            </Button>
                        </div>
                        {
                            this.state.userAddress && (
                                <div>
                                    { this.state.userAddress }
                                </div>
                            )
                        }
                        <Button
                            className="ms-3 mx-auto"
                            variant="outline-info"
                            style={{
                                minWidth: "150px"
                            }}
                            onClick={ async () => {
                                await this.OptInYldyContract();
                            }}
                            >
                            Opt in to YLDY/YLDY Contract
                        </Button>

                        {
                            [
                                {
                                    title: "YLDY to Stake",
                                    value: this.state.yldyStakeAmt,
                                    onChange: (e) => {
                                        this.setState({
                                            yldyStakeAmt: parseInt(e.target.value),
                                        });
                                    },
                                    btnText: "Stake",
                                    onClick: async () => {
                                        await this.StakeAmount();
                                    },
                                    unit: "YLDY",
                                },
                                {
                                    title: "Unstake YLDY",
                                    value: this.state.yldyUnstakeAmt,
                                    onChange: (e) => {
                                        this.setState({
                                            yldyUnstakeAmt: parseInt(e.target.value),
                                        });
                                    },
                                    btnText: "Unstake",
                                    onClick: async () => {
                                        await this.UnstakeAmount();
                                    },
                                    unit: "YLDY",
                                },
                                // {
                                //     title: "YLDY to Claim",
                                //     value: this.state.claimAmount,
                                //     onChange: (e) => {
                                //         this.setState({
                                //             yldyClaimAmt: parseInt(e.target.value),
                                //         });
                                //     },
                                //     btnText: "Claim",
                                //     onClick: async () => {
                                //         await this.ClaimAmount();
                                //     },
                                //     unit: "YLDY",
                                // }
                            ].map((x, index) => {
                                return (
                                    <div
                                        className="my-2"
                                        key={ `val-${index}` }
                                        >
                                        <Row
                                            className=""
                                            >
                                            <Col
                                                md={ 4 }
                                                className="text-right"
                                                >
                                                <div
                                                    className="me-3"
                                                    >
                                                    { x.title }
                                                </div>
                                            </Col>
                                            <Col
                                                md={ 4 }
                                                >
                                                <InputGroup className="mb-2">
                                                    <InputGroup.Prepend>
                                                        <InputGroup.Text>
                                                            <img
                                                                src={ x.unit ? unitToIcon( x.unit ) : null }
                                                                className="my-auto mr-1 img-fluid"
                                                                height="23px"
                                                                width="23px"
                                                                alt="Algorand icon"
                                                                />
                                                        </InputGroup.Text>
                                                    </InputGroup.Prepend>
                                                    <Form.Control
                                                        value={ x.value }
                                                        onChange={ x.onChange }
                                                        type="number"
                                                        //disabled={ !this.state.connectedWallet }
                                                        />
                                                </InputGroup>
                                                {
                                                    x.afterControl
                                                }
                                            </Col>
                                            <Col
                                                md={ 4 }
                                                className="text-left"
                                                >
                                                <Button
                                                    className="ms-3"
                                                    variant="outline-primary"
                                                    onClick={ x.onClick }
                                                    style={{
                                                        minWidth: "150px"
                                                    }}
                                                    >
                                                    { x.btnText }
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            })
                        }
                        {
                            this.state.connectedWallet && (
                                <div
                                    className="d-flex flex-column justify-content-center align-items-center"
                                    >
                                    <Button
                                        className="mt-2"
                                        onClick={ () => {
                                            this.updateContractValues();
                                        }}
                                        >
                                        Refresh Clamable Amount
                                    </Button>
                                    {
                                        this.state.contractValuesLastEpochMs && (
                                            <div
                                                className="text-muted"
                                                >
                                                Last updated at { DateTime.fromMillis(this.state.contractValuesLastEpochMs).toLocaleString(DateTime.DATETIME_FULL) }
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }

                    </div>
                </Container>

                <div className="border-yldy border-top mt-5 pb-5" />

                <Container>
                    <HistoricalRewards
                        appID={ this.state.appID }
                        rewardKeysConfig={[
                            {
                                key: "TYUL",
                                unit: "YLDY",
                                lineColor: "orange",
                                decimals: 6,
                            },
                            {
                                key: "TAP",
                                unit: "ALGO",
                                lineColor: "#6CDEF9",
                                stepped: true,
                                decimals: 6,
                            }
                        ]}
                        stakeToken="YLDY"
                        claimTokens={[ "YLDY", "ALGO" ]}
                        />
                </Container>

                <div className="border-yldy border-top mt-5 pb-5" />

                <Container>
                    <PoolStatistics
                        title={ this.state.poolName + " Pool Statistics" }
                        appID={ this.state.appID }
                        stakeConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "GA",
                                    lineColor: this.state.yldyLineColor,
                                    decimals: 6,
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "ALGO",
                                    key: "TAP",
                                    lineColor: "#6cdef9",
                                    decimals: 6,
                                },
                                {
                                    unit: "YLDY",
                                    key: "TYUL",
                                    lineColor: "rgba(254, 215, 56, 1)",
                                    decimals: 6,
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYYLDYStaking;