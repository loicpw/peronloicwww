import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from '../homepage';
import { createStore } from '@spyna/react-store';
const sinon = require('sinon');
import MediaQuery from 'react-responsive';
import { render, fireEvent, cleanup, getByTestId, getByText } from 'react-testing-library';
import { BrowserRouter as Router } from 'react-router-dom';
const createMockRaf = require('mock-raf');
import rewiremock from 'rewiremock';
import {spring} from "react-motion";
import HttpMock from 'xhr-mock';
// TODO see link below:
import { dependencies } from '../../springsequence';
// TODO organize project better
import {createApp, flushPromises} from '../../tests/utils'


describe('homepage component', () => {
    let StaggeredMotion;
    //let SpringSequence; TODO see link below 
    let mockRaf;
    const staticURL = '/loicpw.com/static';
    const imagesURL = new RegExp(staticURL + '/images/.*');
    const dataURL = new RegExp(staticURL + '/data/.*');
    const textURL = new RegExp(staticURL + '/text/[^z].*');
    const zenListURL = new RegExp(staticURL + '/text/zen.txt');
    const mockData = `"Items": [
        {
          "resourceID": {
            "S": "test"
          },
          "link": {
            "S": "https://www.example.com/test"
          },
          "resourceType": {
            "S": "homePageLink"
          }
        }
    ]`;

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
            values: { width: 800, height: 800 },
        };

        // mock HTTP requests
        HttpMock.setup();
        HttpMock.get(
            imagesURL, {
                headers: { 'Content-Type': 'application/json' },
                body: "{}",
            }
        );
        HttpMock.get(
            dataURL, {
                headers: { 'Content-Type': 'application/json' },
                body: `{${mockData}}`,
            }
        );
        HttpMock.get(
            zenListURL, {
                headers: { 'Content-Type': 'text/plain' },
                body: '[ "THIS IS A TEST #0" ]',
            }
        );
        HttpMock.get(
            textURL, {
                headers: { 'Content-Type': 'text/plain' },
                body: "THIS IS A TEST",
            }
        );
    })

    afterEach(() => {
        MediaQuery.defaultProps = {};
        HttpMock.teardown();
        cleanup();
    });

    it('renders without crashing', async () => {
        const App = createApp({});
        const {getByTestId, container} = render(<App><HomePage /></App>);
        await flushPromises();

        // check the 'ZenOfTheDay' text has been taken from the list
        // (only one element for the test)
        const zenOfTheDayText = getByTestId('ZenOfTheDayText');
        getByText(zenOfTheDayText, /THIS IS A TEST #0/);
    });

    it('should run the animation when click on main button', async () => {
        const App = createApp({});
        const {getByTestId, container} = render(<App><HomePage /></App>);
        await flushPromises();
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');
        const presentationText = getByTestId('PresentationText');
        const zenOfTheDayText = getByTestId('ZenOfTheDayText');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);
        let presentationTextStyle = str(presentationText.style);
        let zenOfTheDayTextStyle = str(zenOfTheDayText.style);

        // everything should be closed at this point
        mockRaf.step({ count: 10 });
        //console.log(str(link1.style));
        //console.log(str(main.style));
        expect(str(link1.style)).toEqual(link1Style);
        expect(str(main.style)).toEqual(mainStyle);
        expect(str(presentationText.style)).toEqual(presentationTextStyle);
        expect(str(zenOfTheDayText.style)).toEqual(zenOfTheDayTextStyle);

        let zTextTop = parseFloat(zenOfTheDayText.style.top);
        link1Style = str(link1.style);
        mainStyle = str(main.style);

        // trigger the animation
        fireEvent.click(main);
        mockRaf.step({ count: 10 });
        expect(str(link1.style)).not.toEqual(link1Style);
        expect(str(main.style)).not.toEqual(mainStyle);
        // presentationText slides up
        expect(parseFloat(presentationText.style.top)).toBeLessThan(0);
        // zenOfTheDayText slides down
        expect(parseFloat(zenOfTheDayText.style.top)).toBeGreaterThan(zTextTop);

        // check the text components disappeared at the end of the animation
        mockRaf.step({ count: 50 });
        expect(presentationText.style.top).toEqual('-50%');
        expect(zenOfTheDayText.style.top).toEqual('100%');
    });

    it('should rollback the animation when click on main button again', async () => {
        const App = createApp({});
        const {getByTestId, container} = render(<App><HomePage /></App>);
        await flushPromises();
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');
        const presentationText = getByTestId('PresentationText');
        const zenOfTheDayText = getByTestId('ZenOfTheDayText');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);
        let presentationTextStyle = str(presentationText.style);
        let zenOfTheDayTextStyle = str(zenOfTheDayText.style);
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
        expect(str(presentationText.style)).toEqual(presentationTextStyle);
        expect(str(zenOfTheDayText.style)).toEqual(zenOfTheDayTextStyle);
    });

    it('should rollback the animation when click on main button while animation is running', async () => {
        const App = createApp({});
        const {getByTestId, container} = render(<App><HomePage /></App>);
        await flushPromises();
        const main = getByTestId('main-button');
        const link1 = getByTestId('link1');
        const presentationText = getByTestId('PresentationText');
        const zenOfTheDayText = getByTestId('ZenOfTheDayText');

        const str = JSON.stringify;
        let link1Style = str(link1.style);
        let mainStyle = str(main.style);
        let presentationTextStyle = str(presentationText.style);
        let zenOfTheDayTextStyle = str(zenOfTheDayText.style);
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
        expect(str(presentationText.style)).toEqual(presentationTextStyle);
        expect(str(zenOfTheDayText.style)).toEqual(zenOfTheDayTextStyle);
    });
});
