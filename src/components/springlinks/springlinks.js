/* ---------------------------------------------------------------------
 === "SpringLinks" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    SpringLinks
 description:  a set of links that expand from / collapse to a main button
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './springlinks.css';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import theme from 'styled-theming';
import { withStore } from '@spyna/react-store';
import ReactResizeDetector from 'react-resize-detector';
import config from 'config';


/* ---------------------------------------------------------------------
 — constants —
----------------------------------------------------------------------*/
// TODO organize project better
//export const MAIN_CLOSED_ICON = 'fa fa-moon'
export const MAIN_CLOSED_ICON = 'fas fa-cog'
//export const MAIN_CLOSED_ICON = 'fas fa-power-off'
export const MAIN_OPENED_ICON = 'fa fa-sun'

// TODO organize project better
// media queries
export const CONSTANTS = {
    'large': {
        main_button_diam: 110,
        child_button_diam: 80,
        margin: 25,
    },
    'small': {
        main_button_diam: 90,
        child_button_diam: 65,
        margin: 15,
    }
}

const DEG_TO_RAD = Math.PI / 180;
const toRadians = (deg) => deg * DEG_TO_RAD;


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
const BEG_COLOR = theme('mode', {
    default: props => props.theme.primary,
});
const END_COLOR = theme('mode', {
    default: props => props.theme.secondary,
});


/* ---------------------------------------------------------------------
 — lerpColor —
 
 lerp function between color c1 and c2, both given as hexadecimal values

 params:

 + c1: start color
 + c2: end color
 + gradient: value between 0 and 1 to compute the color
----------------------------------------------------------------------*/
const lerpColor = (c1, c2, gradient) => {
    const c1r = c1 >> 16,
          c1g = c1 >> 8 & 0xff,
          c1b = c1 & 0xff,

          c2r = c2 >> 16,
          c2g = c2 >> 8 & 0xff,
          c2b = c2 & 0xff,

          rr = c1r + gradient * (c2r - c1r),
          rg = c1g + gradient * (c2g - c1g),
          rb = c1b + gradient * (c2b - c1b);

    return (rr << 16) + (rg << 8) + (rb | 0);
};


/* ---------------------------------------------------------------------
 — mainButtonStyle —
 
 give the styles to apply to the main button for a given progression,
 and a given mode (depending on the viewport / i.e media).

 The background color is given as a parameter because it's shared
 between main and children buttons.

 params:

 + parameters: parameters to use, depending on the viewport
 + percent: progress value between 0 and 1
----------------------------------------------------------------------*/
const mainButtonStyle = (parameters, percent) => {
    //const deg = 180 * percent;
    const deg = 360 * percent;

    const main_button_diam = parameters.main_button_diam;

    return {
        width: main_button_diam,
        height: main_button_diam,
        top: (parameters.height / 2) - main_button_diam / 2,
        left: (parameters.width / 2) - main_button_diam / 2,
        transform: `rotate(${deg}deg)`,
    };
};


/* ---------------------------------------------------------------------
 — childButtonStyle —
 
 give the style to apply to a child button for a given progression,
 and a given mode (depending on the viewport / i.e media).

 The background color is given as a parameter because it's shared
 between main and children buttons.

 params:

 + parameters: parameters to use, depending on the viewport
 + index: index of the child
 + percent: progress value between 0 and 1
 + background: background color to use
----------------------------------------------------------------------*/
const childButtonStyle = (parameters, index, percent, background) => {
    const child_button_diam = parameters.child_button_diam;
    const w = parameters.width;
    const h = parameters.height;
    const radius = ((Math.min(w, h) / 2)
                    - (child_button_diam / 2)
                    - parameters.margin);
    const angle = parameters.base_angle + index * parameters.separation_angle;
    const dx = radius * Math.cos(toRadians(angle)) * percent;
    const dy = radius * Math.sin(toRadians(angle)) * percent;
    const dX = dx + child_button_diam / 2;
    const dY = dy + child_button_diam / 2;
    const deg = 360 * percent;

    return {
        width: child_button_diam,
        height: child_button_diam,
        top: (h / 2) - dY,
        left: (w / 2) - dX,
        transform: `rotate(${deg}deg)`,
        backgroundColor: background,
        opacity: 0.9,
    };
};


/* ---------------------------------------------------------------------
 — "ChildLink" —
 
 create a link to the given path

 renders the provided **link** component.

 expected props:

 + type: the component type to use (ex: 'a')
 + text: text to display 
 + icon: icon to display
 + ...: additional props are forwared to the link component
----------------------------------------------------------------------*/
const _ChildLink = (props) => {
    const {text, icon, type, ..._props} = props;
    const Type = type; 

    return (
        <Type {..._props} >
            <i className={icon} />
            <h2>{text}</h2>
        </Type>
    );
};


const ChildLink = styled(_ChildLink)`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px;

    text-decoration: none;
    color: #555555;
    flex-direction: column;
    cursor: pointer;

    margin: 0px;
    padding: 0px;

    h2 {
        margin: 0px;
        padding: 0px;
        font-size: 12px;
        font-weight: normal;
        text-align: center;
    }

    pointer-events: initial;  /* make sure catch mouse events */
`;


/* ---------------------------------------------------------------------
 — "MainButton" —
 
 renders a div element.

 expected props:

 + icon: icon to display
 + ...: additional props are forwared to the wrapping div
----------------------------------------------------------------------*/
const _MainButton = (props) => {
    const {icon, ...divprops} = props;

    return (
        <div data-testid="main-button" {...divprops}>
          <i className={icon} />
        </div>
    );
};

const MainButton = styled(_MainButton)`
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 100%;
    cursor: pointer;
    display: flex;
    justify-content : center;
    align-items: center;
    color: #ffffff;
    font-weight: lighter;
    font-size: 24px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    pointer-events: initial;  /* make sure catch mouse events */
    background-color: ${BEG_COLOR};
    font-size: 140%;
    border-style: solid;
    border-width: thin;
    border-color: ${END_COLOR};
`;


/* ---------------------------------------------------------------------
 — "SpringLinks" —
 
 `SpringLinks` expects to be provided with "progress" values, which is
 an array containing the animation progress value for each link. The
 values represent the percentage between start state and end state in
 the animation process. 

 `SpringLinks` then render a main central element, which will toggle the
 animation state, and child elements around it, one for each link.

 `SpringLinks` renders a main div element, which is responsive (small /
 large modes, small is used for smartphone-like viewport). Overall the
 main div adapts to the viewport when resized. 

 Child elements are initially hidden behind the main element, and when
 the animation run they are positionned evenly around the main element ::

    + --------------------------------------------- +
    |                                               |
    |                     child                     |
    |           child       |        child          |
    |              \        |        /              |
    |                \ + ------- + /                |
    |                  |  main   |                  |
    |        child ––– |         | ––– child        |
    |                  | element |                  |
    |                / + –------ + \                |
    |              /        |        \              |
    |           child       |        child          |
    |                     child                     |
    |                                               |
    + --------------------------------------------- +

 .. seealso:: `SpringSequence` component

 expected props:

 + toggleState: callback to toggle the animation state (open / close)
 + progress: array containing progress values, main is 0
 + links: an array containing links properties for each link ::

    {
        type: component / tag type to use
        text: the text to display
        icon: the icon to display
        ...props: additional props  
    }

 ex ::

    const toggleAnimation = () => this.setState({ isOpen: !this.state.isOpen });

    const links = [
        {
            type: 'a',
            text: 'link 1',
            icon: 'fas fa-link',
            href: 'l1.www.example.com',
            target: ":blank",
        },
        {
            type: 'a',
            text: 'link 2',
            icon: 'fas fa-link',
            href: 'l2.www.example.com',
            target: ":blank",
        },
    ]

    return (
        <SpringSequence currentState={this.state.isOpen} {...props} >
          <SpringLinks toggleState={toggleAnimation} links={links} />
        </SpringSequence>
    );

----------------------------------------------------------------------*/
class _SpringLinks extends Component {
    // compute all constants given the number of children when created
    // children are positionned evenly around the main element
    constructor(props) {
        super(props);
        // main button callback to toggle the animation state
        this.toggle = this.toggle.bind(this);

        // compute constants given the number of children
        const length = props.links.length;
        this.constants = {};

        for (let [mode, mapping] of Object.entries(CONSTANTS)) {
            const cst = {...mapping};
            this.constants[mode] = cst;
            cst['separation_angle'] = 360 / length;
            cst['fan_angle'] = (length - 1) * cst.separation_angle;
            cst['base_angle'] = (180 - cst.fan_angle) / 2;
        }
    }

    // build components to render for given progress values and mode
    // + mode is the mapping to use in CONSTANTS, i.e viewport type
    // + width and height are the size of the main div that is rendered
    content(mode, width, height) {
        const progress = this.props.progress;
        const mainPercent = progress[0];

        const begColor = parseInt(BEG_COLOR(this.props).replace('#',''), 16);
        const endColor = parseInt(END_COLOR(this.props).replace('#',''), 16);
        let bg = lerpColor(begColor, endColor, mainPercent);
        bg = '#' + bg.toString(16);  // html hexa notation

        const params = {
            ...this.constants[mode],
            width,
            height,
        };
        const mainStyle = mainButtonStyle(params, mainPercent);
        const mainIcon = mainPercent > 0.5 ? MAIN_OPENED_ICON : MAIN_CLOSED_ICON;

        // return a main div containing main and children components
        return (
            <div className={this.props.className}>
              {this.props.links.map((props, idx) => {
                const childProps = {
                    style: childButtonStyle(params, idx, progress[idx], bg),
                    key: idx,
                    ...props
                };
                return <ChildLink {...childProps} />;
              })}
              <MainButton icon={mainIcon} style={mainStyle} onClick={this.toggle} />
            </div>
        );
    }

    // returns a wrapping div containing main and children buttons
    // rendering their content according to width and heigth, and the
    // viewport type (small / large).
    render() {
        // TODO : use refreshRate in ReactResizeDetector ?
        return (
            <ReactResizeDetector handleWidth handleHeight>
              {({ width, height }) => {

                // 'small', 'large'...
                const store = this.props.store;
                const viewport = store.get('viewport');

                // test environment ?
                // TODO : https://github.com/maslianok/react-resize-detector/issues/67
                if (typeof width == "undefined" ) {
                    width = config.media[viewport];
                    height = width;
                }

                return (
                    <div className={this.props.className} ref={this._div} >
                      {this.content(viewport, width, height)}
                    </div>
                );
              }}
            </ReactResizeDetector>
        );
    }

    // open / close animation
    toggle(e) {
        e.preventDefault();
        this.props.toggleState();
    }
}


const SpringLinks = styled(_SpringLinks)`
    /*background-color: #A0A0A0;*/
    background: rgba(0,0,0,0);
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    pointer-events: none;  /* dont catch mouse events */
`;

export default withStore(withTheme(SpringLinks));
