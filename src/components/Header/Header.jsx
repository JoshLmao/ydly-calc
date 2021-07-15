import React, { Component } from "react";
import { Nav, Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import YLDY_ICON from "../../svg/yldy-icon.svg";

import "./Header.css";
import { getYLDYPrice } from "../../js/AlgoExplorerAPI";

let pkg = require("../../../package.json");

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            YLDYPrice: 0,
        };
    }

    componentDidMount() {
        getYLDYPrice((price) => {
            this.setState({
                YLDYPrice: price,
            });
        });
    }

    render() {
        return (
            <Navbar
                id="estimator-navbar"
                className="calc-header bg-dark fixed-top"
                variant="dark"
                expand="lg">
                <Container fluid>
                    {/* Main site title */}
                    <Navbar.Brand className="navbar-brand-name small" to="/" as={Link}>
                        YLDY Rewards Estimator
                    </Navbar.Brand>
                    <small className="text-muted">
                        {pkg ? "v" + pkg.version : "v0.0.0"}
                    </small>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="w-100">   
                            <a className="nav-link ml-lg-2" href="/#no-loss-lottery">
                                <Button variant="primary" className="text-white font-weight-bold">No Loss Lottery</Button>
                            </a>
                            <a className="nav-link ml-lg-2" href="/#yldy-staking">
                                <Button variant="info" className="text-white font-weight-bold">YLDY Staking</Button>
                            </a>
                            <a className="nav-link ml-lg-2" href="/yldy-stats">
                                <Button variant="outline-light" className="font-weight-bold">Yieldly Statistics</Button>
                            </a>
                            
                            {/* Invis Margin separator */}
                            <div className="ml-auto"></div>

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
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

export default Header;
