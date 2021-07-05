import React, { Component } from 'react';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Container,
    Row
} from 'react-bootstrap';
import NoLossLottery from '../NoLossLottery/NoLossLottery';

class Home extends Component {
    render() {
        return (
            <div style={{
                background: "#505050"
            }}>
                <Container 
                    className="faded-background"
                    style={{
                        height: "auto",
                        paddingTop: "7rem",
                        paddingBottom: "7rem",
                    }}>
                    <div className="text-center">
                        {/* App title */}
                        <h1>
                            YDLY Calculator
                        </h1>
                        {/* Sub text & action */}
                        <div>
                            <h6 className="py-2">
                                Web app for calculating your YDLY reward stake from the current global rewards in the pool
                            </h6>
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            <a 
                                className="px-2 mr-1"
                                href="https://joshlmao.com" 
                                style={{ color: "white" }}>
                                <h6 className="my-auto">JoshLmao</h6>
                            </a>
                            <a href="https://twitter.com/JoshLmao">
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                        </div>
                    </div>
                </Container>

                <Container>
                    <h1>No Loss Lottery</h1>
                    <h6>Contract: <a href="https://algoexplorer.io/application/233725844">233725844</a></h6>
                    <NoLossLottery />
                </Container>
            </div>
        );
    }
}

export default Home;