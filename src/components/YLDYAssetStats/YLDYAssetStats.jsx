import React, { Component } from 'react';
import { 
    Container, 
    Row,
    Col,
    Form
} from 'react-bootstrap';
import { constants } from "../../js/consts";
import { getApplicationData } from '../../js/FirebaseAPI';

import PoolStatistics from '../PoolStatistics/PoolStatistics';

const DATA_ENTRIES_ONE_DAY = 6;

function calcDifference (initial, final) {
    return final - initial;
}

function calcPercentDiff(initial, final) {
    return 100 * ((final - initial) / Math.abs(initial));
}

class YLDYAssetStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Limit amount when retrieving firebase data
            // 6 entries in a day, 7 days in a week
            dbWeekLimit: 6 * 7,
            // NLL db data for the week
            nllWeekData: null,
            nllDifference: null,
        };

        this.refreshNLLData = this.refreshNLLData.bind(this);
    }

    componentDidMount() {
        this.refreshNLLData();
    }

    refreshNLLData() {
        getApplicationData(constants.NO_LOSS_LOTTERY_APP_ID, this.state.dbWeekLimit, (data) => {
            if (data) {
                this.setState({
                    nllWeekData: data,
                }, () => {
                    let allKeys = Object.keys(this.state.nllWeekData);
                    let first = this.state.nllWeekData[allKeys[0]];
                    let last = this.state.nllWeekData[allKeys[allKeys.length - 1]];
                    let ticketDifference = calcDifference(first.GA, last.GA);
                    let percentIncrease = calcPercentDiff(first.GA, last.GA);
                    this.setState({
                        nllDifference: {
                            first: first.GA,
                            last: last.GA,
                            amount: ticketDifference,
                            percent: percentIncrease,
                        }
                    });
                });
            }
        });
    }

    render() {
        return (
            <div className="bg-dark py-2 all-text-white">
                <Container className="py-5">
                    <div>
                        <h2
                            className="yldy-title">
                            Yieldly Statistics
                        </h2>
                        <p className="lead">
                            Select a time period to display the historical data stored in the currently tracked pools. It may take a while to retrieve and display the data once changed.
                        </p>
                        <Row>
                            <Col
                                md="auto my-auto">
                                <Form.Label 
                                    className="lead font-weight-bold">
                                    Time Period:
                                </Form.Label>
                            </Col>
                            <Col>
                                <Form.Control
                                    as="select"
                                    defaultValue="7"
                                    value={this.state.fbDataDayLimit}
                                    placeholder="Week value here"
                                    onChange={(e) => this.setState({
                                        dbWeekLimit: DATA_ENTRIES_ONE_DAY * e.target.value,
                                    }, () => {
                                        this.refreshNLLData();
                                        this.refreshYLDYStakingData();
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
                            </Col>
                        </Row>
                    </div>
                </Container>

                <div className="bg-dark border-top border-info py-3" />

                <Container
                    className="mb-5">
                    <PoolStatistics
                        appID={ constants.NO_LOSS_LOTTERY_APP_ID }
                        poolName="No Loss Lottery"
                        stakeConfig={
                            [
                                {
                                    unit: "ALGO",
                                    key: "GA",
                                    lineColor: this.state.algoLineColor,
                                    decimals: 6,
                                }
                            ]
                        }
                        rewardsConfig={
                            [
                                {
                                    unit: "YLDY",
                                    key: "TYUL",
                                    lineColor: this.state.yldyLineColor,
                                    decimals: 6,
                                }
                            ]
                        }
                        />
                </Container>
            </div>
        );
    }
}

export default YLDYAssetStats;