import React, { Component } from 'react';
import { 
    Nav,
    Navbar,
    Container,
    Button,
}from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import CONFIG from "../../config.json";

import "./Header.css";

let pkg = require('../../../package.json');

class Header extends Component {
    render() {
        return (
            <Navbar 
                id="estimator-navbar"
                className="calc-header">
                <Container>
                    {/* Main site title */}
                    <Navbar.Brand 
                        className="navbar-brand-name"
                        to="/" as={Link}>
                        YDLY Rewards Estimator
                    </Navbar.Brand>
                    {/* Version */}
                    <Nav.Link 
                        as="h6"
                        className="p-0 align-bottom mt-1 mr-2 mb-0"
                        style={{ fontSize: "0.75rem" }}>
                        {
                            pkg ? "v" + pkg.version : "v0.0.0"
                        }
                    </Nav.Link>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <a className="nav-link" href="#no-loss-lottery">No Loss Lottery</a>
                            <a className="nav-link" href="#ydly-staking">YDLY Staking</a>
                            {/* <Nav.Link to="#no-loss-lottery">No Loss Lottery</Nav.Link>
                            <Nav.Link to="#ydly-staking" as={Link}>YDLY Staking</Nav.Link> */}
                        </Nav>
                        <a 
                            className="ml-auto"
                            href={CONFIG.github_link}>
                            <Button variant="outline-secondary">
                                <FontAwesomeIcon icon={faGithub} />
                            </Button>
                        </a>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

export default Header;