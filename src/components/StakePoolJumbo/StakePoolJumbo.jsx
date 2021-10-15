import React, { Component } from 'react';

class StakePoolJumbo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            appID: props.appID ?? -1,
            title: props.title ?? "Staking Pool",
            unitVariant: props.unitVariant?.toLowerCase() ?? "light",
        };
    }

    render() {
        return (
            <div>
                <h1
                    className={`display-4 font-weight-bold text-center my-4 ${this.state.unitVariant}-title-shadowed`}>
                    { this.state.title }
                </h1>
                <p className="small text-center">
                    application address:{" "}
                    <a
                        href={ `https://algoexplorer.io/application/${this.state.appID}` }
                        target="_blank"
                        rel="noreferrer"
                        className={ `text-${this.state.unitVariant} font-weight-bold` }>
                        { this.state.appID }
                    </a>
                </p>
            </div>
        );
    }
}

export default StakePoolJumbo;