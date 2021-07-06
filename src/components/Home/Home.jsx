import React, { Component } from 'react';

import {
    Container
} from 'react-bootstrap';

import NoLossLottery from '../NoLossLottery/NoLossLottery';
import About from './About/About';

class Home extends Component {
    render() {
        return (
            <div style={{ background: "#505050" }}>
                <About />

                <div className="my-5"/>

                <Container>
                    <NoLossLottery />
                </Container>

                <div className="py-5"/>
            </div>
        );
    }
}

export default Home;