import React, { Component } from 'react';
import {
    Row, 
    Col,
    Form,
    Button
} from 'react-bootstrap';
import { getContractValues, getUserStateValues } from '../../js/AlgoExplorerAPI';

class NoLossLottery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Contract ID to use
            contractID: 233725844,

            fetchingVars: false,
            fetchingUsrVars: false,

            // User vars
            algoAddress: null,
            userTime: null,
            userAmount: null,
            // Contract global vars
            globalTime: null,
            globalAmount: null,

            // Calculated values
            globalStakingShares: null,
            userStakingShares: null, 
            totalClaimableRewards: null,
        };

        this.fetchContractValues = this.fetchContractValues.bind(this);
        this.fetchUserVariables = this.fetchUserVariables.bind(this);
    }

    fetchContractValues() {
        if (this.state.contractID != null && !this.state.fetchingVars)
        {
            this.setState({
                fetchingVars: true
            });
            console.log(`Fetching Contract '${this.state.contractID}' vars`);

            getContractValues(this.state.contractID, (contractVars) => {
                this.setState({
                    globalTime: contractVars.globalTime,
                    globalAmount: contractVars.globalAmount,

                    fetchingVars: false,
                });
            });
        }
    }

    fetchUserVariables () {
        if (this.state.algoAddress && !this.state.fetchingUsrVars) {
            this.setState({
                fetchingUsrVars: true,
            });
            console.log("Retrieving user state vars...");

            getUserStateValues(this.state.algoAddress, this.state.contractID, (data) => {
                this.setState({
                    fetchingUsrVars: false,
                    userTime: data.userTime,
                    userAmount: data.userAmount,
                });
            })
        }
    }

    render() {
        return (
            <Row>
                {/* User Variables, from user address App's section in algoexplorer.io */}
                <Col md={4}>
                    <h1>User Variables</h1>
                    <p>Navigate to <a href="https://algoexplorer.io">algoexplorer.io</a>, find your address, click the 'Apps' tab and click the Eye icon on "ID 233725844", the No Loss Lottery contract by the Yiedly Team </p>
                    <div className="d-flex">
                        <h6>Algorand Address:</h6>
                        <Form.Control type="text" placeholder="ALGO ADDRESS" onChange={(e) => this.setState({ algoAddress: e.target.value })} />
                    </div>
                    <Button 
                        className="my-2"
                        onClick={this.fetchUserVariables}>
                            Fetch User Values
                    </Button>
                    <Row>
                        <Col md={6}>
                            <h6>
                                User Time (UT)
                            </h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control 
                                type="text" 
                                placeholder="UT value" 
                                value={this.state.userTime}
                                onChange={(e) => this.setState({ userTime: e.target.value })} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h6>
                                User Amount (UA)
                            </h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control 
                                type="text" 
                                placeholder="UA value" 
                                value={this.state.userAmount}
                                onChange={(e) => this.setState({ userAmount: e.target.value })} />
                        </Col>
                    </Row>
                </Col>

                {/* Global Values */}
                <Col md={4}>
                    <h1>Contract Variables</h1>
                    <p>Variables loaded as part of the contract. Automatically loaded by parsing the values from the contract's <a href="https://algoexplorer.io">algoexplorer.io</a> page.</p>
                    <Button
                        className="my-2"
                        onClick={() => this.fetchContractValues()}>
                        Fetch Latest Contract Variables
                    </Button>
                    <Row>
                        <Col md={6}>
                            <h6>Global Time (GT)</h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="GT value" value={this.state.globalTime} disabled />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <h6>Global Amount (GA)</h6>
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="GA value" value={this.state.globalAmount} disabled />
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
                            <Form.Control type="text" placeholder="TBD" value={this.state.globalStakingShares} disabled />
                        </Col>
                        <Col>
                            User Staking Shares
                            <Form.Control type="text" placeholder="TBD" value={this.state.userStakingShares} disabled />
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            Rewards Claimable for User
                        </Col>
                        <Col md={6}>
                            <Form.Control type="text" placeholder="-1" value={this.state.totalClaimableRewards} disabled></Form.Control>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default NoLossLottery;