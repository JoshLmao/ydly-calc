import React, { Component } from 'react';
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom';

import Home from "../Home";
import Header from "../Header";
import FourOhFour from "../FourOhFour";

class App extends Component {
    render() {
        return (
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Header />

                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route component={FourOhFour} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;