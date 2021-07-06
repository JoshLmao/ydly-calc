import React, { Component } from 'react';
import {
    Form,
    Button,
    Row, 
    Col
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { 
    getContractValues,
    getUserStateValues
} from '../../js/AlgoExplorerAPI';
import {
    formatNumber,
    fromMicroValue,
    isStringBlank
} from '../../js/utility';

import ALGO_ICON from "../../svg/algo-icon.svg";
import YDLY_ICON from "../../svg/ydly-icon.svg";

class YDLYStaking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // YDLY Staking application/contract id
            applicationID: 233725850,

            fetchingGlobalVars: false,

            // User vars
            userTime: null,
            userAmount: null,
            userStakingShares: null,

            // Application Vars
            globalTime: null,           // GT
            globalStakingShares: null,  // GSS
            totalYdlyRewards: null,     // TYUL
            totalAlgoRewards: null,     // TAP

            daysPeriod: 1,

            usrVarsErrorMsg: null,
        };

        this.fetchUserVariables = this.fetchUserVariables.bind(this);
        this.onDaysPeriodChanged = this.onDaysPeriodChanged.bind(this);
    }

    componentDidMount() {
        this.setState({
            fetchingGlobalVars: true,
        });

        // Get these keys from application's state
        // Global Time (GT), Global Staking Shares (GSS), Total YDLY rewards (TYUL), Total ALGO rewards (TAP)
        let allKeys = [
            "GT", "GSS", "GA", "TYUL", "TAP"
        ];
        getContractValues(this.state.applicationID, allKeys, (appVars) => {
            if (appVars) {
                this.setState({
                    globalTime: appVars["GT"],
                    globalStakingShares: appVars["GSS"],
                    globalAmount: appVars["GA"],

                    totalYdlyRewards: appVars["TYUL"],
                    totalAlgoRewards: appVars["TAP"],

                    fetchingGlobalVars: false,
                });
            }
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAlgoAddress != this.props.userAlgoAddress) {
            this.setState({
                algoAddress: this.props.userAlgoAddress,
            }, () => {
                this.fetchUserVariables();
            })
        }
    }

    onDaysPeriodChanged(e) {
        let newVal;
        if (e.target.value < 0) {
            newVal = 0;
        } else {
            newVal = e.target.value;
        }

        this.setState({
            daysPeriod: newVal,
        });
    }

    fetchUserVariables() {
        if (this.state.usrVarsErrorMsg) {
            this.setState({
                usrVarsErrorMsg: null,
            });
        }

        if (this.state.algoAddress && !this.state.fetchingUsrVars) {

            // Check address is valid
            if (isStringBlank(this.state.algoAddress)) {
                return;
            }

            this.setState({
                fetchingUsrVars: true,
            });
            console.log("Retrieving YDLY Staking user state vars...");

            getUserStateValues(this.state.algoAddress, this.state.applicationID, (data) => {
                if (data) {
                    console.log(`Successfully got user variables from application '${this.state.applicationID}' on address '${this.state.algoAddress}'`);
                    this.setState({
                        fetchingUsrVars: false,
                        userTime: data.userTime,
                        userAmount: data.userAmount,
                        userStakingShares: data.userStakingShares,
                    }, () => {
                        //this.updateResults();
                    });
                } else {
                    //console.error("No user state values in address!");
                    this.setState({
                        usrVarsErrorMsg: "Address hasn't interacted with Yiedly application or another error",
                        fetchingUsrVars: false,
                    });
                }
            });
        }
        else {
            //console.error("Algo address is empty or currently updating values!");
            this.setState({
                usrVarsErrorMsg: "Algorand address is empty or already updating values! Please try entering a new Algorand address",
                fetchingUsrVars: false,
            });
        }
    }

    render() {
        return (
            <div className="main-background py-5" data-spy="scroll" data-target="#estimator-navbar">
                <h1 id="ydly-staking">YDLY Staking</h1>
                <h6>
                    YDLY Staking Application: <a href={'https://algoexplorer.io/application/' + this.state.applicationID}>{this.state.applicationID}</a>
                </h6>

                {/* Display error message if one is set*/}
                {
                    this.state.usrVarsErrorMsg &&
                    <div style={{ color: "rgb(255, 50, 50)" }}>
                        { this.state.usrVarsErrorMsg }
                    </div>
                }

                {/* All User/Application variables */}
                <Row>
                    <Col md={6}>
                        <h3>User Variables</h3>
                        <Row>
                            <Col>
                                <h6>User Time (UT)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    disabled
                                    value={ this.state.userTime ? new Date(this.state.userTime * 1000 ).toString() : "" }
                                    placeholder="User Time (UT)"
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Staked YDLY</h6>
                            </Col>
                            <Col className="d-flex">
                                <img
                                    src={YDLY_ICON}
                                    alt="Yieldly token icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control 
                                    type="text"
                                    disabled
                                    value={ this.state.userAmount ? formatNumber(fromMicroValue(this.state.userAmount).toFixed(0)) : "" }
                                    placeholder="User Amount (UA)"
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>User Staking Shares (USS)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    disabled
                                    value={ this.state.userStakingShares != null ? formatNumber(fromMicroValue(this.state.userStakingShares).toFixed(0)) : "" }
                                    placeholder="User Staking Shares (USS)"
                                    />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={6}>
                        <h3>Application Variables</h3>

                        <Row>
                            <Col>
                                <h6>Global Time (GT)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    value={ this.state.globalTime ? new Date(this.state.globalTime * 1000).toString() : "" }
                                    placeholder="Global Time (GT)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Total YDLY amount in YDLY Staking</h6>
                            </Col>
                            <Col className="d-flex">
                                <img
                                    src={YDLY_ICON}
                                    alt="Yieldly token icon"
                                    width="25"
                                    height="25"
                                    className="my-auto mr-1"
                                    />
                                <Form.Control 
                                    type="text"
                                    value={ this.state.globalAmount ? formatNumber(fromMicroValue(this.state.globalAmount).toFixed(0)) : "" }
                                    placeholder="Global Amount (GA)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h6>Global Staking Shares (GSS)</h6>
                            </Col>
                            <Col>
                                <Form.Control 
                                    type="text"
                                    value={ this.state.globalStakingShares ? formatNumber(fromMicroValue(this.state.globalStakingShares).toFixed(0)) : "" }
                                    placeholder="Global Staking Shares (GSS)"
                                    disabled
                                    />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <div>
                    <h3>
                        Time Period (days)
                    </h3>
                    <Row>
                        <Col>
                            <p>Set a custom time period to see how many rewards you could earn in that period.</p>
                        </Col>
                        <Col>
                            <Form.Control 
                                type="number"
                                onChange={ this.onDaysPeriodChanged }
                                value={ this.state.daysPeriod }
                                placeholder="Amount of days"
                                />
                        </Col>
                    </Row>
                </div>

                <div>
                    <h3>
                        Global Unlock Rewards
                    </h3>
                    
                    <Row>
                        <Col>
                            Total ALGO available in pool
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={ALGO_ICON}
                                alt="Algorand icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                value={ this.state.totalAlgoRewards ? formatNumber(fromMicroValue(this.state.totalAlgoRewards).toFixed(0)) : "" }
                                placeholder="Total ALGO in pool"
                                disabled
                                />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            Total YDLY available in pool
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={YDLY_ICON}
                                alt="Algorand icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                value={ this.state.totalYdlyRewards ? formatNumber(fromMicroValue(this.state.totalYdlyRewards).toFixed(0)) : "" }
                                placeholder="Total YDLY in pool"
                                disabled
                                />
                        </Col>
                    </Row>
                </div>

                <div>
                    <h3>YDLY & ALGO Claimable Rewards</h3>
                    <Row>
                        <Col>
                            Claimable Algo tokens.
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={ALGO_ICON}
                                alt="Algorand icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                placeholder="TBD | ALGO rewards"
                                disabled
                                />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            Claimable Yieldly tokens.
                        </Col>
                        <Col className="d-flex">
                            <img
                                src={YDLY_ICON}
                                alt="Yieldly icon"
                                width="25"
                                height="25"
                                className="my-auto mr-1"
                                />
                            <Form.Control
                                type="text"
                                placeholder="TBD | YDLY rewards"
                                disabled
                                />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default YDLYStaking;