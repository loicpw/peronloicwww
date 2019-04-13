/* ---------------------------------------------------------------------
 === "SpringSequence" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    SpringSequence
 description:  uses react-motion to generate an array of interpolated values

 (see https://github.com/nashvail/ReactPathMenu/blob/staggered-motion/Components/APP.js)
----------------------------------------------------------------------*/
import './springsequence.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import {Motion, StaggeredMotion as _StaggeredMotion, spring} from "react-motion";


// TODO: this is a workaround for tests to inject StaggeredMotion mock
// https://github.com/theKashey/rewiremock/issues/76
export const dependencies = {
    StaggeredMotion: _StaggeredMotion,
};


/* ---------------------------------------------------------------------
 — "SpringSequence" —
 
 ..seealso:: https://github.com/nashvail/ReactPathMenu/blob/staggered-motion/Components/APP.js

 This is a parent component that passes an array of progress values to
 all its children.

 renders a div element containing the children.

 expected props:

 + currentState: `true` / `false`, open or close state (goal)
 + stiffness: see react-motion
 + damping: see react-motion
 + length: number of progress values

 example ::

    const animationProps = {
        stiffness:  210;
        damping:    20;
        length:     6;
    };

    const MyComp = (props) => {
        const progress = props.progress;
        const firstItemPercent = progress[0];
        const secondItemPercent = progress[1];

        // render according to progress values...
        [...]
    };

    const MyWrappingComp = (props) => {
        return (
            <SpringSequence {...animationProps} currentState={this.state} >
              <MyComp id={1} />
              <MyComp id={2} />
            </SpringSequence>
        );
    }

----------------------------------------------------------------------*/
class SpringSequence extends Component {
    //
    // https://github.com/nashvail/ReactPathMenu/blob/staggered-motion/Components/APP.js:
    //
    //This function returns target styles for each child button in current animation frame
    //according to actual styles in previous animation frame.
    //Each button could have one of two target styles
    // - defined in initialChildButtonStyles (for collapsed buttons)
    // - defined in finalChildButtonStyles (for expanded buttons)
    // To decide which target style should be applied function uses css 'scale' property
    // for previous button in previous animation frame.
    // When 'scale' for previous button passes some 'border' which is a simple combination one of
    // two 'scale' values and some OFFSET the target style for next button should be changed.
    //
    // For example let's set the OFFSET for 0.3 - it this case border's value for closed buttons will be 0.8.
    //
    // All buttons are closed
    //                INITIAL-BUTTON-SCALE-(0.5)-----------BORDER-(0.8)------FINAL-BUTTON-SCALE-(1)
    //                |------------------------------------------|--------------------------------|
    // BUTTON NO 1    o------------------------------------------|---------------------------------
    // BUTTON NO 2    o------------------------------------------|---------------------------------
    //
    // When user clicks on menu button no 1 changes its target style according to finalChildButtonStyles method
    // and starts growing up. In this frame this button doesn't pass the border so target style for button no 2
    // stays as it was in previous animation frame
    // BUTTON NO 1    -----------------------------------o-------|---------------------------------
    // BUTTON NO 2    o------------------------------------------|---------------------------------
    //
    //
    //
    // (...few frames later)
    // In previous frame button no 1 passes the border so target style for button no 2 could be changed.
    // BUTTON NO 1    -------------------------------------------|-o-------------------------------
    // BUTTON NO 2    -----o-------------------------------------|---------------------------------
    //
    //
    // All buttons are expanded - in this case border value is 0.7 (OFFSET = 0.3)
    //                INITIAL-BUTTON-SCALE-(0.5)---BORDER-(0.7)--------------FINAL-BUTTON-SCALE-(1)
    //                |------------------------------|--------------------------------------------|
    // BUTTON NO 1    -------------------------------|--------------------------------------------O
    // BUTTON NO 2    -------------------------------|--------------------------------------------O
    //
    // When user clicks on menu button no 1 changes its target style according to initialChildButtonStyles method
    // and starts shrinking down. In this frame this button doesn't pass the border so target style for button no 2
    // stays as it was defined in finalChildButtonStyles method
    // BUTTON NO 1    -------------------------------|------------------------------------O--------
    // BUTTON NO 2    -------------------------------|--------------------------------------------O
    //
    //
    //
    // (...few frames later)
    // In previous frame button no 1 passes the border so target style for button no 2 could be changed
    // and this button starts to animate to its default state.
    // BUTTON NO 1    -----------------------------o-|---------------------------------------------
    // BUTTON NO 2    -------------------------------|------------------------------------O--------
    render() {
        const isOpen = this.props.currentState;
        const goalPercent = isOpen ? 1.0 : 0.0;
        const springParams = [
            this.props.stiffness,
            this.props.damping
        ];
    
        const defaultStyles = [];
        Array(this.props.length).fill(0).forEach((_, index) => {
            defaultStyles.push({ percent: 0.0 });
        });
    
        const nextStyles = (prevStyles) => {
            return prevStyles.map((prev, i) => {
                if (i === 0) {
                    return { percent: spring(goalPercent, springParams) };
                } else {
                    const lastItemPrevPercent = prevStyles[i - 1].percent;
                    const thisItemPrevPercent = prevStyles[i].percent;
                    const shouldThisAnimate = isOpen ?
                        lastItemPrevPercent > 0.2 :
                        lastItemPrevPercent < 0.8;
                    const percent = shouldThisAnimate ?
                        spring(goalPercent, springParams) :
                        thisItemPrevPercent;
                    return { percent: percent };
                }
            });
        };
    
        // TODO tests workaround, see above
        let { StaggeredMotion } = dependencies;
        return (
              <StaggeredMotion defaultStyles={defaultStyles} styles={nextStyles}>
               {(interpolatedStyles) => {
                  // prepare array of progress values
                  const progress = [];
                  for (let {percent} of interpolatedStyles)
                    progress.push(percent);

                  // prepare children
                  const children = React.Children.map(this.props.children,
                    child => React.cloneElement(child, {progress: progress})
                  );

                  // render children
                  return (
                    <div className={this.props.className}>
                      { children }
                    </div>
                  );
                }}
              </StaggeredMotion>
        );
    }
}


export default SpringSequence;
