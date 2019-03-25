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


// TODO
const NavBarItem = styled(_NavBarItem)`
    text-align: left;
    margin: 10px;
    text-decoration: none;
`;


/* ---------------------------------------------------------------------
 — "NavBarItemsList" —

 styled ul (unordered list) adapted to the navbar

TODO
----------------------------------------------------------------------*/
const NavBarItemsList = styled.ul`
    display: flex;
    flex-direction: row;
    color: palevioletred;
    margin: 0px;
    padding: 0px;
    list-style: none;
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
              <NavBarItemsList>
                {links}
              </NavBarItemsList>
            </nav>
        );
    }
}


// TODO
const NavBar = styled(_NavBar)`
    background-color: hsl(100, 50%, 90%); 
`;

export default NavBar;
