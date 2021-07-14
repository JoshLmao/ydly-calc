import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import { getYLDYTokenTopHoldersAsync } from '../../js/AlgoExplorerAPI';
import { formatNumber, fromMicroValue, toMicroValue } from '../../js/utility';

class YLDYAssetStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            limit: null,
            minimumYldy: toMicroValue(1),

            // All holders, original data from API
            topHolders: null,
            // Current table data to display
            tableData: null,

            tableLimit: null,
        };

        this.refreshTopHolders = this.refreshTopHolders.bind(this);
        this.insertTableData = this.insertTableData.bind(this);
    }

    componentDidMount() {
        this.refreshTopHolders();
    }

    refreshTopHolders() {
        // Set to isLoading
        this.setState({
            loadingHolders: true,
        });
        // Get top holders
        getYLDYTokenTopHoldersAsync(this.state.limit, this.state.minimumYldy, null).then((topHolders)  => {
            this.setState({
                loadingHolders: false,
                topHolders: topHolders,
            }, () => {
                this.insertTableData();
            });
        });
    }

    insertTableData () {
        if (this.state.topHolders) {
            // Sort by highest amount
            let sort = this.state.topHolders.sort((a, b) => {
                if (a.amount > b.amount)
                    return -1;
                else if (a.mount < b.amount)
                    return 1;
                return 0;
            });
            // Set tableData
            this.setState({
                tableData: sort,
            });
        }
    }

    render() {
        return (
            <div className="bg-dark py-2 all-text-white">
                <Container className="py-5">
                    <h1>Yieldly Statistics</h1>
                    <div className="py-2">
                        {/* Top Holders */}
                        <h3>Top Holders</h3>
                        <p>
                            Top YLDY asset holders. Displaying the top '{this.state.tableData?.length ?? "-1"}' holders that have more than '{formatNumber(fromMicroValue(this.state.minimumYldy))}' YLDY
                        </p>
                        {/* Loading spinner for table data */}
                        {
                            this.state.loadingHolders && (
                                <div className="d-flex">
                                    <div className="mx-auto h-100 d-flex">
                                        <FontAwesomeIcon 
                                                icon={faSpinner} 
                                                size="2x" 
                                                spin 
                                            />
                                        <div className="mx-3 my-auto">
                                            This may take some time...
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        <div 
                            className="yldy-scrollbar"
                            style={{
                                maxHeight: "450px",
                                overflowY: "auto",
                            }}>
                        {
                            this.state.tableData && (
                                <Table 
                                    bordered 
                                    size="sm"
                                    responsive="md"
                                    className="m-0 all-text-white"
                                    >
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Algorand Address</th>
                                            <th className="text-right">Total YLDY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.tableData.map((holder, index) => {
                                                return (
                                                    <tr 
                                                        key={`${index}-${holder}`}
                                                        style={{
                                                            maxHeight: "400px",
                                                            overflowY: "auto",
                                                            width: "100%"
                                                        }}>
                                                        <td>{ index + 1}</td>
                                                        <td>
                                                            <a href={ "https://algoexplorer.io/address/" + holder.address }> 
                                                                { holder.address }
                                                            </a>
                                                        </td>
                                                        <td className="text-right">
                                                            { 
                                                                formatNumber(
                                                                    fromMicroValue( 
                                                                        holder.amount
                                                                    ).toFixed(3)
                                                                ) 
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            )
                        }
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}

export default YLDYAssetStats;