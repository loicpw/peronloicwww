/* ---------------------------------------------------------------------
 === "HomePage" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    HomePage
 description:  animated home page
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './homepage.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import SpringSequence from '../springsequence';
import SpingLinks from '../springlinks';
import { withStore } from '@spyna/react-store';
import {Link} from 'react-router-dom'; 


// TODO
// hardcoded links
const URLS = {
    linkedin: "https://linkedin.com/in/loicpw",
    github: "https://github.com/loicpw",
    resume: "https://s3.amazonaws.com/loicpw-share-public/resume.pdf",
    blog: "/blog",
    projects: "/projects",
    contact: "/contact",
};

// home page state
export const STATE_ACTIVE = 'homepage.isActive';
export const INITIAL_STATE = {}
INITIAL_STATE[STATE_ACTIVE] = false;

// links to display on home page
const LINKS = [
    {
        type: 'a',
        text: "resume",
        href: URLS['resume'],
        target: ':blank',
        icon: "far fa-file-alt",
        "data-testid": 'link1',
    },
    {
        type: 'a',
        text: "contact",
        onClick: () => alert(`TODO: ${URLS["contact"]}`),
        target: ':blank',
        icon: "fa fa-at",
    },
    {
        type: 'a',
        text: "profile",
        href: URLS['linkedin'],
        target: ':blank',
        icon: "fab fa-linkedin",
    },
    {
        type: 'a',
        text: "github",
        href: URLS['github'],
        target: ':blank',
        icon: "fab fa-github",
    },
    {
        type: Link,
        text: "blog",
        to: URLS['blog'],
        icon: "far fa-newspaper",
    },
    {
        type: Link,
        text: "projects",
        to: URLS['projects'],
        icon: "fas fa-cubes",
    },
];

// parameters for the animation
const ANIMATION = {
    stiffness:  210,
    damping:    20,
    length:     LINKS.length,
};



/* ---------------------------------------------------------------------
 — "HomePage" —
 
 the home page's components are wrapped into an `SpringSequence`
 component in order to manage an "open / close" animation and
 synchronize different components in the page. The animation abstraction
 consists of an array of progress values (0 to 1), increasing or
 decreasing one after another, using react-motion.

 .. seealso:: `SpringSequence` forwards the "progress" property to all
    its children components.

 TODO: text
 TODO: background

 renders the wrapping `SpringSequence` component (renders a div).

 Layout ::
    
    + ---------------------------------- +
    |        TEXT TODO  component        |
    + ---------------------------------- +
    |                                    |
    |       SpringLinks component        |
    |                                    |
    + ---------------------------------- +

 .. seealso:: `SpringLinks` component
----------------------------------------------------------------------*/
class _HomePage extends Component {
    //
    constructor(props) {
        super(props);
        this.toggleAnimation = this.toggleAnimation.bind(this);
    }

    //
    render() {
        // prepare props for SpringSequence
        const props = {
            ...ANIMATION,
            currentState: this.props.store.get(STATE_ACTIVE) || false,
            className: this.props.className
        };

        // render components wrapped into SpringSequence
        return (
            <SpringSequence {...props} >
              <p style={{margin: "0px", color: "black"}}>
                THIS IS HOME PAGE
              </p>
              <SpingLinks toggleState={this.toggleAnimation} links={LINKS} />
            </SpringSequence>
        );
    }

    // open / close animation toggling the value of STATE_ACTIVE
    toggleAnimation() {
        const { store } = this.props;
        const isOpen = store.get(STATE_ACTIVE);
        store.set(STATE_ACTIVE, !isOpen);
    }
}


const HomePage = styled(_HomePage)`
    background-color: white;                                                    
    margin: 0px;                                                                
    padding: 0px;                                                               
    display: flex;                                                              
    flex-direction: column;                                                     
    align-items: center;                                                        
    justify-content: center;                                                    
    height: 100%;                                                               
    width: 100%;
`;

export default withStore(HomePage);
