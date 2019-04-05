/* ---------------------------------------------------------------------
 === "SpingLinks" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    SpingLinks
 description:  a set of links that expand from / collapse to a main button
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './springlinks.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import MediaQuery from 'react-responsive';
import { withStore } from '@spyna/react-store';


/* ---------------------------------------------------------------------
 — constants —
----------------------------------------------------------------------*/
// media queries
const CONSTANTS = {
    'large': {
        width: 500,
        height: 500,
        main_button_diam: 100,
        child_button_diam: 70,
        margin: 25,
    },
    'small': {
        width: 310,
        height: 310,
        main_button_diam: 90,
        child_button_diam: 65,
        margin: 10,
    }
}

const SMALL = 479;  // media query switch
const BEG_COLOR = 0x2658a8;
const END_COLOR = 0xf2df60;
const MAIN_CLOSED_ICON = 'fa fa-moon'
const MAIN_OPENED_ICON = 'fa fa-sun'

const DEG_TO_RAD = Math.PI / 180;
const toRadians = (deg) => deg * DEG_TO_RAD;


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

 + constants: constants to use, depending on the viewport
 + percent: progress value between 0 and 1
 + background: background color to use
----------------------------------------------------------------------*/
const mainButtonStyle = (constants, percent, background) => {
    //const deg = 180 * percent;
    const deg = 360 * percent;

    const main_button_diam = constants.main_button_diam;

    return {
        width: main_button_diam,
        height: main_button_diam,
        top: (constants.height / 2) - main_button_diam / 2,
        left: (constants.width / 2) - main_button_diam / 2,
        transform: `rotate(${deg}deg)`,
        backgroundColor: background
    };
};


/* ---------------------------------------------------------------------
 — childButtonStyle —
 
 give the style to apply to a child button for a given progression,
 and a given mode (depending on the viewport / i.e media).

 The background color is given as a parameter because it's shared
 between main and children buttons.

 params:

 + constants: constants to use, depending on the viewport
 + index: index of the child
 + percent: progress value between 0 and 1
 + background: background color to use
----------------------------------------------------------------------*/
const childButtonStyle = (constants, index, percent, background) => {
    const radius = constants.flyout_radius;
    const child_button_diam = constants.child_button_diam;

    const angle = constants.base_angle + index * constants.separation_angle;
    const dx = radius * Math.cos(toRadians(angle)) * percent;
    const dy = radius * Math.sin(toRadians(angle)) * percent;
    const dX = dx + child_button_diam / 2;
    const dY = dy + child_button_diam / 2;
    const deg = 360 * percent;

    return {
        width: child_button_diam,
        height: child_button_diam,
        top: (constants.height / 2) - dY,
        left: (constants.width / 2) - dX,
        transform: `rotate(${deg}deg)`,
        backgroundColor: background,
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
        <Type {..._props}>
            <i className={icon} />
            <p>{text}</p>
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

    p {
        margin: 0px;
        padding: 0px;
        font-size: 12px;
        text-align: center;
    }

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
`;


/* ---------------------------------------------------------------------
 — "SpingLinks" —
 
 `SpringLinks` expects to be provided with "progress" values, which is
 an array containing the animation progress value for each link. The
 values represent the percentage between start state and end state in
 the animation process. 

 `SpringLinks` then render a main central element, which will toggle the
 animation state, and child elements around it, one for each link.

 `SpringLinks` renders a main div element, which is responsive (small /
 large modes, small is used for smartphone-like viewport).

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
          <SpingLinks toggleState={toggleAnimation} links={links} />
        </SpringSequence>
    );

----------------------------------------------------------------------*/
class _SpingLinks extends Component {
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
            let w = cst.width;
            let h = cst.height;
            cst['flyout_radius'] = ((Math.min(w, h) / 2)
                                     - (cst.child_button_diam / 2)
                                     - cst.margin);
            cst['separation_angle'] = 360 / length;
            cst['fan_angle'] = (length - 1) * cst.separation_angle;
            cst['base_angle'] = (180 - cst.fan_angle) / 2;
        }
    }

    // build components to render for given progress values and mode
    // (mode is the mapping to use in CONSTANTS, i.e viewport size)
    // progress is an array containnig all progress values, 0 is main
    content(mode) {
        const progress = this.props.progress;
        const mainPercent = progress[0];
        const constants = this.constants[mode];

        // TODO theme colors
        let bg = lerpColor(BEG_COLOR, END_COLOR, mainPercent);
        bg = '#' + bg.toString(16);  // html hexa notation

        const mainStyle = mainButtonStyle(constants, mainPercent, bg);
        const mainIcon = mainPercent > 0.5 ? MAIN_OPENED_ICON : MAIN_CLOSED_ICON;

        // return a main div containing main and children components
        return (
            <div>
              {this.props.links.map((props, idx) => {
                const childProps = {
                    style: childButtonStyle(constants, idx, progress[idx], bg),
                    key: idx,
                    ...props
                };
                return <ChildLink {...childProps} />;
              })}
              <MainButton icon={mainIcon} style={mainStyle} onClick={this.toggle} />
            </div>
        );
    }

    // returns a wrapping div containing MediaQuery components
    // rendering their content only when appropriate
    render() {
        return (
            <div className={this.props.className}>
              <MediaQuery maxWidth={SMALL}>
                {this.content("small")}
              </MediaQuery>
              <MediaQuery minWidth={SMALL + 1}>
                {this.content("large")}
              </MediaQuery>
            </div>
        );
    }

    // open / close animation
    toggle(e) {
        e.preventDefault();
        this.props.toggleState();
    }
}


const SpingLinks = styled(_SpingLinks)`
    background-color: #A0A0A0;
    /*background-color: inherit;*/
    position: relative;

    --w: ${CONSTANTS['large'].width}px;
    --h: ${CONSTANTS['large'].height}px;

    @media (max-width: ${SMALL}px) {
        --w: ${CONSTANTS['small'].width}px;
        --h: ${CONSTANTS['small'].height}px;
    }

    width: var(--w);
    height: var(--h);
    left: 0; /*calc(50vw - var(--w)/2);*/
    top: 0; /*calc(50% - var(--h)/2);*/
`;

export default withStore(SpingLinks);
