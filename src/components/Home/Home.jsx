import React, { Component } from 'react';
import { Container, Form, Row, Col, Jumbotron, Alert } from "react-bootstrap";

import {
    constants
} from "../../js/consts";

import NoLossLottery from "../NoLossLottery/NoLossLottery";
import YLDYStaking from "../YLDYStaking/YLDYStaking";
import ScrollToTopButton from '../ScrollToTopButton';
import HistoricalRewards from '../HistoricalRewards';

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
                            <Row className="my-3">
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
                                    />
                            </Col>
                        </Row>
                    </Container>
                </div>

                <div className="bg-dark border-top border-info py-3" id="yldy-staking">
                    <Container>
                        <YLDYStaking
                            userAlgoAddress={this.state.userAlgoAddress}
                            firebase={this.state.firebase}
                        />
                        <Row className="py-3">
                            <Col>
                                <HistoricalRewards
                                    appID={constants.YLDY_STAKING_APP_ID}
                                    stakeToken="YLDY"
                                    />
                            </Col>
                        </Row>
                </Container>
            </div>
        </div>
        );
    }
}

export default Home;
