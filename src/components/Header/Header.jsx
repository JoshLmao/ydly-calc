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

import "./Header.css";

let pkg = require('../../../package.json');

class Header extends Component {
    render() {
        return (
            <Navbar className="calc-header">
                <Container>
                    <Navbar.Brand 
                        className="navbar-brand-name"
                        to="/" as={Link}>
                        YDLY Rewards Calculator
                    </Navbar.Brand>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link to="/" as={Link}>Home</Nav.Link>
                            <Nav.Link to="/#nll" as={Link}>No Loss Lottery</Nav.Link>
                            <Nav.Link to="/#ydly-staking" as={Link}>YDLY Staking</Nav.Link>
                        </Nav>
                        <a 
                            className="ml-auto"
                            href="https://github.com/JoshLmao/foresight">
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