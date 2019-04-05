import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from '../homepage';
import { INITIAL_STATE } from '../homepage';
import { createStore } from '@spyna/react-store';
const sinon = require('sinon');
import MediaQuery from 'react-responsive';
import { render, fireEvent, cleanup, getByTestId } from 'react-testing-library';
import { BrowserRouter as Router } from 'react-router-dom';
const createMockRaf = require('mock-raf');
import rewiremock from 'rewiremock';
import {spring} from "react-motion";
// TODO see link below:
import { dependencies } from '../../springsequence';


describe('homepage component', () => {
    let StaggeredMotion;
    //let SpringSequence; TODO see link below 
    let mockRaf;

    beforeEach(() => {
        mockRaf = createMockRaf();
        mockRaf.raf.cancel = mockRaf.cancel;
        sinon.stub(window, 'requestAnimationFrame').callsFake(mockRaf.raf);
        // inject dependencies for StaggeredMotion
        // see: https://github.com/chenglou/react-motion/blob/master/test/StaggeredMotion-test.js
        StaggeredMotion = rewiremock.proxy('react-motion/lib/StaggeredMotion', {
            raf: mockRaf.raf,
            'performance-now': mockRaf.now,
        });
        // inject dependencies for SpringSequence
        // TODO : not working see link below
        // https://github.com/theKashey/rewiremock/issues/76
        //SpringSequence = rewiremock.proxy('../../springsequence', {
        //    'react-motion': {
        //        StaggeredMotion: StaggeredMotion,
        //    },
        //}).default;
        dependencies.StaggeredMotion = StaggeredMotion;

        // enforce viewport size otherwise MediaQuery won't render
        MediaQuery.defaultProps = {
            values: { width: 800 },
        };
    })

    afterEach(() => {
        MediaQuery.defaultProps = {};
        cleanup();
    });

    it('renders without crashing', () => {
        const _App = () => {
            return (
                <Router>
                    <HomePage />
                </Router>
            );
        }
        const App = createStore(_App, INITIAL_STATE);
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('should run the animation when click on main button', () => {
        const _App = (props) => {
            return (
                <Router>
                    <HomePage />
                </Router>
            );
        }
        const App = createStore(_App, INITIAL_STATE);
        const {getByTestId, container} = render(<App />);
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);

        // everything should be closed at this point
        mockRaf.step({ count: 10 });
        //console.log(str(link1.style));
        //console.log(str(main.style));
        expect(str(link1.style)).toEqual(link1Style);
        expect(str(main.style)).toEqual(mainStyle);
        link1Style = str(link1.style);
        mainStyle = str(main.style);

        // trigger the animation
        fireEvent.click(main);
        mockRaf.step({ count: 10 });
        expect(str(link1.style)).not.toEqual(link1Style);
        expect(str(main.style)).not.toEqual(mainStyle);
    });

    it('should rollback the animation when click on main button again', () => {
        const _App = (props) => {
            return (
                <Router>
                    <HomePage />
                </Router>
            );
        }
        const App = createStore(_App, INITIAL_STATE);
        const {getByTestId, container} = render(<App />);
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);
        //console.log(str(link1.style));
        //console.log(str(main.style));

        // trigger the animation
        fireEvent.click(main);
        mockRaf.step({ count: 50 });
        // rollback the animation
        fireEvent.click(main);
        mockRaf.step({ count: 50 });
        expect(str(link1.style)).toEqual(link1Style);
        expect(str(main.style)).toEqual(mainStyle);
    });

    it('should rollback the animation when click on main button while animation is running', () => {
        const _App = (props) => {
            return (
                <Router>
                    <HomePage />
                </Router>
            );
        }
        const App = createStore(_App, INITIAL_STATE);
        const {getByTestId, container} = render(<App />);
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);
        //console.log(str(link1.style));
        //console.log(str(main.style));

        // trigger the animation
        fireEvent.click(main);
        mockRaf.step({ count: 10 });
        // rollback the animation
        fireEvent.click(main);
        mockRaf.step({ count: 50 });
        expect(str(link1.style)).toEqual(link1Style);
        expect(str(main.style)).toEqual(mainStyle);
    });
});
