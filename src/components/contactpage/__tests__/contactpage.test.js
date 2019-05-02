import React from 'react';
import ReactDOM from 'react-dom';
import ContactPage from 'components/contactpage';
import { createStore } from '@spyna/react-store';
import { render, fireEvent, cleanup, getByTestId, getByText } from 'react-testing-library';
import {createApp, flushPromises} from 'tests/utils'


describe('contactpage component', () => {
    beforeEach(() => {
    })

    afterEach(() => {
        cleanup();
    });

    it('should display the contact form', async () => {
        const App = createApp({});
        const {getByLabelText, getByText, container} = render(<App><ContactPage /></App>);
        // TODO ?
        getByLabelText(/name/i);
        getByLabelText(/email/i);
        getByText(/submit/i);
    });
});
