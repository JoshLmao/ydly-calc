import React, { Component } from 'react';
import {
    Container,
    Form
} from 'react-bootstrap';
import firebase from "firebase/app";

import NoLossLottery from '../NoLossLottery/NoLossLottery';
import YLDYStaking from '../YLDYStaking/YLDYStaking';
import About from './About/About';

import "./Home.css";

import CONFIG from "../../config.json";

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: null,
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
                    </Container>
                </div>

                {/* Separator */}
                <div className="my-3" />

                <div className="">
                    <Container className="">
                        <YLDYStaking 
                            userAlgoAddress={this.state.userAlgoAddress} 
                            firebase={this.state.firebase} 
                            />
                    </Container>
                </div>
            </div>
        );
    }
}

export default Home;