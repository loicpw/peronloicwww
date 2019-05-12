import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { createStore, withStore } from '@spyna/react-store';
import styled, { ThemeProvider } from 'styled-components';
import theme from 'themes/default';
import { AppContent } from 'App';
import config from 'config';


// resize the window and dispatch 'resize'
export const resizeWindow = (w, h) => {
  window.innerWidth = w;
  window.innerHeight = h;
  window.dispatchEvent(new Event('resize'));
}


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


// TODO organize project better
// TODO theme.large
// create App with:
// + Router
// + store (@spyna/react-store)
// + theme (styled-components)
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
        viewport: config.media.default,
        ...initialState,
    });
}
