import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@spyna/react-store';
import { render, fireEvent, cleanup } from 'react-testing-library';
import HttpMock from 'xhr-mock';
import {createApp, flushPromises} from 'tests/utils';
import ContactForm from 'components/contactform';
import config from 'config';
const EMAIL_API = config.email;


describe('contactform component', () => {
    beforeEach(() => {
        // mock HTTP requests
        HttpMock.setup();
    })

    afterEach(() => {
        HttpMock.teardown();
        // clean components
        cleanup();
    });

    // fill the form with given values for name, email and message text
    const fillForm = (utils, { name, email, message }) => {
        fireEvent.change(
            utils.getByLabelText(/name/i),
            { target: { value: name } }
        );
        fireEvent.change(
            utils.getByLabelText(/email/i),
            { target: { value: email } }
        );
        fireEvent.change(
            utils.getByPlaceholderText('Enter your message here'),
            { target: { value: message } }
        );
    };

    // submit form with given values for name, email and message text
    // use the provided function to mock the request:
    // ex: function(req, res) => { return res.status(...) }
    // return the "jest.fn()" to check the request has been made
    const submitForm = (utils, data, mockRequest) => {
        const url = new RegExp(EMAIL_API.post_message_url);
        const call = jest.fn();

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        HttpMock.post(url, (req, res) => {
            call();
            return mockRequest(req, res);
        });

        fillForm(utils, data);
        fireEvent.submit(utils.getByText(/submit/i));
        return call;
    };

    // check the form is enabled / disabled
    const checkFormEnabled = (utils, enabled) => {
        expect(utils.getByLabelText(/name/i).disabled).not.toBe(enabled);
        expect(utils.getByLabelText(/email/i).disabled).not.toBe(enabled);
        expect(utils.getByPlaceholderText('Enter your message here').disabled).not.toBe(enabled);
        expect(utils.getByText(/submit/i).disabled).not.toBe(enabled);
        expect(utils.getByText(/cancel/i).disabled).not.toBe(enabled);
    };

    it('should send the email when submit valid form', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };
        const apiData = {
            service_id: EMAIL_API.service_id,
            template_id: EMAIL_API.template_id,
            user_id: EMAIL_API.user_id,
            template_params: EMAIL_API.template(userData),
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        const mockRequest = (req, res) => {
            expect(req.header('Content-Type')).toEqual('application/json');
            expect(req.body()).toEqual(JSON.stringify(apiData));
            return res.status(200);
        };

        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        const call = submitForm(utils, userData, mockRequest);
        await flushPromises();
        expect(call).toHaveBeenCalled();
    });

    it('should clear the form when cancel', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };
        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        fillForm(utils, userData);

        await flushPromises();
        expect(utils.getByLabelText(/name/i).value).toEqual('john');
        expect(utils.getByLabelText(/email/i).value).toEqual('john@john.doe');
        expect(utils.getByPlaceholderText('Enter your message here').value).toEqual('abcd');

        fireEvent.click(utils.getByText(/cancel/i));
        await flushPromises();
        expect(utils.getByLabelText(/name/i).value).toEqual('');
        expect(utils.getByLabelText(/email/i).value).toEqual('');
        expect(utils.getByPlaceholderText('Enter your message here').value).toEqual('');
    });

    it('shouldnt be able to modify or submit the form while sending', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        const mockRequest = (req, res) => {
            return new Promise(() => {});  // wait forever
        };

        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        submitForm(utils, userData, mockRequest);
        await flushPromises();

        // check everything is disabled
        checkFormEnabled(utils, false);
    });

    it('should not show "waiting" message initially', async () => {
        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        expect(() => {
            utils.getByText(/sending message/i);
        }).toThrow();
    });

    it('should show "waiting" message while sending', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        const mockRequest = (req, res) => {
            return new Promise(() => {});  // wait forever
        };

        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        submitForm(utils, userData, mockRequest);
        await flushPromises();

        utils.getByText(/sending message/i);
    });

    it('should replace the form by "success" message if success', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        const mockRequest = (req, res) => {
            return res.status(200);
        };

        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        const call = submitForm(utils, userData, mockRequest);
        await flushPromises();
        expect(call).toHaveBeenCalled();

        // check the form disappeared
        expect(() => {
            utils.getByLabelText(/name|email/i);
        }).toThrow();
        expect(() => {
            utils.getByText(/submit|cancel/i);
        }).toThrow();

        // check find success message instead
        utils.getByText(/success/i);
    });

    it('should show "error" message and let the user retry if failure', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        const mockRequest = (req, res) => {
            return res.status(500).reason('internal error');
        };

        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        const call = submitForm(utils, userData, mockRequest);
        await flushPromises();
        expect(call).toHaveBeenCalled();

        // check values are still there
        expect(utils.getByLabelText(/name/i).value).toEqual('john');
        expect(utils.getByLabelText(/email/i).value).toEqual('john@john.doe');
        expect(utils.getByPlaceholderText('Enter your message here').value).toEqual('abcd');

        // check find error message containing the reason
        utils.getByText(/internal error/);

        // check the user can retry the form
        checkFormEnabled(utils, true);
    });

    it('should remove "error" message when re-submitting form', async () => {
        const userData = {
            name: 'john',
            email: 'john@john.doe',
            message: 'abcd',
        };

        // see also: https://github.com/jameslnewell/xhr-mock/tree/master/packages/xhr-mock#mockrequest
        let _mockRequest = (req, res) => {
            return res.status(500).reason('internal error');
        };
        const mockRequest = (req, res) => _mockRequest(req, res);
        const App = createApp({});
        const utils = render(<App><ContactForm /></App>);
        const call = submitForm(utils, userData, mockRequest);
        await flushPromises();
        expect(call).toHaveBeenCalled();

        // change the mock request to be able to check the waiting state
        _mockRequest = (req, res) => {
            return new Promise(() => {});  // wait forever
        };
        // re-submit the form
        fireEvent.submit(utils.getByText(/submit/i));
        await flushPromises();

        // check the waiting message is there
        utils.getByText(/sending message/i);
        // check the error message disappeared
        expect(() => {
            utils.getByText(/internal error/);
        }).toThrow();
    });
});
