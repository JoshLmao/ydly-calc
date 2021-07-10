import React, { Component } from 'react';
import {
    Container,
    Form,
    Row,
    Col
} from 'react-bootstrap';
import firebase from "firebase/app";

import NoLossLottery from '../NoLossLottery/NoLossLottery';
import YLDYStaking from '../YLDYStaking/YLDYStaking';
import About from './About/About';

import "./Home.css";

import CONFIG from "../../config.json";
import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: null,

            nllAppID: 233725844,
            yldyStakingAppID: 233725850,
        };

        this.initFirebase = this.initFirebase.bind(this);

        // Prepare now for children to get on mount
        this.initFirebase();
    }

    initFirebase() {
        // Get API key and Database url from environment variables
        let apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
        let databaseUrl = process.env.REACT_APP_FIREBASE_DATABASE_URL;
        if (!CONFIG.firebase_config || !apiKey || !databaseUrl) {
            console.error("Error initializing Firebase. Is the config set correctly? Have you set environment variables?");
            return;            
        }

        if (firebase.apps.length === 0) {
            // Initialize Firebase if not already
            let fullConfig = {
                apiKey: apiKey,
                databaseURL: databaseUrl,
                projectId: CONFIG.firebase_config.projectId,
                authDomain: CONFIG.firebase_config.authDomain,
                storageBucket: CONFIG.firebase_config.storageBucket,
            };
            firebase.initializeApp(fullConfig);
        } 
    }

    render() {
        return (
            <div
                className="all-text-white primary-background">
                <About />

                <Container className="py-5">
                    <h1
                        className="yieldly-main-color"
                        >Algorand Address</h1>
                    <p>
                        Insert your Algorand address that you have used with Yiedly to automatically gather the user variables required.
                        This app only uses your address to query the <a href="https://algoexplorer.io">algoexplorer.io</a> API to gather the required values.
                        <br/>
                        The app will update the sections below automatically once given an address. If you are having issues, try removing the address and trying again.
                        <br/><br/>
                        Warning: entering an Algorand address will clear any custom tickets or staked YLDY values entered below.
                    </p>

                    <div className="d-flex">
                        <h6>Algorand Address:</h6>
                        <Form.Control 
                            type="text" 
                            placeholder="Your Algorand Address that has interacted with the Yieldly platform" 
                            value={this.state.userAlgoAddress ?? ""} 
                            onChange={(e) => this.setState({ userAlgoAddress: e.target.value })} />
                    </div>
                </Container>

                <div className="secondary-background">
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
                        sectionShortDesc="History of the global unlock rewards for the No Loss Lottery"
                        xAxisLabel="Date/Time of Record"
                        yAxisLabel="Amount of YLDY"
                        dataTitle="YLDY in Global Unlock Rewards"
                        graphHeight={125}
                        />
                    </Container>
                </div>

                {/* Separator */}
                <div className="my-3" />

                <div>
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
                                    sectionShortDesc="History of ALGO as a global reward in YLDY Staking"
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of ALGO"
                                    dataTitle="ALGO in Global Unlock Rewards"
                                    decimalPrecision={2}
                                    lineColor="#6cdef9"
                                    lineHandleColor="grey"
                                    />
                            </Col>
                            <Col>
                                <AppStateHistoryGraph
                                    applicationID={this.state.yldyStakingAppID}
                                    dataKey="TYUL"
                                    valueType="YLDY"
                                    sectionTitle="YLDY Global Rewards History"
                                    sectionShortDesc="History of YLDY as a global reward in YLDY Staking"
                                    xAxisLabel="Date/Time of Record"
                                    yAxisLabel="Amount of YLDY"
                                    dataTitle="YLDY in Global Unlock Rewards"
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