import React, { Component } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import ClaimHistory from '../ClaimHistory';
import StakeHistory from '../StakeHistory/StakeHistory';

import { getAddressTransactionsAsync } from "../../js/AlgoExplorerAPI";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

class StakeClaimStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userAlgoAddress: null, //PQZ46R4RKOST3NJQS6OHHRSUGC63LEISCQHKWO5OFHRPIC65JR4DK33AIY
            appAddress: "FMBXOFAQCSAD4UWU4Q7IX5AV4FRV6AKURJQYGXLW3CTPTQ7XBX6MALMSPY",

            allTransactions: null,
            loadingAllTx: false,
        };

        this.onRetrieveTransactions = this.onRetrieveTransactions.bind(this);
    }

    onRetrieveTransactions() {
        if (this.state.userAlgoAddress) {
            this.setState({
                loadingAllTx: true,
            });

            getAddressTransactionsAsync(this.state.userAlgoAddress).then((allTransactions) => {
                this.setState({
                    allTransactions: allTransactions,
                    loadingAllTx: false,
                });
            });
        } else {
            this.setState({
                allTransactions: null,
            });
        }
    }

    render() {
        return (
            <div className="all-text-white primary-background">
                <div className="bg-dark py-5">
                    <Container>
                        <p className="lead pt-2">
                            Enter your Algorand address and press 
                            <FontAwesomeIcon
                                className="mx-2"
                                icon={faArrowCircleRight}
                                />
                            to retrieve your claim and staking history.
                        </p>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                onChange={(e) => this.setState({ userAlgoAddress: e.target.value })}
                                placeholder="Your Algorand address"
                                />
                            <Button 
                                className="mx-2"
                                variant="primary" 
                                onClick={() => this.onRetrieveTransactions() }>
                                <FontAwesomeIcon
                                    icon={faArrowCircleRight}
                                    />
                            </Button>
                        </div>
                        
                        {
                            this.state.loadingAllTx && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    size="2x"
                                    />
                            )
                        }
                    </Container>
                </div>
                <div className="bg-dark border-top border-primary py-5">
                    <Container>
                        <ClaimHistory
                            userAddress={this.state.userAlgoAddress}
                            appAddress={this.state.appAddress}
                            allTransactions={this.state.allTransactions}
                            />
                    </Container>
                </div>

                <div className="bg-dark border-top border-primary py-5">
                    <Container>
                        <StakeHistory
                            userAddress={this.state.userAlgoAddress}
                            appAddress={this.state.appAddress}
                            allTransactions={this.state.allTransactions}
                            />
                    </Container>
                </div>
            </div>
        );
    }
}

export default StakeClaimStats;