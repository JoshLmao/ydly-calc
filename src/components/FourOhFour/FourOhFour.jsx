import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import "../Home/Home.css";

class FourOhFour extends Component {
    render() {
        let comedyGeniusSentences = [
            "You tried to hardfork from the main site and failed. Please don't try it again",
            "This is a standard 404 message. Please return home.",
        ];

        let funnySentence = comedyGeniusSentences[Math.floor(Math.random() * comedyGeniusSentences.length)];

        return (
            <div className="py-5 secondary-background all-text-white" style={{
                minHeight: "100%"
            }}>
                <Container className="py-5">
                    <h1 className="yieldly-main-color">你迷路了吗</h1>
                    <p>{ funnySentence }</p>
                    <Link to="/">
                        <Button className="d-flex">
                            <FontAwesomeIcon 
                                className="my-auto"
                                icon={faHome} />
                            <div className="ml-2">
                                Return home
                            </div>
                        </Button>
                    </Link>
                </Container>
            </div>
        );
    }
}

export default FourOhFour;