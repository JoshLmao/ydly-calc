import React, { Component } from 'react';
import {
    Container
} from 'react-bootstrap';
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    Button
} from 'react-bootstrap';

import CONFIG from "../../../config.json";

import "./About.css";

class About extends Component {
    render() {
        return (
            <div className="stretched-background">
                <Container className="py-5">
                    <div>
                        {/* App title */}
                        <h1>
                            Yieldly Rewards Estimator
                        </h1>
                        {/* Sub text & action */}
                        <div>
                            <h6 className="py-2">
                                App for calculating your yieldly rewards.
                                <br/><br/>
                                Input your current tickets in the current No Loss Lottery or <br/>your stake in the YDLY Staking and view your estimated rewards
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
                            <a 
                                className="mx-1"
                                href={CONFIG.github_link}>
                                <Button>
                                    <FontAwesomeIcon icon={faGithub} />
                                </Button>
                            </a>
                            <a 
                                className="mx-1"
                                href={CONFIG.twitter_link}>
                                <Button>
                                    <FontAwesomeIcon icon={faTwitter} />
                                </Button>
                            </a>
                            <div className="mx-1 pr-2 my-auto">
                                Created by 
                                <a className="mx-1" href={CONFIG.creator_link}>JoshLmao</a>
                            </div>
                        </div>
                        
                        <div>
                            <h6 className="mb-2 pb-0">Support/ALGO donations</h6>
                            <img
                                className="mx-2" 
                                alt="Algorand Icon"
                                src={process.env.PUBLIC_URL + "/images/algorand_circle_white.png"} style={{
                                height: "25px",
                                width: "25px"
                            }} />
                             { CONFIG.algo_donations_address }
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}

export default About;