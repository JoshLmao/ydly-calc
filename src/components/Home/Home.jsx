import React, { Component } from 'react';
import { Container, Row, Col, Jumbotron, Alert } from "react-bootstrap";

import NoLossLottery from "../StakingPools/NoLossLottery";
import ScrollToTopButton from '../ScrollToTopButton';

import ALGO_LOGO from "../../svg/algo-icon.svg"

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: "",
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
                                    
                                    <p className="lead">
                                        Explore all the current Yieldly staking pool to determine how much you could make!
                                    </p>
                                    <p className="small text-muted">
                                        The feature to enter your address will return in the future
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
                    <NoLossLottery />
                </div>
        </div>
        );
    }
}

export default Home;
