import React, { Component } from 'react';
import { 
    Nav,
    Navbar,
    Container,
    Button,
}from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGithub,
    faTwitter
} from '@fortawesome/free-brands-svg-icons';

import { getYLDYPrice } from '../../js/AlgoExplorerAPI';

import CONFIG from "../../config.json";
import YLDY_ICON from "../../svg/yldy-icon.svg";

import "./Header.css";

let pkg = require('../../../package.json');

class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            YLDYPrice: null,
        };
    }

    componentDidMount() {
        getYLDYPrice((price) => {
            this.setState({
                YLDYPrice: price,
            });
        })
    }

    render() {
        return (
            <Navbar 
                id="estimator-navbar"
                className="calc-header"
                variant="dark"
                expand="lg">
                <Container>
                    {/* Main site title */}
                    <Navbar.Brand 
                        className="navbar-brand-name"
                        to="/" as={Link}>
                        YLDY Rewards Estimator
                    </Navbar.Brand>
                    {/* Version */}
                    <Nav.Link 
                        as="h6"
                        className="p-0 align-bottom mt-1 mr-auto mb-0"
                        style={{ fontSize: "0.75rem" }}>
                        {
                            pkg ? "v" + pkg.version : "v0.0.0"
                        }
                    </Nav.Link>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="w-100">
                            
                            <a className="nav-link mx-1" href="/#no-loss-lottery">No Loss Lottery</a>
                            <a className="nav-link mx-1" href="/#yldy-staking">YLDY Staking</a>
                            <a className="nav-link mx-1" href="/totals">Application Totals</a>
                            
                            {/* Invis Margin separator */}
                            <div className="ml-auto"></div>

                            {
                                this.state.YLDYPrice &&
                                    <div className="d-flex my-auto mx-1 py-1">
                                        <img 
                                            className="my-auto mx-2"
                                            src={YLDY_ICON}
                                            alt="Yieldly icon"
                                            width="21"
                                            height="21"
                                            />
                                        <div>
                                            ${this.state.YLDYPrice}
                                        </div>
                                    </div>
                            }
                            <div className="d-flex">
                                <a 
                                    className="mx-1"
                                    href={CONFIG.twitter_link}>
                                    <Button variant="outline-primary">
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </Button>
                                </a>
                                <a 
                                    className="mx-1"
                                    href={CONFIG.github_link}>
                                    <Button variant="outline-primary">
                                        <FontAwesomeIcon icon={faGithub} />
                                    </Button>
                                </a>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

export default Header;