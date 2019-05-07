/* ---------------------------------------------------------------------
 === "ContactForm" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    ContactForm
 description:  basic contact form to send an email
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './contactform.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import { withStore } from '@spyna/react-store';
import config from 'config';
const API = config.email;


// using emailjs service
// see also: https://www.emailjs.com/docs/rest-api/send/
// params: {name, email, message}
// params: callback: callback(request) function when request is complete 
const postEmail = (data, callback) => {
    const url = API.post_message_scheme + ':' + API.post_message_url;
    const http = new XMLHttpRequest();
    http.open("POST", url);
    http.setRequestHeader("Content-Type", "application/json");

    // create expected payload
    const messageData = {
        service_id: API.service_id,
        template_id: API.template_id,
        user_id: API.user_id,
        template_params: API.template(data),
    };

    // inform user if message failed to send
    http.onreadystatechange = () => {
        // 4: request finished and response is ready
        if (http.readyState == 4)
            callback(http);
    };

    http.send(JSON.stringify(messageData));
}


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
const ERROR_COLOR = theme('mode', {
    default: props => props.theme.error,
});
const SUCCESS_COLOR = theme('mode', {
    default: props => props.theme.success,
});


/* TODO : refactor: split into different components:

    +-------- container --------+
    | +-----------------------+ |
    | |      status message   | |
    | +-----------------------+ |
    | |         form          | |
    | +-----------------------+ |
    +---------------------------+
*/
/* ---------------------------------------------------------------------
 — "ContactForm" —
 
 ( TODO: refactoring )
 Displays a form or a div element.

 + initial state or after cancel ::
    
    +-----------------------+
    |      empty form       |
    +-----------------------+

 + submit form: sending request ::

    +-----------------------+
    |     sending message   |
    +-----------------------+
    |     submitted form    |
    |      (disabled)       |
    +-----------------------+

 + successfully sent ::

    +-----------------------+
    |     success message   |
    +-----------------------+

 + failure ::

    +-----------------------+
    |     error message     |
    +-----------------------+
    |     submitted form    |
    |       (enabled)       |
    +-----------------------+
 
 The form contains some input fields and a text area where the user can
 enter the message, as well as submit / cancel buttons.

 All inputs are required and allow to get:

 + name: the name of the sender. This is a text input.
 + email: the email address of the sender. This is an email input.
 + message: the text message
----------------------------------------------------------------------*/
class _ContactForm extends Component {
    STATUS = {
        enabled: 0,
        sending: 1,
        success: 2,
    };

    defaultState = {
        senderName: '',
        senderEmail: '',
        message: '',
        status: 0,
    };

    // bind event handlers
    constructor(props) {
        super(props);
        this.handleSenderNameChange = this.handleSenderNameChange.bind(this);
        this.handleSenderEmailChange = this.handleSenderEmailChange.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // make sure we dont keep data in the state
    componentWillUnmount() {
        this.clearState();
    }

    // reset data
    // params: data: override state with attributes contains in data
    clearState(data) {
        this.props.store.set('contactpage', {...this.defaultState, ...data});
    }

    // update provided data in the state
    updateState(data) {
        const store = this.props.store;
        const state = store.get('contactpage', this.defaultState);
        store.set('contactpage', {
            ...state,
            ...data,
        });
    }

    // send the email
    handleSubmit(event) {
        event.preventDefault();  // ( do not reload page )

        // update state upon complete to inform user if fail or success
        const callback = (req) => {
            // successfully sent
            if (req.status == 200) {
                //this.clearState();  XXX
                // update state to show a success message
                this.updateState({ status: this.STATUS.success });

            // failed to send the message
            } else {
                // build error message
                const errorMsg = (
                    `Error (${req.status}: ${req.statusText})\n` +
                    "sorry message not sent, please try again"
                );
                // update state to re-enable the form and show the error
                this.updateState({
                    status: this.STATUS.enabled,
                    error: errorMsg,
                });
            }
        };

        // update status to prevent submit again while requesting
        this.updateState({ status: this.STATUS.sending });

        // post request
        const store = this.props.store;
        const state = store.get('contactpage', this.defaultState);
        postEmail({
            name: state.senderName,
            email: state.senderEmail,
            message: state.message,
        }, callback);
    }

    // on update message text
    handleMessageChange(event) {
        this.updateState({ message: event.target.value });
    }

    // on update name field
    handleSenderNameChange(event) {
        this.updateState({ senderName: event.target.value });
    }

    // on update email field change
    handleSenderEmailChange(event) {
        this.updateState({ senderEmail: event.target.value });
    }

    // cancel button
    handleClear(event) {
        event.preventDefault();
        this.clearState();
    }

    // render elements depending on the status
    render() {
        const state = this.props.store.get('contactpage', this.defaultState);

        // only show success message if message sent
        if (state.status == this.STATUS.success) {
            return (
                <div className={this.props.className}>
                  <label className="success_label">
                    Thank you, your message has been successfully sent.
                  </label>
                </div>
            );
        // otherwise show the form with optional status message
        // (initial state, sending message or failed to send message)
        } else {
            const sending = (state.status == this.STATUS.sending);
            const disabled = sending;
            return (
                <form className={this.props.className}
                  onSubmit={this.handleSubmit}>

                  {/*optional status message area*/}
                  <div className="form_status">
                    {/*waiting message*/}
                    {sending && <label className="sending_label">
                     sending message...</label>}
                    {/*error message*/}
                    {(state.error && !sending) &&
                     <label className="error_label">
                     {state.error}</label>}
                  </div>

                  {/*input fields*/}
                  <div className="input_fields">
                    <label htmlFor="sender-name" id="sender-name-label">
                      * name:
                    </label>
                    <input id="sender-name" type="text"
                      placeholder="enter your name"
                      value={state.senderName}
                      onChange={this.handleSenderNameChange}
                      disabled={disabled}
                      required
                    />
                    <label htmlFor="sender-email" id="sender-email-label">
                      * email:
                    </label>
                    <input id="sender-email" type="email"
                      placeholder="enter your email address"
                      value={state.senderEmail}
                      onChange={this.handleSenderEmailChange}
                      disabled={disabled}
                      required
                    />
                  </div>

                  {/*message text area*/}
                  <textarea
                    placeholder={"Enter your message here"}
                    value={state.message}
                    onChange={this.handleMessageChange}
                    disabled={disabled}
                    required
                  />

                  {/*form buttons*/}
                  <div className="btn-group">
                    <button className="btn btn-cancel"
                      onClick={this.handleClear} disabled={disabled}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-submit"
                      disabled={disabled}>
                      Submit
                    </button>
                  </div>
                </form>
            );
        }        
    }
}


const ContactForm = styled(_ContactForm)`
    margin: 5px;
    padding-left: 5vw;
    padding-right: 5vw;
    height: 100%;
    width: 70vw;
    max-width: 500px;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: auto auto 1fr auto;
    grid-gap: 10px;

    @media (max-width: ${config.media.small}px) {
        margin: 0px;
        width: 90vw;
        grid-gap: 4px;
    }

    .success_label {
        grid-row: 1 / 4;
        color: ${SUCCESS_COLOR}; 
    }

    .form_status {
        grid-row: 1;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center; 
        margin: 0px;
        padding: 0px;
    }

    .form_status .sending_label {
    }

    .form_status .error_label {
        color: ${ERROR_COLOR}; 
        font-weight: bold;
    }

    .input_fields {
        grid-row: 2;
        height: auto;
        display: grid;
        grid-gap: 3px;
        grid-template-columns: auto 1fr;
        align-items: center;
        justify-content: center; 
    }

    .input_fields label {
        font-size: 80%;
        padding-right: 7px;
        min-width: 50px;
    }

    textarea {
        grid-row: 3;
        height: auto; 
        width: auto;
    }

    .btn-group {
        grid-row: 4;
        display: flex;
        flex-direction: row;
        width: auto;
        height: auto;
        grid-gap: 10px;
    }
`;

export default withStore(ContactForm);
