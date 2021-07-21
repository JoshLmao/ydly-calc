import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Button } from "react-bootstrap";

class ScrollToTopButton extends Component {
    constructor(props) {
        super(props);

        this.onScrollToTop = this.onScrollToTop.bind(this);
    }

    onScrollToTop() {
        window.scrollTo(0, 0);
    }

    render() {
        let offset = "0.25rem";
        return (
            <Button 
                variant="primary"
                className="position-fixed"
                style={{
                    right: offset,
                    bottom: offset,
                    zIndex: "100",
                }}
                onClick={ this.onScrollToTop }
                >
                <FontAwesomeIcon
                    icon={faChevronUp}
                    />
            </Button>
        );
    }
}

export default ScrollToTopButton;