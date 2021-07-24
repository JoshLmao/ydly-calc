import React, { Component } from 'react';
import { Container, Form, Row, Col, Jumbotron, Toast  } from "react-bootstrap";

import {
    constants
} from "../../js/consts";

import NoLossLottery from "../NoLossLottery/NoLossLottery";
import YLDYStaking from "../YLDYStaking/YLDYStaking";
import AppStateHistoryGraph from "../AppStateHistoryGraph/AppStateHistoryGraph";
import ScrollToTopButton from '../ScrollToTopButton';

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
                    className="bg-dark border-top border-primary py-5"
                    id="no-loss-lottery">
                    <Container>
                        <NoLossLottery
                            userAlgoAddress={this.state.userAlgoAddress}
                            firebase={this.state.firebase}
                        />
                    <AppStateHistoryGraph
                        applicationID={this.state.nllAppID}
                        dataKey="TYUL"
                        valueType="YLDY"
                        sectionTitle="Global Rewards History"
                        sectionShortDesc="History of the global unlock rewards for the No Loss Lottery."
                        xAxisLabel="Date/Time of Record"
                        yAxisLabel="Amount of YLDY"
                        dataTitle="YLDY in Global Unlock Rewards (TYUL)"
                        graphHeight={150}
                        displayAverage
                        displayDataKeyDesc
                        />
                    </Container>
                </div>

                <div className="bg-dark border-top border-info py-5" id="yldy-staking">
                    <Container>
                        <YLDYStaking
                            userAlgoAddress={this.state.userAlgoAddress}
                            firebase={this.state.firebase}
                        />
                    <Row className="py-3">
                        <Col>
                            <AppStateHistoryGraph
                                applicationID={this.state.yldyStakingAppID}
                                dataKey="TAP"
                                valueType="ALGO"
                                sectionTitle="ALGO Global Rewards History"
                                sectionShortDesc="History of ALGO as a global reward in YLDY Staking."
                                xAxisLabel="Date/Time of Record"
                                yAxisLabel="Amount of ALGO"
                                dataTitle="ALGO in Global Unlock Rewards (TAP)"
                                decimalPrecision={2}
                                lineColor="#6cdef9"
                                lineHandleColor="grey"
                                displayAverage
                                displayDataKeyDesc
                                graphHeight={175}
                            />
                        </Col>
                        <Col>
                            <AppStateHistoryGraph
                                applicationID={this.state.yldyStakingAppID}
                                dataKey="TYUL"
                                valueType="YLDY"
                                sectionTitle="YLDY Global Rewards History"
                                sectionShortDesc="History of YLDY as a global reward in YLDY Staking."
                                xAxisLabel="Date/Time of Record"
                                yAxisLabel="Amount of YLDY"
                                dataTitle="YLDY in Global Unlock Rewards (TYUL)"
                                displayAverage
                                displayDataKeyDesc
                                graphHeight={175}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="position-fixed" style={{
                right: "1rem",
                top: "5rem",
                width: "275px"
            }}>
                <Toast 
                    className="d-inline-block m-1 bg-secondary" 
                    onClose={() => this.setState({ showAdvert: false })}
                    show={this.state.showAdvert} 
                    animation={true}>
                    <Toast.Header>
                    <img
                        src={ process.env.PUBLIC_URL + "/images/stitchbob-yieldlings.jpg" }
                        className="rounded me-2 mr-2"
                        width="35"
                        alt=""
                        />
                        <strong className="me-auto">
                            Interested in NFT's?
                        </strong>
                        <div className="mr-auto"/>
                    </Toast.Header>
                    <Toast.Body className="bg-secondary">
                        Check out the original series of Yieldly NFT's, Yieldlings, created by Stitchbob.
                        <br />
                        <a 
                            href="https://ab2.gallery/address/5DYIZMX7N4SAB44HLVRUGLYBPSN4UMPDZVTX7V73AIRMJQA3LKTENTLFZ4"
                            target="noreferrer">
                            Stitchbob's AB2 Gallery
                        </a>
                    </Toast.Body>
                </Toast>
            </div>
        </div>
        );
    }
}

export default Home;
