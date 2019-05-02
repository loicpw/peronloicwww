/* ---------------------------------------------------------------------
 === "ContactPage" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    ContactPage
 description:  basic contact page to send a message
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './contactpage.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import ContactForm from 'components/contactform';


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
// TODO
const PAGE_BACKGROUND = theme('mode', {
    default: props => props.theme.primary,
});
const FORM_BACKGROUND = theme('mode', {
    default: props => props.theme.secondary,
});
const FORM_COLOR = theme('mode', {
    default: props => props.theme.primary,
});


/* ---------------------------------------------------------------------
 — "ContactPage" —
 
 allows to send a message by displaying a `ContactForm` component
----------------------------------------------------------------------*/
class _ContactPage extends Component {
    render() {
        return (
            <div className={this.props.className}>
                <div>
                    <h2>Send me a message</h2>
                    <ContactForm />
                </div>
            </div>
        );
    }
}


const ContactPage = styled(_ContactPage)`
    background-color: ${PAGE_BACKGROUND};
    margin: 0px;
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    color: ${FORM_COLOR};

    div {
        background-color: ${FORM_BACKGROUND};
        height: calc(100% - 20px);
        margin: 10px;
        width: auto;
        min-width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h2 {
        padding: 10px;
        margin: 0px;
        text-align: center;
        width: 100%;
        font-size: 20px;
    }
`;

export default ContactPage;
