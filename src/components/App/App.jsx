import React, { Component } from 'react';
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom';
import { initFirebase } from '../../js/FirebaseAPI';

import Home from "../Home";
import Header from "../Header";
import Footer from "../Footer";
import FourOhFour from "../FourOhFour";
import AppTotals from '../AppTotals/AppTotals';

class App extends Component {
    constructor(props) {
        super(props);

        // Prepare now, before rest of app
        initFirebase();
    }

    render() {
        return (
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Header />

                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/totals" component={AppTotals} />
                    <Route component={FourOhFour} />
                </Switch>
                <Footer />

            </BrowserRouter>
        );
    }
}

export default App;
