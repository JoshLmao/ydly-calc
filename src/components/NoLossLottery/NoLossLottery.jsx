import React, { Component } from 'react';
import {
    Row, 
    Col,
    Form
} from 'react-bootstrap';

class NoLossLottery extends Component {
    constructor(props)
    {
        super(props);

        this.state = {
            userTime: null,
            userAmount: null,
        };
    }

    render() {
        return (
            <Row>
                {/* User Variables, from user address App's section in algoexplorer.io */}
                <Col md={4}>
                    <h1>User Variables</h1>
                    <p>Navigate to <a href="https://algoexplorer.io">algoexplorer.io</a>, find your address, click the 'Apps' tab and click the Eye icon on "ID 233725844", the No Loss Lottery contract by the Yiedly Team </p>
                    <Row>
                        <Col md={6}>
                            <h6>
                                User Time (UT)
                            </h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="UT value" onChange={(e) => this.setState({ userTime: e.target.value })} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h6>
                                User Amount (UA)
                            </h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="UA value" onChange={(e) => this.setState({ userAmount: e.target.value })} />
                        </Col>
                    </Row>
                </Col>

                {/* Global Values */}
                <Col md={4}>
                    <h1>Contract Variables</h1>
                    <p>Variables loaded as part of the contract. Automatically loaded by parsing the values from the contract's <a href="https://algoexplorer.io">algoexplorer.io</a> page.</p>
                    <Row>
                        <Col md={6}>
                            <h6>Global Time (GT)</h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="GT value" disabled />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h6>Global Amount (GA)</h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="GA value" disabled />
                        </Col>
                    </Row>
                </Col>

                <Col md={4}>
                    <h1>Results</h1>
                    <p></p>
                    <Row>
                        <Col md={6}>
                            Time Period
                        </Col>
                        <Col md={6}>
                            Time Period Selector
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            Global Staking Shares
                            <Form.Control type="text" placeholder="TBD"/>
                        </Col>
                        <Col>
                            User Staking Shares
                            <Form.Control type="text" placeholder="TBD"/>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            Rewards Claimable for User
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="-1"></Form.Control>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default NoLossLottery;