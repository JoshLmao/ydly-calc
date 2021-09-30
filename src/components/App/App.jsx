import React, { Component } from 'react';
import {
    BrowserRouter,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import { initFirebase } from '../../js/FirebaseAPI';

import Home from "../Home";
import Header from "../Header";
import Footer from "../Footer";
import FourOhFour from "../FourOhFour";
import YLDYAssetStats from '../YLDYAssetStats/YLDYAssetStats';
import StakeClaimStats from '../StakeClaimStats/StakeClaimStats';
import OpulStaking from '../StakingPools/OPULStaking';
import YLDYSMILEStakingPool from '../StakingPools/YLDY-SMILE/YLDYSMILEStakingPool';

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
                    {/* Homepage */}
                    <Route exact path="/" component={Home} />

                    {/* YLDY/OPUL Staking pool */}
                    <Route exact path="/yldy-opul-staking" component={ OpulStaking } />
                    {/* YLDY/SMILE Staking Pool */}
                    <Route exact path="/yldy-smile-staking" component={ YLDYSMILEStakingPool } />

                    {/* Redirect route from old url */}
                    <Redirect from="/opul-staking" to="/yldy-opul-staking" />

                    <Route exact path="/yldy-stats" component={YLDYAssetStats} />
                    <Route exact path="/stake-claim-stats" component={StakeClaimStats} />
                    
                    <Route component={FourOhFour} />
                </Switch>
                
                <Footer />
            </BrowserRouter>
        );
    }
}

export default App;
