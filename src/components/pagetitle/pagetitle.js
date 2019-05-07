/* ---------------------------------------------------------------------
 === "PageTitle" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    PageTitle
 description:  h1 title
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './pagetitle.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import config from 'config';


// TODO organize project better
const ICON = "fas fa-tree";  // TODO theme ?


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
const COLOR = theme('mode', {
    default: props => props.theme.primary,
});


/* ---------------------------------------------------------------------
 — "PageTitle" —
 
 creates the main title of the page.

 The `PageTitle` should be unique and added to the header section.

 renders an "h1" element.
----------------------------------------------------------------------*/
class _PageTitle extends Component {
    render() {
        return (
            <h1 className={this.props.className}>
              {this.props.text} <i className={this.props.icon} />
            </h1>
        );
    }
}


_PageTitle.defaultProps = {
    text: config.pagetitle.title,
    icon: ICON,
};


const PageTitle = styled(_PageTitle)`
    color: ${COLOR};
    margin: 5px;
    margin-top: 7px;
    margin-bottom: 0px;
    margin-left: 0px;
    width: 100%;
    font-size: 170%;
`;

export default PageTitle;
