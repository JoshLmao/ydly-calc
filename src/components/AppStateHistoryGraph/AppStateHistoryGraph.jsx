import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import firebase from "firebase/app";
import "firebase/database";

import { convertToMicroValue } from '../../js/utility';
import { calculateAverage } from '../../js/YLDYCalculation';
import { getApplicationData, isFirebaseInitialized } from '../../js/FirebaseAPI';

const DATA_ENTRIES_ONE_DAY = 6;

class AppStateHistoryGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Application ID to use for this graph
            applicationID: props.applicationID,
            // Limit on the amount of data to show
            dataLimit: props.dataLimit ?? DATA_ENTRIES_ONE_DAY * 7,

            // Amount of decimal precision to use on the data values
            decimalPrecision: props.decimalPrecision ?? 0,
            // Amount of decimals to divide original number by before formatting
            decimals: props.decimals ?? 6,

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
            // Prefix of the values in the data (YLDY/ALGO/etc)
            valueType: props.valueType,

            // Data gained from Firebase
            firebaseData: null,
            // State of line, used in graph
            lineState: null,

            // Should the user be allowed to set custom time period to display data
            allowCustomTimePeriods: props.allowCustomTimePeriods ?? false,
        };

        this.createState = this.createState.bind(this);
    }

    componentDidMount() {
        // Get data and set state if firebase set
        this.createState();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dataLimit !== this.props.dataLimit) {
            this.setState({
                dataLimit: this.props.dataLimit,
            }, () => {
                this.createState();
            });
        }
    }

    createState() {
        // Dont load any data if no firebase auth
        if (!isFirebaseInitialized()) {
            console.error("Firebase uninitialized!");
            return;
        }

        // Set isLoading
        this.setState({
            loadingFirebaseData: true,
        });

        let graphLabels = [];
        let graphData = [];

        // Call firebase and get data
        if (firebase) {
            // db/{application_id}, limit data to certain amount
            getApplicationData(this.state.applicationID, this.state.dataLimit, (data) => {
                if (!data) {
                    console.error("Didn't reecieve any data");
                    return;
                }

                for(let epochTimeKey in data) {
                    // Parse Epoch MS to Date and format display string
                    let date = new Date(parseInt(epochTimeKey));

                    // Append data value
                    let dataValue = convertToMicroValue(data[epochTimeKey][this.state.dataKey], this.state.decimals).toFixed(this.state.decimalPrecision);
                    graphData.push({
                        x: date.toISOString(),
                        y: dataValue,
                    });
                }

                // Update state once complete
                this.setState({
                    loadingFirebaseData: false,
                    firebaseData: data,
                    // Work out average of graph data
                    dataAverage: calculateAverage(graphData),
                    // Build lineState
                    lineState: {
                        labels: graphLabels,
                        datasets: [
                            {
                                label: this.state.dataTitle ?? "Line 1",
                                backgroundColor: this.state.lineHandleColor,
                                borderColor: this.state.lineColor,
                                borderWidth: 1,
                                data: graphData,
                            },
                        ]
                    }
                });
            });
        }
    }

    render() {
        // If no firebase, display simple error message
        if (!isFirebaseInitialized()) {
            return (
                <div>
                    Sorry, Firebase couldn't be initialized. Blame Josh, he broke it.
                </div>
            )
        }
        return (
            <div>
                <h3>
                    { this.state.sectionTitle }
                </h3>
                <div>
                    {
                        this.state.sectionShortDesc && (
                            <div>
                                { this.state.sectionShortDesc }
                            </div>
                        )
                    }
                </div>

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
            </div>
        );
    }
}

export default AppStateHistoryGraph;