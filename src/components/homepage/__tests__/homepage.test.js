import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from 'components/homepage';
import { createStore } from '@spyna/react-store';
const sinon = require('sinon');
import { render, fireEvent, cleanup, getByTestId, getByText } from 'react-testing-library';
import { BrowserRouter as Router } from 'react-router-dom';
const createMockRaf = require('mock-raf');
import rewiremock from 'rewiremock';
import {spring} from "react-motion";
import {createApp} from 'tests/utils'
import config from 'config';
// TODO see link below:
import { dependencies } from 'components/springsequence';
import { Resources } from 'resources';


describe('homepage component', () => {
    let StaggeredMotion;
    //let SpringSequence; TODO see link below 
    let mockRaf;

    // mock resources
    const resources = {
        homepage: new Resources({
            backgroundLayer1: 'https://www.example.com/test/image.png',
            presentationText: 'presentation text',
            zenOfTheDayText: '[ "zen of the day text" ]',
            resume: "https://www.example.com/test",
            linkedin: "https://www.example.com/test",
            github: "https://www.example.com/test",
            blog: "https://www.example.com/test",
            projects: "https://www.example.com/test",
            contact: "https://www.example.com/test",
        }),
    };

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
    })

    afterEach(() => {
        cleanup();
    });

    it('should display the "zen of the day" text', () => {
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><HomePage /></App>);

        // check the 'ZenOfTheDay' text has been taken from the list
        // (only one element for the test)
        const zenOfTheDayText = getByTestId('ZenOfTheDayText');
        getByText(zenOfTheDayText, /zen of the day text/);
    });

    it('should display the presentation text', () => {
        const App = createApp({ resources });
        const {getByText, container} = render(<App><HomePage /></App>);

        getByText('presentation text');  // mock value (see above)
    });

    it('links should go to "https://www.example.com/test"', () => {
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><HomePage /></App>);

        const link1 = getByTestId('link1');
        expect(link1.href).toEqual("https://www.example.com/test");
    });

    it('should run the animation when click on main button', async () => {
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><HomePage /></App>);
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
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><HomePage /></App>);
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
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><HomePage /></App>);
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
