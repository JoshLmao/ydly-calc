import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Container, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Line } from "react-chartjs-2";

import { constants } from "../../js/consts";
import { getApplicationData } from '../../js/FirebaseAPI';
import { appIDToName, getBestGraphHeight, toMicroValue, unitToIcon } from '../../js/utility';
import { calculateYLDYRewardsFromDayPeriod } from '../../js/YLDYCalculation';

class HistoricalRewards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appID: props.appID ?? constants.YLDY_STAKING_APP_ID,     // main app id to use as data
            stakedYLDY: 1000, // Amount of YLDY staked
            fbDataDayLimit: 7,  // Amount of days to display firebase data

            stakeToken: props.stakeToken ?? "?",

            // What unit is given to the user when claimed? YLDY, ALGO, OPUL
            claimTokens: props.claimTokens,

            loadingFirebaseData: false,
            loadingGraphData: false,
        };

        this.updateFirebaseData = this.updateFirebaseData.bind(this);
        this.updateGraphData = this.updateGraphData.bind(this);
        this.onStakedAmountChanged = this.onStakedAmountChanged.bind(this);
    }

    componentDidMount() {
        this.updateFirebaseData();
    }

    onStakedAmountChanged(e) {
        let newVal = parseInt(e.target.value);
        if (newVal < 1)
            newVal = 1;

        this.setState({ 
            stakedYLDY: newVal,
        }, () => this.updateGraphData());
    }

    updateFirebaseData() {
        this.setState({
            loadingFirebaseData: true,
        });

        let dataAmt = 6 * this.state.fbDataDayLimit; 
        getApplicationData(this.state.appID, dataAmt, (data) => {
            if (data) {
                this.setState({
                    firebaseData: data,
                    loadingFirebaseData: false,
                }, () => {
                    this.updateGraphData();
                });
            } else {
                console.error("No data received from firebase.");
                return;
            }
        });
    }

    updateGraphData () {
        if (this.state.firebaseData) {
            this.setState({
                loadingGraphData: true,
            });

            let claimableYldyData = [];
            let claimableAlgoData = [];

            for (let epochTimeKey in this.state.firebaseData) {
                let dt = new Date(parseInt(epochTimeKey));
                let globalStateInfo = this.state.firebaseData[epochTimeKey];

                let stakedYLDY = toMicroValue(this.state.stakedYLDY);

                // Determine claimable YLDY amount, add to data if TYUL value exists
                if (globalStateInfo.TYUL) {
                    let claimableYldy = calculateYLDYRewardsFromDayPeriod(
                        0,
                        1,
                        stakedYLDY,
                        globalStateInfo.GSS,
                        globalStateInfo.TYUL
                    );
                    claimableYldyData.push({
                        x: dt.toISOString(),
                        y: claimableYldy,
                    });
                }

                // Determine claimable ALGO amount and add to data if TAP value exists
                if (globalStateInfo.TAP) {
                    let claimableAlgo = calculateYLDYRewardsFromDayPeriod(
                        0,
                        1,
                        stakedYLDY,
                        globalStateInfo.GSS,
                        globalStateInfo.TAP,
                    );
                    claimableAlgoData.push({
                        x: dt.toISOString(),
                        y: claimableAlgo,
                    });
                }
            }

            let yldyLineColor = "orange";
            let algoLineColor = "#6CDEF9";
            let allDatasets = [];
            
            if (claimableYldyData.length > 0) {
                allDatasets.push(
                    {
                        label: "Claimable YLDY",
                        data: claimableYldyData,
                        backgroundColor: yldyLineColor,
                        borderColor: yldyLineColor,
                        borderWidth: 1,
                        yAxisID: "left-y-axis",
                    }
                );
            }
            if (claimableAlgoData.length > 0) {
                allDatasets.push(
                    {
                        label: "Claimable ALGO",
                        data: claimableAlgoData,
                        yAxisID: "right-y-axis",
                        backgroundColor: algoLineColor,
                        borderColor: algoLineColor,
                        borderWidth: 1,
                        stepped: true,
                    }
                );
            }

            // Build initial scales with X and left Y axis
            let allScales = {
                x: {
                    type: "time",
                    time: {
                        unit: 'hour',
                    },
                    title: {
                        display: true,
                        text: "Day/Hour",
                        color: "white"
                    },
                    ticks: {
                        major: {
                           enabled: true, // <-- This is the key line
                           fontStyle: 'bold', //You can also style these values differently
                           fontSize: 14, //You can also style these values differently
                           color: "yellow",
                        },
                    },
                },
                'left-y-axis': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: this.state.claimTokens ? this.state.claimTokens[0] : "YLDY",
                        color: "white"
                    },
                    ticks: {
                        precision: 100,
                    }
                },
            };

            // Add right Y axis if both data exist
            if (claimableYldyData.length > 0 && claimableAlgoData.length > 0) {
                allScales = {
                    ...allScales,
                    'right-y-axis': {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: this.state.claimTokens ? this.state.claimTokens[1] : "ALGO",
                            color: "white"
                        },
                    }
                };
            }
            
            this.setState({
                loadingGraphData: false,
                lineData: {
                    datasets: allDatasets,
                },
                lineScales: allScales,
            });
        }
    }

    render() {
        return (
            <div>
                <Container>
                    <h2 className="yldy-title">When should I claim? | { appIDToName(this.state.appID) }</h2>
                    <p>
                        When is the best time to claim your rewards? The graph below shows how your rewards fluctuate over time, even during the day.
                        To maximise your rewards, you should claim when the rewards are the highest, which appears to be before the rewards update to a new day.
                        <br/>
                        Credit to Tommasso. Check out his detailed explaination 
                        <a 
                            href="https://www.reddit.com/r/algorand/comments/ojhord/yieldly_algo_staking_nll_new_rewards_unlock/"
                            className="mx-1">
                            here
                        </a> 
                        and his more detailed charts 
                        <a 
                            href="https://yieldly-charts.vercel.app/"
                            className="mx-1">
                            here
                        </a>
                    </p>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="stakedYLDY">
                                <Form.Label className="lead font-weight-bold">
                                    Staked { this.state.stakeToken }
                                </Form.Label>
                                <InputGroup className="mb-2">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>
                                            <img
                                                src={ unitToIcon(this.state.stakeToken) }
                                                className="my-auto mr-1"
                                                height={25}
                                                width={25}
                                                alt={ this.state.stakeToken + " icon" }
                                                />
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control
                                        size="lg"
                                        type="number"
                                        placeholder={`Amount of staked ${this.state.stakeToken}`}
                                        value={this.state.stakedYLDY}
                                        onChange={this.onStakedAmountChanged}
                                        />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="lead font-weight-bold">
                                    Duration
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    defaultValue="7"
                                    size="lg"
                                    value={this.state.fbDataDayLimit}
                                    placeholder="Week value here"
                                    onChange={(e) => this.setState({
                                        fbDataDayLimit: e.target.value,
                                    }, () => {
                                        this.updateFirebaseData();
                                    }) }>
                                    {
                                        [
                                            { val: 7, name: "week" },
                                            { val: 14, name: "fortnight" },
                                            { val: 30, name: "month" },
                                        ].map((value) => {
                                            return (
                                                <option 
                                                    value={value.val} 
                                                    key={value.name}>
                                                        { value.name }
                                                    </option>
                                            );
                                        })
                                    }
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    {
                        (this.state.loadingFirebaseData || this.state.loadingGraphData) && (
                            <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                        )
                    }
                    {
                        !this.state.loadingFirebaseData && !this.state.loadingGraphData && this.state.lineData && (
                            <Line
                                data={ this.state.lineData }
                                height={ getBestGraphHeight() }
                                options={{
                                    scales: this.state.lineScales,
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    // Build label string
                                                    let label = context.dataset.label || '';
                                                    if (label) {
                                                        label += ': ';
                                                    }
                                                    if (context.parsed.y !== null) {
                                                        // Use 5 decimal places
                                                        label += context.parsed.y.toFixed(5);
                                                    }
                                                    return label;
                                                }
                                            }
                                        }
                                    },
                                }}
                                />
                        )
                    }
                </Container>
            </div>
        );
    }
}

export default HistoricalRewards;