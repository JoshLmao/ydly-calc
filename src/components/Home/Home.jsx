import React, { Component } from 'react';

import {
    Container,
    Form,
    Button
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import NoLossLottery from '../NoLossLottery/NoLossLottery';
import YDLYStaking from '../YDLYStaking/YDLYStaking';
import About from './About/About';

import "./Home.css";

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: null,
        };
    }

    render() {
        return (
            <div
                className="all-text-white primary-background">
                <About />

                <Container className="py-5">
                    <h1>Algorand Address</h1>
                    <p>
                        Insert your Algorand address that you have used with Yiedly to automatically gather the user variables required.
                        This app only uses your address to query the <a href="https://algoexplorer.io">algoexplorer.io</a> API to gather the required values.
                        <br/>
                        The app will update the sections below automatically once given an address. If you are having issues, try removing the address and trying again.
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
                            userAlgoAddress={this.state.userAlgoAddress} />
                    </Container>
                </div>

                {/* Separator */}
                <div className="my-3" />

                <div className="">
                    <Container className="">
                        <YDLYStaking 
                            userAlgoAddress={this.state.userAlgoAddress} />
                    </Container>
                </div>
            </div>
        );
    }
}

export default Home;