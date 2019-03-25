/* ---------------------------------------------------------------------
 === "Header" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    Header
 description:  app header container
--------------------------------------------------------------------- */
import React, { Component } from 'react';
import './header.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';


// TODO - themed background
const backgroundColor = theme('mode', {
    default: props => props.theme.grey,
    light: props => props.theme.pink,
});


/* ---------------------------------------------------------------------
 — "Header" —
 
 creates a wrapping header element to hold children components on top.

 `Header` has a fixed position on top of the viewport. It renders a fix
 banner that occupied the whole width and whose height depends on its
 children.

 It displays in flex / column mode.

 renders a "header" element.

 example ::

    <Header>
        <header>
            <h1>my title</h1>
            <p>this will stick on the top</p>
        </header>
        <nav>...</nav>
    </Header>
--------------------------------------------------------------------- */
class _Header extends Component {
    render() {
        return (
            <header className={this.props.className}>
              {this.props.children}
            </header>
        );
    }
}


// TODO
const Header = styled(_Header)`
    position: fixed;
    top: 0px;
    left: 0px;
    margin: 0px;
    padding: 10px;
    width: 100vw;
    height: auto;
    background-color: ${backgroundColor};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export default Header;
