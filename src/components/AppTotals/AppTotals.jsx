import React, { Component } from 'react';
import { 
    Row,
    Col,
    Container
} from 'react-bootstrap';

import { constants } from "../../js/consts";

import AppStateHistoryGraph from '../AppStateHistoryGraph/AppStateHistoryGraph';

class AppTotals extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nllAppID: constants.NO_LOSS_LOTTERY_APP_ID,
            yldyStakingAppID: constants.YLDY_STAKING_APP_ID,
        };
    }

    render() {
        return (
            <div className="bg-dark mt-5 all-text-white">
                <Container className="py-5">
                    <h1>Application Totals</h1>
                    <p>
                        While the global unlock rewards are displayed on the main page, this page contains the gathered data on the global totals (GT) added to each application.
                        <br />
                        <i>This page may move or be renamed in the future.</i>
                    </p>
                    <Row>
                        <Col>
                            <AppStateHistoryGraph
                                applicationID={this.state.nllAppID}
                                dataKey="GA"
                                valueType="ALGO"
                                sectionTitle="No Loss Lottery"
                                sectionShortDesc="The total amount of ALGO entered into the No Loss Lottery at the given times"
                                xAxisLabel="Date/Time of Record"
                                yAxisLabel="Amount of ALGO"
                                dataTitle="Total ALGO entered into NLL by everybody"
                                lineColor="#6cdef9"
                                lineHandleColor="grey"
                                />
                        </Col>
                    </Row>
                </Container>

                <div className="bg-dark py-3">
                    <Container>
                        <Row>
                            <Col>
                                <AppStateHistoryGraph
                                        applicationID={this.state.yldyStakingAppID}
                                        dataKey="GA"
                                        valueType="YLDY"
                                        sectionTitle="YLDY Staking"
                                        sectionShortDesc="The total amount of YLDY being staked by everybody at the given times"
                                        xAxisLabel="Date/Time of Record"
                                        yAxisLabel="Amount of YLDY"
                                        dataTitle="Total YLDY being staked by everybody"
                                        />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}

export default AppTotals;