import React, { Component } from "react";
import { Button, Container } from "react-bootstrap";

import CONFIG from "../../config.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import ALGO_ICON from "../../svg/algo-icon.svg";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

const copyToClipboard = () => {
    let text = CONFIG.algo_donations_address;
    navigator.clipboard.writeText(text).then(
    function () {
        console.log("Async: Copying to clipboard was successful!", text);
    },
    function (err) {
        console.error("Async: Could not copy text: ", err);
    }
    );
};

class Footer extends Component {
    render() {
        return (
            <div>
                <Container fluid className="text-center my-5">
                    <p>
                        <img
                            className="mr-2"
                            alt="Algorand Icon"
                            src={ALGO_ICON}
                            height="25"
                            width="25"
                        />
                        ALGO donations
                    </p>
                    <p className="small d-inline" style={{ wordWrap: "break-word" }}>
                        { CONFIG.algo_donations_address }
                    </p>
                    <Button variant="white" onClick={() => copyToClipboard()}>
                        <FontAwesomeIcon icon={faCopy} />
                    </Button>
                </Container>

                <div className="py-5 text-center my-auto text-white bg-dark">
                    <Container className="d-flex justify-content-center my-5">
                        <a
                            className="mr-1"
                            href={CONFIG.github_link + "/issues"}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline-light">Report an Issue</Button>
                        </a>
                        <a
                            className="mx-1"
                            href={CONFIG.github_link}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline-light">
                                <FontAwesomeIcon icon={faGithub} />
                            </Button>
                        </a>
                        <a
                            className="mx-1"
                            href={CONFIG.twitter_link}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant="outline-light">
                                <FontAwesomeIcon icon={faTwitter} />
                            </Button>
                        </a>
                    </Container>
                    <p>
                        Created by
                        <a
                            className="text-white font-weight-bold"
                            href={ CONFIG.creator_link }
                            target="_blank"
                            rel="noreferrer"
                        >
                            {" "}
                            JoshLmao
                        </a>
                        {" "}
                        |
                        Designed by
                        <a 
                            className="text-white font-weight-bold"
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/janvandenenden"
                            >
                            {" "}
                            janvandenenden
                        </a>
                    </p>

                    <p className="small mt-3">
                        *This website is not affiliated with Yieldly.
                    </p>
                </div>
            </div>
        );
    }
}

export default Footer;
