import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                    stakingUnits: [ "ALGO" ],
                    rewardUnits: [ "YLDY" ],
                },
                {
                    title: "YLDY/YLDY Staking Pool",
                    to: "/yldy-yldy-staking",
                    stakingUnits: [ "YLDY" ],
                    rewardUnits: [ "YLDY", "ALGO" ],
                },
                {
                    title: "YLDY/OPUL Staking Pool",
                    to: "yldy-opul-staking",
                    stakingUnits: [ "YLDY" ],
                    rewardUnits: [ "OPUL" ],
                },
                {
                    title: "YLDY/SMILE Staking Pool",
                    to: "yldy-smile-staking",
                    stakingUnits: [ "YLDY" ],
                    rewardUnits: [ "SMILE" ],
                },
                {
                    title: "OPUL/OPUL Staking Pool",
                    to: "opul-opul-staking",
                    stakingUnits: [ "OPUL" ],
                    rewardUnits: [ "OPUL" ],
                },
                {
                    title: "SMILE/SMILE Staking Pool",
                    to: "smile-smile-staking",
                    stakingUnits: [ "SMILE" ],
                    rewardUnits: [ "SMILE" ],
                },
                {
                    title: "YLDY/ARCC Staking Pool",
                    to: `yldy-arcc-staking`,
                    stakingUnits: [ "YLDY" ],
                    rewardUnits: [ "ARCC" ],
                },
                {
                    title: "YLDY/GEMS Staking Pool",
                    to: 'yldy-gems-staking',
                    stakingUnits: [ "YLDY" ],
                    rewardUnits: [ "GEMS" ]
                },
                {
                    title: "GEMS/GEMS Staking Pool",
                    to: "gems-gems-staking",
                    stakingUnits: [ "GEMS" ],
                    rewardUnits: [ "GEMS" ]
                },
                // {
                //     title: "YLDY/XET Staking Pool",
                //     to: "yldy-xet-staking",
                //     stakingUnits: [ "YLDY" ],
                //     rewardUnits: [ "XET" ]
                // },
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
                                        <div
                                            className="my-auto"
                                            >
                                            {
                                                config.stakingUnits && config.stakingUnits.map((unit) => {
                                                    return (
                                                        <img
                                                            alt={ `${unit} icon` }
                                                            src={ unitToIcon(unit) }
                                                            height="30"
                                                            className="my-auto"
                                                            style={{
                                                                filter: "drop-shadow(0px 0px 1px black)"
                                                            }}
                                                            />
                                                    )
                                                })
                                            }
                                        </div>
                                            <FontAwesomeIcon
                                                className="my-auto mx-2"
                                                icon={ faArrowRight }
                                                />
                                        <div
                                            className="mr-2 my-auto">
                                            {
                                                config.rewardUnits && config.rewardUnits.map((unit) => {
                                                    return (
                                                        <img
                                                            alt={ `${unit} icon` }
                                                            src={ unitToIcon(unit) }
                                                            height="30"
                                                            className="my-auto mr-1"
                                                            style={{
                                                                filter: "drop-shadow(0px 0px 1px black)"
                                                            }}
                                                            />
                                                    )
                                                })
                                            }
                                        </div>

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