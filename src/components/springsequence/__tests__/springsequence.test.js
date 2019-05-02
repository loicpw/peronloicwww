import React, { Component } from 'react';
import ReactDOM from 'react-dom';
const sinon = require('sinon');
const createMockRaf = require('mock-raf');
import rewiremock from 'rewiremock';
import {spring} from "react-motion";
// TODO see link below:
import SpringSequence, { dependencies } from 'components/springsequence';

// turns not int values into 'X'
const simplifyValues = steps => {
    return steps.map(
        step => String(step.map(v => (v <= 0 || v >= 1) ? v : 'X'))
    ).filter(
        // only unique values
        (value, index, self) => (self.indexOf(value) === index)
    );
};


describe('test SpringSequence', () => {
    let StaggeredMotion;
    //let SpringSequence; TODO see link below
    let mockRaf;
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
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
        //SpringSequence = rewiremock.proxy('../springsequence', {
        //    'react-motion': {
        //        StaggeredMotion: StaggeredMotion,
        //    },
        //}).default;
        dependencies.StaggeredMotion = StaggeredMotion;
    });

    afterEach(() => {
        clock.restore();
        //global.requestAnimationFrame.restore();
    });

    it('animation should progress from 0 to 1 increasing sequentially when triggered', () => {
        const animationProps = {
            stiffness:  210,
            damping:    20,
            length:     3,
        };
        let count = [];

        const MyComp = (props) => {
            const progress = props.progress;
            count.push([...progress]);
            // console.log(progress);
            return null;
        };

        class App extends Component {
            // trigger animation state after 1000 ms
            constructor(props) {
                super(props);
                this.state = { anim: false };
                setTimeout(() => {
                    this.setState({ anim: true });
                }, 1000);
            }

            render() {
                return (
                    <SpringSequence {...animationProps} currentState={this.state.anim} >
                      <MyComp />
                    </SpringSequence>
                );
            }
        }

        const div = document.createElement('div');
        ReactDOM.render(<App />, div);

        //console.log("check animation initial progress");
        expect(count).toEqual([
            [0, 0, 0],
        ]);

        //console.log("animation not started");
        clock.tick(800);
        mockRaf.step({ count: 10 });
        expect(count).toEqual([
            [0, 0, 0],
        ]);

        //console.log("animation started");
        clock.tick(300);

        mockRaf.step({ count: 1 });
        expect(simplifyValues(count)).toEqual([
            "0,0,0",
            "X,0,0",
        ]);

        mockRaf.step({ count: 4 });
        expect(simplifyValues(count)).toEqual([
            "0,0,0",
            "X,0,0",
            "X,X,0",
        ]);

        mockRaf.step({ count: 6 });
        expect(simplifyValues(count)).toEqual([
            "0,0,0",
            "X,0,0",
            "X,X,0",
            "X,X,X",
        ]);
        expect(count[count.length - 1][0]).toBeGreaterThanOrEqual(0.6);
        expect(count[count.length - 1][1]).toBeGreaterThanOrEqual(0.4);
        expect(count[count.length - 1][2]).toBeGreaterThanOrEqual(0.2);

        mockRaf.step({ count: 4 });
        expect(count[count.length - 1][0]).toBeGreaterThanOrEqual(0.8);
        expect(count[count.length - 1][1]).toBeGreaterThanOrEqual(0.7);
        expect(count[count.length - 1][2]).toBeGreaterThanOrEqual(0.6);

        //console.log("animation ended");
        mockRaf.step({ count: 45 });
        expect(simplifyValues(count)).toEqual([
            "0,0,0",
            "X,0,0",
            "X,X,0",
            "X,X,X",
            "1,X,X",
            "1,1,X",
            "1,1,1",
        ]);

        ReactDOM.unmountComponentAtNode(div);
    });
});
