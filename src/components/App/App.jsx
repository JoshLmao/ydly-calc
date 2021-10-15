import React, { Component } from 'react';
import {
    BrowserRouter,
    Route,
    Switch
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
import AllStakingPools from '../AllStakingPools/AllStakingPools';
import TopStakers from "../TopStakers";
import OPULOPULStakingPool from '../StakingPools/OPUL-OPUL/OPULOPULStakingPool';
import YLDYYLDYStaking from "../StakingPools/YLDY-YLDY/YLDYYLDYStaking";

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

                    {/* List view, all staking pools */}
                    <Route exact path="/staking-pools" component={ AllStakingPools } />

                    {/* YLDY/YLDY Staking Pool */}
                    <Route exact path="/yldy-yldy-staking" component={ YLDYYLDYStaking } />
                    {/* YLDY/OPUL Staking pool */}
                    <Route exact path="/yldy-opul-staking" component={ OpulStaking } />
                    {/* YLDY/SMILE Staking Pool */}
                    <Route exact path="/yldy-smile-staking" component={ YLDYSMILEStakingPool } />
                    {/* OPUL/OPUL staking */}
                    <Route exact path="/opul-opul-staking" component={ OPULOPULStakingPool } />


                    <Route exact path="/yldy-stats" component={YLDYAssetStats} />
                    <Route exact path="/top-stakers" component={ TopStakers } />
                    <Route exact path="/stake-claim-stats" component={StakeClaimStats} />
                    
                    <Route component={FourOhFour} />
                </Switch>
                
                <Footer />
            </BrowserRouter>
        );
    }
}

export default App;
