import React, { Component } from 'react';
import {
    HashRouter,
    Route,
    Switch,
} from 'react-router-dom';

import Home from "../Home";
import Header from "../Header";
import FourOhFour from "../FourOhFour";

class App extends Component {
    render() {
        return (
            <HashRouter>
                <Header />

                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route component={FourOhFour} />
                </Switch>
            </HashRouter>
        );
    }
}

export default App;