import React, { Component } from 'react';
import { Container, Form, Row, Col, Jumbotron, Alert } from "react-bootstrap";

import {
    constants
} from "../../js/consts";

import NoLossLottery from "../NoLossLottery/NoLossLottery";
import ScrollToTopButton from '../ScrollToTopButton';
import HistoricalRewards from '../HistoricalRewards';

import ALGO_LOGO from "../../svg/algo-icon.svg"
import YLDYStaking from '../StakingPools/YLDYStaking';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: null,
            
            nllAppID: constants.NO_LOSS_LOTTERY_APP_ID,
            yldyStakingAppID: constants.YLDY_STAKING_APP_ID,

            showAdvert: true,
        };
    }

    render() {
        return (
            <div className="all-text-white primary-background">
                <ScrollToTopButton />
             
                <Jumbotron className="text-white bg-dark mb-0">
                    <Container className="py-5">
                        <div>
                            <Row className="my-1">
                                <Col md={8}>
                                    {
                                        // Alert: Url is develop website
                                        window?.location?.href?.includes("yldy-calc-develop") && (
                                            <Alert variant="warning">
                                                    <strong>Warning:</strong> You are using the develop website. Please use the main website 
                                                    <br />
                                                    <Alert.Link href="https://yldy-estimator.joshlmao.com">
                                                        https://yldy-estimator.joshlmao.com
                                                    </Alert.Link>
                                            </Alert>
                                        )
                                    }
                                    <h1 className="text-white font-weight-bold pb-3">
                                        Estimate your Yieldly rewards in seconds!
                                    </h1>
                                    <Form.Control
                                        type="text"
                                        placeholder="Your Algorand Address"
                                        value={this.state.userAlgoAddress ?? ""}
                                        size="lg"
                                        onChange={(e) =>
                                            this.setState({ userAlgoAddress: e.target.value })
                                        }
                                        />
                                    <p className="small pt-2 font-weight-bold text-muted">
                                        If you are having issues, try removing the address and
                                        trying again.
                                    </p>
                                    <p className="lead">
                                        Enter your Algorand address to get your account information
                                        from the
                                        {" "}
                                        <a
                                            href="https://algoexplorer.io"
                                            className="text-primary font-weight-bold"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            algoexplorer.io
                                        </a>
                                        {" "}
                                        API.
                                    </p>
                                    <p className="small">
                                    This will update custom tickets or staked YLDY values
                                    entered below.
                                    </p>

                                    <Row className="rounded bg-secondary float-left py-3 px-1 mx-1">
                                        <Col md="auto">
                                            <img
                                                src={ALGO_LOGO}
                                                height="auto"
                                                width="50"
                                                alt="algorand icon"
                                                className="fixed-left"
                                                />
                                        </Col>
                                        <Col>
                                            Track NFT sales and prices on the Algorand blockchain
                                            <br/>
                                            <a
                                                href="https://nftexplorer.app"
                                                >
                                                NFTExplorer.app
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </Jumbotron>

                <div
                    className="bg-dark border-top border-primary py-3"
                    id="no-loss-lottery">
                    <Container>
                        <NoLossLottery
                            userAlgoAddress={this.state.userAlgoAddress}
                            firebase={this.state.firebase}
                        />
                        <Row>
                            <Col>
                                <HistoricalRewards
                                    appID={constants.NO_LOSS_LOTTERY_APP_ID}
                                    stakeToken="ALGO"
                                    claimTokens={[ "YLDY" ]}
                                    />
                            </Col>
                        </Row>
                    </Container>
                </div>

                <div className="bg-dark border-top border-info py-3" id="yldy-staking">
                    <YLDYStaking 
                        userAlgoAddress={ this.state.userAlgoAddress }
                        />
            </div>
        </div>
        );
    }
}

export default Home;
