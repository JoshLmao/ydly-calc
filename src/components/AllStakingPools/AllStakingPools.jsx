import React, { Component } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { unitToIcon } from "../../js/consts";

class AllStakingPools extends Component {
    constructor(props) {
        super(props);

        this.state = {
            poolsConfig: [
                {
                    title: "No Loss Lottery",
                    to: "/#no-loss-lottery",
                    unit: "YLDY"
                },
                {
                    title: "YLDY/YLDY Staking Pool",
                    to: "/#yldy-staking",
                    unit: "YLDY"
                },
                {
                    title: "YLDY/OPUL Staking Pool",
                    to: "yldy-opul-staking",
                    unit: "OPUL"
                },
                {
                    title: "YLDY/SMILE Staking Pool",
                    to: "yldy-smile-staking",
                    unit: "SMILE",
                }
            ]
        };
    }
    render() {
        return (
            <div className="all-text-white bg-dark">
         
                <Container className="py-5">
                    <h1
                        className={`display-5 font-weight-bold my-4`}>
                        All Staking Pools
                    </h1>

                    <ListGroup>
                    {
                        this.state.poolsConfig.map((config, index) => {
                            return (
                                <Link
                                    to={ !config.disabled ? config.to : "#" }
                                    className="pb-4 grow"
                                    style={{
                                        textDecoration: "none"
                                    }}
                                    >
                                    <ListGroup.Item
                                        variant={ `${config.disabled ? "dark" : "info" }` }
                                        className={ `text-dark rounded d-flex` }
                                        >
                                            <img
                                                alt="Unit icon"
                                                src={ unitToIcon(config.unit) }
                                                height="30"
                                                className="my-auto mr-3"
                                                style={{
                                                    filter: "drop-shadow(0px 0px 1px black)"
                                                }}
                                                />
                                        <h3
                                            className={`mb-0`}
                                            >
                                        {
                                            config.title
                                        }
                                        </h3>
                                        {
                                            config.soon && (
                                                <div
                                                    className="ml-auto mr-3 my-auto lead">
                                                    Coming soon...
                                                </div>
                                            )
                                        }
                                        
                                    </ListGroup.Item>
                                </Link>
                            )
                        })
                    }
                    </ListGroup>
                </Container>
                
            </div>
        );
    }
}

export default AllStakingPools;