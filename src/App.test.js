import React from 'react';
import ReactDOM from 'react-dom';
import App, { DetectViewport } from './App';
import { resizeWindow } from 'tests/utils';
import { createStore, withStore } from '@spyna/react-store';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


// TODO separate file
describe('DetectViewport HOC', () => {

    // return { Main, state }, where:
    // - Main is the root component to render in the window, it contains
    //   the store ( see createStore / @spyna/react-store ).
    // - state is an object containing the 'viewport' value to check,
    //   the value is set when components are rendered, using the
    //   'viewport' value found in the main store.
    // (viewport is undefined by default, both in the store and in state)
    const createContent = () => {
        const state = {
            viewport: undefined
        };

        const _Content = (props) => {
            const store = props.store;
            state.viewport = store.get('viewport');
            return null;
        };

        const Content = DetectViewport(withStore(_Content));
        const Main = createStore(Content, {viewport: 'default'});

        return { Main, state };
    };

    it('should init viewport state to "large" when open large window', () => {
        const { Main, state } = createContent();

        resizeWindow(1000, 1000);  // > 'large'
        const div = document.createElement('div');
        ReactDOM.render(<Main />, div);
        expect(state.viewport).toEqual('large');
        ReactDOM.unmountComponentAtNode(div);
    });

    it('should init viewport state to "small" when open small window', () => {
        const { Main, state } = createContent();

        resizeWindow(400, 400);  // < 'small'
        const div = document.createElement('div');
        ReactDOM.render(<Main />, div);
        expect(state.viewport).toEqual('small');
        ReactDOM.unmountComponentAtNode(div);
    });

    it('should update the viewport state when window size changes', () => {
        const { Main, state } = createContent();

        resizeWindow(1000, 1000);  // > 'large'
        const div = document.createElement('div');
        ReactDOM.render(<Main />, div);

        resizeWindow(600, 600);  // > 'large'
        expect(state.viewport).toEqual('large');

        resizeWindow(300, 300);  // < 'small'
        expect(state.viewport).toEqual('small');

        resizeWindow(400, 400);  // < 'small'
        expect(state.viewport).toEqual('small');

        resizeWindow(550, 550);  // > 'large'
        expect(state.viewport).toEqual('large');

        ReactDOM.unmountComponentAtNode(div);
    });
});
