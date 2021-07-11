import React, { Component } from 'react';
import {
    Container
} from 'react-bootstrap';
import { 
    Button
} from 'react-bootstrap';

import CONFIG from "../../../config.json";

import ALGO_ICON from "../../../svg/algo-icon.svg";

class About extends Component {
    render() {
        return (
            <div className="all-text-white tertiary-background">
                <Container className="py-5">
                    <div>
                        {/* App title */}
                        <h1 className="yieldly-main-color">
                            Yieldly Rewards Estimator
                        </h1>
                        {/* Sub text & action */}
                        <div>
                            <h6 className="py-2">
                                App for calculating your yieldly rewards.
                                <br/><br/>
                                Input your current tickets in the current No Loss Lottery or <br/>your stake in the YLDY Staking and view your estimated rewards
                                <br /><br />
                                This website is not affiliated with Yieldly.
                            </h6>
                        </div>
                        <div className="d-flex my-2">
                            <a 
                                className="mr-1"
                                href={CONFIG.github_link + "/issues"}>
                                <Button variant="danger">
                                    Report an Issue
                                </Button>
                            </a>
                            <div className="mx-1 pr-2 my-auto">
                                Created by 
                                <a className="mx-1" href={CONFIG.creator_link}>JoshLmao</a>
                            </div>
                        </div>
                        
                        <div>
                            <h6 className="mb-2 pb-0">Support/ALGO donations</h6>
                            <div className="d-flex">
                                <img
                                    className="mx-2" 
                                    alt="Algorand Icon"
                                    src={ALGO_ICON} 
                                    height="25" 
                                    width="25"
                                    />
                                <div style={{
                                    overflow: "auto",
                                }}>
                                    { 
                                        CONFIG.algo_donations_address 
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}

export default About;