import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import { getClaimHistoryAsync } from "../../js/AlgoExplorerAPI";
import { fromMicroValue } from "../../js/utility";

class ClaimHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAddress: props.userAddress,
            appAddress: props.appAddress,

            allUserClaims: null,

            lineHandleColor: "rgb(255, 255, 255)",
            lineColor: "rgb(255, 255, 255)",
        };

        this.onUserAddressChanged = this.onUserAddressChanged.bind(this);
        this.buildGraphData = this.buildGraphData.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userAddress !== this.props.userAddress) {
            this.setState({
                userAddress: this.props.userAddress,
            }, () => {
                this.onUserAddressChanged();
            });
        }
    }

    onUserAddressChanged() {
        if (this.state.userAddress) {
            getClaimHistoryAsync(
                this.state.userAddress, 
                this.state.appAddress
            ).then((allUserTransactions) => {
                this.setState({
                    allUserClaims: allUserTransactions,
                }, () => {
                    this.buildGraphData();
                });
            });
        }
    }

    buildGraphData () {
        if (this.state.allUserClaims) {
            let labels = [];
            let data = [];

            // let first = new Date(this.state.allUserClaims[0]["round-time"] * 1000);
            // let last = new Date(this.state.allUserClaims[this.state.allUserClaims.length - 1]["round-time"] * 1000);
            for (let transaction of this.state.allUserClaims) {
                let asaT = transaction["asset-transfer-transaction"];
                
                // Label as locale date time of transaction
                let dateTime = new Date(transaction["round-time"] * 1000);
                
                if (asaT) {
                    labels.push(`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()}`);
                    data.push(fromMicroValue(asaT.amount));
                }
            }

            this.setState({
                lineData: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Previous rewards claimed over time",
                            data: data,
                            backgroundColor: this.state.lineHandleColor,
                            borderColor: this.state.lineColor,
                            borderWidth: 1,
                        }
                    ]
                }
            });
        }
    }

    render() {
        if (this.state.lineData) {
            return (
                <div>
                    <h1 id="claim-history">Claim History</h1>
                    <Line
                        data={ this.state.lineData }
                        options={{
                            spanGaps: true,
                        }}
                        />
                </div>
            );
        } else {
            return (
                <div>

                </div>
            )
        }
        
    }
}

export default ClaimHistory;