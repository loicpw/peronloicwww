import React from 'react';
import ReactDOM from 'react-dom';
import Header from 'components/header';
import { Resources } from 'resources';
import {createApp} from 'tests/utils'
import { render, fireEvent, cleanup } from 'react-testing-library';


describe('Header component', () => {
    // mock resources
    const resources = {
        header: new Resources({
            img: 'https://example.com/test/image.png',
        }),
    };

    beforeEach(() => {
    })

    afterEach(() => {
        cleanup();
    });

    it('XXXXXXXX renders without crashing', () => {
        const App = createApp({ resources });
        const {getByTestId, container} = render(<App><Header /></App>);

        // TODO
        //const zenOfTheDayText = getByTestId('ZenOfTheDayText');
        //getByText(zenOfTheDayText, /zen of the day text/);
    });

});
