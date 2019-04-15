import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SpringLinks from '../springlinks';
import { createStore } from '@spyna/react-store';
import { render, fireEvent, cleanup } from 'react-testing-library'
import MediaQuery from 'react-responsive';
const sinon = require('sinon');
// TODO organize project better
import {createApp, flushPromises} from '../../tests/utils'


const CONSTANTS = {
    'small': {
        CHILD_START_POS: 207,
        CHILD_END_POS: {
            link1: 15,
            link2: 399,
        },
    },
    'large': {
        CHILD_START_POS: 360,
        CHILD_END_POS: {
            link1: 25,
            link2: 695,
        },
    },
};

// parse html value to int,
// ex: '216px' ==> 216
// ex: '216.99999999997px' ==> 217
// ex: '216.00000000001px' ==> 216  
// ex: '216.49999999999px' ==> 217  (reason for "toFixed")
const toInt = (v) => Math.round(parseFloat(v.slice(0, v.length - 2)).toFixed(1));


describe('SpringLinks component', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    })

    afterEach(() => {
        clock.restore();
        MediaQuery.defaultProps = {};
        cleanup();
    });

    const links = [
        {
            type: 'a',
            text: 'link 1',
            icon: 'fas fa-link',
            href: 'l1.www.example.com',
            target: ":blank",
            role: "link1",
        },
        {
            type: 'a',
            text: 'link 2',
            icon: 'fas fa-link',
            href: 'l2.www.example.com',
            target: ":blank",
            role: "link2",
        },
    ];

    class MockAnimation extends Component {
        constructor(props) {
            super(props);
            this.state = { isOpen: false, index: 0, idle: true };
            this.toggleAnimation = this.toggleAnimation.bind(this);
            this.nextState = this.nextState.bind(this);
            this.animation = [
                [ 0, 0 ],
                [ 0.2, 0 ],
                [ 0.4, 0.2 ],
                //[ 0.6, 0.4 ],
                [ 0.8, 0.6 ],
                [ 1, 0.8 ],
                [ 1, 1 ]
            ];
        }

        toggleAnimation() {
            const {isOpen, progress, idle} = this.state;
            this.setState({
                ...this.state,
                isOpen: !isOpen,
                idle: false
            });
            // dont trigger if switching during animation (already done)
            if (idle)
                setTimeout(() => this.nextState(), 100);
        }

        nextState() {
            const index = this.state.isOpen ?
                this.state.index + 1:
                this.state.index - 1;
            if (index >= 0 && index < this.animation.length) {
                // NOTE: trigger render
                this.setState({
                    ...this.state,
                    index: index,
                    idle: index == 0 || index == this.animation.length -1
                });
                setTimeout(() => this.nextState(), 100);
            }
        } 

        render() {
            const props = {
                toggleState: this.toggleAnimation,
                links: links,
                progress: this.animation[this.state.index],
            };
            return <SpringLinks {...props} />;
        }
    }
    
    // create functions to test each step in the animation sequence
    // main: main button
    // children: array containing the children buttons
    // direction: 1 if opening, -1 if closing
    const createAnimationStepsChecks = (media, main, children, direction=1) => {
        const CHILD_START_POS = CONSTANTS[media].CHILD_START_POS;
        const CHILD_END_POS = CONSTANTS[media].CHILD_END_POS;
        const [link1, link2] = children;
        let link1Left;
        let link2Left;

        // create position checker
        const checkLink1Left = () => expect(
            link1Left ?  // assumes correct if undefined (didnt check previous states...)
                direction * (toInt(link1.style.left) - toInt(link1Left)):
                -1
        ).toBeLessThan(0);
        const checkLink2Left = () => expect(
            link2Left ?  // assumes correct if undefined (didnt check previous states...)
                direction * (toInt(link2.style.left) - toInt(link2Left)):
                1
        ).toBeGreaterThan(0);

        // animation start state 
        // -------------------------------------------------------------
        //
        //                  (main)
        //
        // -------------------------------------------------------------
        const checkStep0 = () => {
            [main, ...children].forEach(elm => {
                //console.log('style:', elm.style);
                expect(elm.style.transform).toEqual('rotate(0deg)');
            });
            children.forEach(elm => {
                expect(toInt(elm.style.left)).toEqual(CHILD_START_POS);
                expect(toInt(elm.style.top)).toEqual(CHILD_START_POS);
            });
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }; 

        // animation should be running - step #1
        // -------------------------------------------------------------
        //
        //        link1 <-- (main)
        //
        // -------------------------------------------------------------
        const checkStep1 = () => {
            /*[main, ...children].forEach(elm => {
                console.log('style:', elm.style);
            });*/
            [main, link1].forEach(elm => {
                expect(elm.style.transform).toEqual('rotate(72deg)');
            });
            children.forEach(elm => expect(toInt(elm.style.top)).toEqual(CHILD_START_POS));
            // check link1
            checkLink1Left();
            // check link2
            expect(link2.style.transform).toEqual('rotate(0deg)');
            expect(toInt(link2.style.left)).toEqual(CHILD_START_POS);
            // remember state
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }

        // animation should be running - step #2
        // -------------------------------------------------------------
        //
        //      link1 <---- (main) --> link2
        //
        // -------------------------------------------------------------
        const checkStep2 = () => {
            //[main, ...children].forEach(elm => console.log('style:', elm.style));
            [main, link1].forEach(elm => {
                expect(elm.style.transform).toEqual('rotate(144deg)');
            });
            children.forEach(elm => expect(toInt(elm.style.top)).toEqual(CHILD_START_POS));
            // check link1
            checkLink1Left();
            // check link2
            expect(link2.style.transform).toEqual('rotate(72deg)');
            checkLink2Left();
            // remember state
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }

        // animation should be running - step #3
        // -------------------------------------------------------------
        //
        //   link1 <------- (main) -----> link2
        //
        // -------------------------------------------------------------
        const checkStep3 = () => {
            //[main, ...children].forEach(elm => console.log('style:', elm.style));
            [main, link1].forEach(elm => {
                expect(elm.style.transform).toEqual('rotate(288deg)');
            });
            children.forEach(elm => expect(toInt(elm.style.top)).toEqual(CHILD_START_POS));
            // check link1
            checkLink1Left();
            // check link2
            expect(link2.style.transform).toEqual('rotate(216deg)');
            checkLink2Left();
            // remember state
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }

        // animation should be running - step #4
        // -------------------------------------------------------------
        //
        // link1 <--------- (main) -------> link2
        //
        // -------------------------------------------------------------
        const checkStep4 = () => {
            //[main, ...children].forEach(elm => console.log('style:', elm.style));
            [main, link1].forEach(elm => {
                expect(elm.style.transform).toEqual('rotate(360deg)');
            });
            children.forEach(elm => expect(toInt(elm.style.top)).toEqual(CHILD_START_POS));
            // check link1
            expect(toInt(link1.style.left)).toEqual(CHILD_END_POS.link1);
            // check link2
            expect(link2.style.transform).toEqual('rotate(288deg)');
            checkLink2Left();
            // remember state
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }

        // animation should be at end position
        // -------------------------------------------------------------
        //
        // link1 <---------- (main) ----------> link2
        //
        // -------------------------------------------------------------
        const checkStep5 = () => {
            //[main, ...children].forEach(elm => console.log('style:', elm.style));
            [main, ...children].forEach(elm => {
                expect(elm.style.transform).toEqual('rotate(360deg)');
            });
            children.forEach(elm => expect(toInt(elm.style.top)).toEqual(CHILD_START_POS));
            expect(toInt(link1.style.left)).toEqual(CHILD_END_POS.link1);
            expect(toInt(link2.style.left)).toEqual(CHILD_END_POS.link2);
            // remember state
            link1Left = link1.style.left;
            link2Left = link2.style.left;
        }

        return {
            step0: checkStep0,
            step1: checkStep1,
            step2: checkStep2,
            step3: checkStep3,
            step4: checkStep4,
            step5: checkStep5,
        };
    };

    // test animation opening (progress 0% to 100%)
    const openAnimationCase = (media) => {
        const App = createApp({});
        const {getByTestId, getByRole, container} = render(
            <App><MockAnimation />)</App>
        );
        const main = getByTestId('main-button');
        const link1 = getByRole('link1');
        const link2 = getByRole('link2');
        const children = [link1, link2];
        const tests = createAnimationStepsChecks(media, main, children);

        // everything should be closed at this point
        clock.tick(500);
        tests.step0();
        // trigger the animation
        fireEvent.click(main);
        // 1
        clock.tick(150);
        tests.step1();
        // 2
        clock.tick(100);
        tests.step2();
        // 3
        clock.tick(100);
        tests.step3();
        // 4
        clock.tick(100);
        tests.step4();
        // 5
        clock.tick(1000);
        tests.step5();
    };

    it('should run the animation when the main button is clicked #large', () => {
        // enforce viewport size otherwise MediaQuery won't render
        MediaQuery.defaultProps = {
            values: { width: 800, height: 800 },
        };

        openAnimationCase('large');
    });

    it('should run the animation when the main button is clicked #small', () => {
        // enforce viewport size otherwise MediaQuery won't render
        MediaQuery.defaultProps = {
            values: { width: 479, height: 479 },
        };

        openAnimationCase('small');
    });

    it('should rollback the animation when the main button is clicked when opened', () => {
        // enforce viewport size otherwise MediaQuery won't render
        MediaQuery.defaultProps = {
            values: { width: 800, height: 800 },
        };
        const App = createApp({});
        const {getByTestId, getByRole, container} = render(
            <App><MockAnimation />)</App>
        );
        const main = getByTestId('main-button');
        const link1 = getByRole('link1');
        const link2 = getByRole('link2');
        const children = [link1, link2];
        const tests = createAnimationStepsChecks('large', main, children, -1);

        // trigger the animation
        fireEvent.click(main);
        // wait complete open
        clock.tick(50000);
        // everything should be opened at this point
        tests.step5();
        // trigger the animation again (rollback)
        fireEvent.click(main);
        // 4 
        clock.tick(150);
        tests.step4();
        // 3 
        clock.tick(100);
        tests.step3();
        // 2
        clock.tick(100);
        tests.step2();
        // 1
        clock.tick(100);
        tests.step1();
        // 0
        clock.tick(1000);
        tests.step0();
    });

    it('should rollback the animation when the main button is clicked while opening', () => {
        // enforce viewport size otherwise MediaQuery won't render
        MediaQuery.defaultProps = {
            values: { width: 800, height: 800 },
        };
        const App = createApp({});
        const {getByTestId, getByRole, container} = render(
            <App><MockAnimation />)</App>
        );
        const main = getByTestId('main-button');
        const link1 = getByRole('link1');
        const link2 = getByRole('link2');
        const children = [link1, link2];
        const testsOpen = createAnimationStepsChecks('large', main, children);
        const tests = createAnimationStepsChecks('large', main, children, -1);

        // trigger the animation
        fireEvent.click(main);
        // should go to step 3
        // 1
        clock.tick(150);
        // 2
        clock.tick(100);
        // 3
        clock.tick(100);
        testsOpen.step3();
        
        // trigger the animation again (rollback)
        fireEvent.click(main);
        tests.step3();
        // 2
        clock.tick(100);
        tests.step2();
        // 1
        clock.tick(100);
        tests.step1();
        // 0
        clock.tick(1000);
        tests.step0();
    });
});
