import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore, withStore } from '@spyna/react-store';
import styled, { ThemeProvider } from 'styled-components';


// mock alert
export const MockAlert = {
  install: () => {
    MockAlert.message = undefined;
    MockAlert.originalAlert = window.alert;

    window.alert = (message) => {
      MockAlert.message = message;
    };
  },

  uninstall: () => {
    MockAlert.originalAlert = window.alert;
  }
};


// trigger Http requests callbacks (usefull for xhr-mock)
export const flushPromises = () => {
    return new Promise(resolve => setImmediate(resolve));
};


// create App with:
// + Router
// + store (@spyna/react-store)
// + theme (styled-components)
const theme = {
    mode: 'default',
    primary: '#154360',
    secondary: '#fbfcfc',
};

const _AppContent = (props) => {
    return (
        <ThemeProvider theme={theme}>
          <div className={props.className}>
            {props.children}
          </div>
        </ThemeProvider>
    );
}

const AppContent = styled(_AppContent)`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const App = (props) => {
    return (
        <Router>
          <AppContent>
            {props.children}
          </AppContent>
        </Router>
    );
}

export const createApp = (initialState) => {
    return createStore(App, {
        theme: 'default',
        ...initialState,
    });
}
