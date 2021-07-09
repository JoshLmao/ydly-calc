import React, { Component } from 'react';
import {
    Line
} from 'react-chartjs-2';

import firebase from "firebase/app";
import "firebase/database";
import { fromMicroValue } from '../../js/utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTruckMonster } from '@fortawesome/free-solid-svg-icons';

const config = {
    apiKey: "AIzaSyCJiyn2Q_6TIjFwXWHsQnXiFbrZH8C47wM",
    projectId: "yldy-estimator",
    databaseURL: "https://yldy-estimator-default-rtdb.europe-west1.firebasedatabase.app",
    authDomain: "yldy-estimator.firebaseapp.com",
    storageBucket: "yldy-estimator.appspot.com",
};

class AppStateHistoryGraph extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            // Application ID to use for this graph
            applicationID: props.applicationID,

            // Limit on the amount of data to show
            dataLimit: 100,

            lineState: null,
        };

        this.createState = this.createState.bind(this);
    }

    componentDidMount() {
        // Initialize Firebase if not already
        if (firebase.apps.length === 0) {
            firebase.initializeApp(config);
        }

        this.createState();
    }

    createState() {
        this.setState({
            loadingFirebaseData: true,
        });

        let graphLabels = [];
        let graphData = [];

        if (firebase) { 
            firebase.database().ref(`${this.state.applicationID}/`).limitToFirst(this.state.dataLimit).once('value').then((snapshot) => {
                const data = snapshot.val();
                
                for(let epochTimeKey in data) {
                    // Parse Epoch MS to Date and format display string
                    let date = new Date(parseInt(epochTimeKey));
                    let formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    graphLabels.push(formatted);

                    // Append data value
                    let rewardPoolValue = Math.floor(fromMicroValue(data[epochTimeKey].TYUL));
                    graphData.push(rewardPoolValue);
                }

                this.setState({
                    loadingFirebaseData: false,
                });
            });
        }

        this.setState({
            lineState: {
                labels: graphLabels,
                datasets: [
                    {
                        label: 'YLDY in Global Unlock Rewards',
                        backgroundColor: 'rgba(254, 215, 56, 1)',
                        borderColor: 'rgba(254, 215, 56, 1, 1)',
                        borderWidth: 1,
                        data: graphData,
                    }
                ]
            }
        });
    }

    render() {
        return (
            <div>
                <h3 className="">
                    History
                </h3>
                <p>
                    Line chart of the history of the global unlock rewards for the No Loss Lottery. The graph will either show as many entries that exist or the last {this.state.dataLimit} entries. 
                    The data is currently updated every 12 hours. 
                </p>
                {
                    this.state.loadingFirebaseData &&
                        <div className="w-100">
                            Fetching the latest data...
                            <FontAwesomeIcon 
                                spin
                                className="mx-auto"
                                icon={faSpinner} size="2x" />
                        </div>
                }
                {
                    this.state.lineState && !this.state.loadingFirebaseData &&
                    <Line 
                        data={ this.state.lineState }
                        height={ 125 }
                        options={{
                            legend: {
                                display: true,
                                position: 'right',
                                color: "white",
                            },
                            scales: {
                                // X axis
                                x: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: 'Date/Time of Record',
                                        color: "white"
                                    },
                                    ticks: {
                                        color: "white"
                                    }
                                },
                                // Y Axis
                                y: {
                                    display: true,
                                    title: {
                                        display: true,
                                        text: "Amount of YLDY",
                                        color: "white"
                                    },
                                    ticks: {
                                        color: "white"
                                    }
                                }
                            }
                        }}
                        />
                }
            </div>
        );
    }
}

export default AppStateHistoryGraph;