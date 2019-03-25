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


/* ---------------------------------------------------------------------
 — "PageTitle" —
 
 creates the main title of the page.

 The `PageTitle` should be unique and added to the header section.

 renders an "h1" element.

 expected props:

 + text: text to display (default = "no title")
----------------------------------------------------------------------*/
class _PageTitle extends Component {
    render() {
        return (
            <h1 className={this.props.className}>
              {this.props.text}
            </h1>
        );
    }
}


_PageTitle.defaultProps = {
    text: 'no title',
};

// TODO
const PageTitle = styled(_PageTitle)`
    margin: 5px;
    margin-top: 10px;
    margin-left: 0px;
    /*text-align: center;*/
    width: 100%;
`;

export default PageTitle;
