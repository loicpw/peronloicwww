/* ---------------------------------------------------------------------
 === "NavBar" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    NavBar
 description:  basic main navbar
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './navbar.css';
import PropTypes from 'prop-types';
import styled, {keyframes} from 'styled-components';
import theme from 'styled-theming';
import {Link} from 'react-router-dom'; 


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
const FONT_COLOR = theme('mode', {
    default: props => props.theme.primary,
});
const BACKGROUND_COLOR = theme('mode', {
    default: props => props.theme.secondary,
});


/* ---------------------------------------------------------------------
 - GitHubLink -

 Hard coded link to github repos
 TODO organize project better
--------------------------------------------------------------------- */
const _GitHubLink = (props) => (
    <a className={props.className} href={"https://github.com/loicpw/peronloicwww"} target={'_blank'}>
      <i className={'fab fa-github'} /> edit on github
    </a>
);

const GitHubLink = styled(_GitHubLink)`
    margin: 0px;
    padding: 0px;
    text-align: right;
    text-decoration: none;
    color: ${FONT_COLOR};
    font-size: 80%;
    font-style: italic;
`;


/* ---------------------------------------------------------------------
 — "NavBarItem" —

 create a `react-router-dom.Link` component to link to the given path

 renders a `react-router-dom.Link` element.

 expected props:

 + name: name to display
 + link: the "to" property to forward to `react-router-dom.Link`

 example ::

    <NavBarItem name={"home"} link={"/home"} />
----------------------------------------------------------------------*/
class _NavBarItem extends Component {
    render() {
        return (
            <Link className={this.props.className} to={this.props.link}>
              {this.props.name}
            </Link> 
        );
    }
}


const NavBarItem = styled(_NavBarItem)`
    text-align: left;
    margin: 0px;
    padding: 5px;
    padding-bottom: 0px;
    padding-top: 0px;
    text-decoration: none;
    color: ${BACKGROUND_COLOR};
    font-style: italic;
    font-size: 100%;
    display: flex;

    :hover {
        background-color: ${BACKGROUND_COLOR};
        color: ${FONT_COLOR};
    } 
`;


/* ---------------------------------------------------------------------
 — "NavBarItemsList" —

 styled ul (unordered list) adapted to the navbar
----------------------------------------------------------------------*/
const NavBarItemsList = styled.ul`
    margin: 0px;
    padding: 0px;
    list-style: none;
    flex-direction: column;
    border-radius: 5%;
`;


/* ---------------------------------------------------------------------
 — "NavBar" —

 creates a navbar that displays `NavBarItem` components (text links)

 the navbar should be added to the header, it displays the provided
 links from left to right in a single row.

 renders a "nav" element.

 expected props:

 + links: an array of objects, where each object is as follows ::
    
    {
        name: <name to display>,
        link: <link to the page>
    }

 example ::

    const pages = [
        {name: "home", link: "/home"},
        {name: "features", link: "/features"}
    ];
    <NavBar links={pages} />
----------------------------------------------------------------------*/
class _NavBar extends Component {
    render() {
        // create list
        let links = this.props.links.map(
            (item) => <li key={item.name}><NavBarItem {...item} /></li>
        );
        // return a nav
        return (
            <nav className={this.props.className}>
              <div className={"dropdown"} >
                <i className={"fas fa-bars"} />
                <NavBarItemsList className={"dropdown-content"} style={{gridColumn: 1}} >
                  {links}
                </NavBarItemsList>
              </div>
              <GitHubLink style={{gridColumn: 2}} />
            </nav>
        );
    }
}


const NavBar = styled(_NavBar)`
    background-color: #00000000;
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;

    .dropdown {
        position: relative;
        display: inline-block;
        padding-right: 10px;
    }
    
    .dropdown-content {
        display: none;
        position: absolute;
        z-index: 1;
        background-color: ${FONT_COLOR};
    }

    .dropdown:hover .dropdown-content {
        display: flex;
    }
`;

export default NavBar;
