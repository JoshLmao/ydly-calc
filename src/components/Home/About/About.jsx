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
                            Yiedly Rewards Calculator
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
                        <div className="d-flex my-3">
                            <a href={CONFIG.github_link}>
                                <Button>
                                    <FontAwesomeIcon icon={faGithub} />
                                </Button>
                            </a>
                            <a href={CONFIG.twitter_link} className="mx-2">
                                <Button>
                                    <FontAwesomeIcon icon={faTwitter} />
                                </Button>
                            </a>
                            <div className="pr-2 my-auto">
                                Created by 
                                <a className="mx-1" href={CONFIG.creator_link}>JoshLmao</a>
                            </div>
                        </div>
                        <div>
                            <h6 className="mb-2 pb-0">Support/ALGO donations</h6>
                            <img
                                className="mx-2" 
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