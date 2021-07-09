import React, { Component } from 'react';
import {
    Line
} from 'react-chartjs-2';

import firebase from "firebase/app";
import "firebase/database";
import { fromMicroValue } from '../../js/utility';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import CONFIG from "../../config.json";

class AppStateHistoryGraph extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            // Application ID to use for this graph
            applicationID: props.applicationID,
            // Limit on the amount of data to show
            dataLimit: props.dataLimit ?? 100,
            // State of line, used in graph
            lineState: null,

            // Amount of decimal precision to use on the data values
            decimalPrecision: props.decimalPrecision ?? 0,

            // Target firebase key to use and show values for
            // firebaseDB/{applicationID}/{dataKey}
            dataKey: props.dataKey,

            // Title of section
            sectionTitle: props.sectionTitle,
            // Descriotion before graph descrion
            sectionShortDesc: props.sectionShortDesc,
            // Label of the X axis
            xAxisLabel: props.xAxisLabel,
            // Label of the Y axis
            yAxisLabel: props.yAxisLabel,
            // Name of data displayed
            dataTitle: props.dataTitle,
            // Height of the overall graph
            graphHeight: props.graphHeight ?? null,
            
            // Color of the handles of the data line
            lineHandleColor: props.lineHandleColor ?? 'rgba(254, 215, 56, 1)',
            // Color of the line of the data
            lineColor: props.lineColor ?? 'rgba(254, 215, 56, 1)',
        };

        this.createState = this.createState.bind(this);
    }

    componentDidMount() {
        // Initialize Firebase if not already
        if (firebase.apps.length === 0 && CONFIG.firebase_config && CONFIG.firebase_config?.apiKey) {
            firebase.initializeApp(CONFIG.firebase_config);
        } else {
            console.error("Error initializing Firebase. Is the config set correctly?");
        }

        // Get data and set state
        this.createState();
    }

    createState() {
        // Dont load any data if no firebase auth
        if (firebase.apps.length <= 0)
            return;

        // Set isLoading
        this.setState({
            loadingFirebaseData: true,
        });

        let graphLabels = [];
        let graphData = [];

        // Call firebase and get data
        if (firebase) { 
            // db/{application_id}, limit data to certain amount
            firebase.database().ref(`${this.state.applicationID}/`).limitToFirst(this.state.dataLimit).once('value').then((snapshot) => {
                const data = snapshot.val();
                
                for(let epochTimeKey in data) {
                    // Parse Epoch MS to Date and format display string
                    let date = new Date(parseInt(epochTimeKey));
                    let formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    graphLabels.push(formatted);

                    // Append data value
                    let dataValue = fromMicroValue(data[epochTimeKey][this.state.dataKey]).toFixed(this.state.decimalPrecision);
                    graphData.push(dataValue);
                }

                // Finished loading
                this.setState({
                    loadingFirebaseData: false,
                });
            });
        }

        // Set state with finished data and labels
        this.setState({
            lineState: {
                labels: graphLabels,
                datasets: [
                    {
                        label: this.state.dataTitle ?? "Line 1",
                        backgroundColor: this.state.lineHandleColor,
                        borderColor: this.state.lineColor,
                        borderWidth: 1,
                        data: graphData,
                    }
                ]
            }
        });
    }

    render() {
        return (
            <div className="py-3">
                <h3 className="">
                    {this.state.sectionTitle}
                </h3>
                <p>
                    {this.state.sectionShortDesc} The graph will either show as many entries that exist or the last {this.state.dataLimit} entries. 
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
                        height={ this.state.graphHeight }
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
                                        text: this.state.xAxisLabel,
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
                                        text: this.state.yAxisLabel,
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