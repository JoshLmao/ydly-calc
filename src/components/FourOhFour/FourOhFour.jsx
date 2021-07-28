import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

class FourOhFour extends Component {
    render() {
        let comedyGeniusSentences = [
            "You tried to hardfork from the main site and failed. Please don't try it again",
            "Test 404 message, please ignore",
            "Just like the week 4 rewards, this page has gone missing."
        ];

        let funnySentence = comedyGeniusSentences[Math.floor(Math.random() * comedyGeniusSentences.length)];

        return (
            <div className="py-5 bg-dark all-text-white" style={{
                minHeight: "100%"
            }}>
                <Container className="py-5">
                    <h1 className="yieldly-main-color">
                        404 - Page not found
                    </h1>
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