/* ---------------------------------------------------------------------
 === "HomePage" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    HomePage
 description:  animated home page
----------------------------------------------------------------------*/
import React, { Component } from 'react';
import './homepage.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import SpringSequence from '../springsequence';
import SpingLinks, { CONSTANTS as SpringLinksConstants } from 'components/springlinks';
import { withStore } from '@spyna/react-store';
import {Link} from 'react-router-dom'; 
import config from 'config';
import { withResources as _withResources } from 'resources';

// TODO organize project better
const ZEN_ICON = "fas fa-seedling";


/**
 * theme
 */
const BG_COLOR1 = theme('mode', {
    default: props => props.theme.primary + '60',  // alpha
});
const BG_COLOR2 = theme('mode', {
    default: props => props.theme.primary + 'd9',  // alpha
});
const PAGE_BACKGROUND = theme('mode', {
    default: props => props.theme.secondary,
});
const SECONDARY_BACKGROUND = theme('mode', {
    default: props => props.theme.primary,
});


/**
 * withResources
 *
 * HOC decorating withResource from 'resources' module, in order to
 * specifically use homepage Resources mapping, accessed from
 * props.store. It then includes the withStore HOC which provides the
 * with props.store.
 */
const withResources = (WrappedComponent, resources) => {
    const source = (props) => {
        const resources = props.store.get('resources');
        return resources.homepage;
    };
    return withStore(_withResources(WrappedComponent, resources, source));
};


/**
 * Background
 * 
 * the home page's background, expecting to receive 'progress' props,
 * which is an array containing progress values of the home page
 * animation. Background will use the main (index 0) value. See HomePage
 * for details.
 *
 * The background change the aspect of the images according to the main
 * animation's progress value, changing the opacity / size of the images.
 *
 * renders a div containing one background image. The div has an
 * "absolute" position so it's integrated in the home page div seamlessly.
 */
class _Background extends Component {
    /**
     * render components wrapped into a main div
     */
    render() {
        // get the background image source from resources
        const resources = this.props.store.get('resources');
        const layer1 = resources.homepage.getValue('backgroundLayer1');

        // the image increases opacity and size (spread effect)
        // according to the progress value of the homepage's animation
        const p = this.props.progress[0];
        const layer1Style = {
            opacity: p / 5,
            width: `${p * 100}%`,
            height: `${p * 100}%`,
        }

        return (
            <div className={this.props.className} style={{opacity: p}}>
              <img src={layer1} style={layer1Style} />
            </div>
        );
    }
}


const Background = styled(withStore(_Background))`
    position: absolute;
    margin: 0px;
    padding: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;  /* dont catch mouse events */
    background-color: ${SECONDARY_BACKGROUND};

    img {
        position: absolute;
    }
`;


/**
 * PresentationText
 *
 * shows presentation text content from static assets on top of the page,
 * the component is slided up and disappear when the animation run.
 *
 * the text content is downloaded from the API.
 */
class _PresentationText extends Component {
    /**
     * the text is centered between the top border and the main button
     * when the button expands (animation) the text is slided up and
     * eventually disappear
     */
    render() {
        const progress = this.props.progress[0];
        const style = {
            top: `${-50  * progress}%`,
        };
        const testid = { 'data-testid': 'PresentationText' };
        return (
            <div className={this.props.className} style={style} {...testid}>
              <div>
                <p>
                  {this.props.text}
                </p>
              </div>
            </div>
        );
    }
}


const PresentationText = styled(withResources(
        _PresentationText, { text: 'presentationText' }))`
    margin-top: 10px;
    padding: 0px;
    z-index: 0;

    width: calc(100% - 20px);
    height: calc(50% - 10px);

    position: absolute;
    background-color: ${BG_COLOR1};
    display: flex;
    overflow-y: scroll;

    div {
        display: flex;
        overflow-y: scroll;
        margin: 7px;
        margin-bottom: ${SpringLinksConstants.large.main_button_diam / 2}px;
        @media (max-width: ${config.media.small}px) {
            margin-bottom: ${SpringLinksConstants.small.main_button_diam / 2}px;
        }
    }

    p {
        margin: 0px;
        padding: 0px;
        color: white;
        font-size: 18px;
        text-align: justify;

        @media (max-width: ${config.media.small}px) {
            font-size: 14px;
        }
    }
`;


/**
 * ZenOfTheDayText
 *
 * randomly picks one of the zen quotes from static assets and display
 * it on the bottom of the page.
 *
 * The component is slided down and disappear when the animation run.
 *
 * the quotes are downloaded from the static assets (API). The data is
 * expected to be a json list in plain text.
 */
class _ZenOfTheDayText extends Component {
    _random = Math.random();  // randomly choose a quote in the list

    /**
     * the text is centered between the main button and the bottom
     * when the button expands (animation) the text is slided down and
     * eventually disappear
     */
    render() {
        const progress = this.props.progress[0];
        const style = {
            top: `${50 + 50  * progress}%`,
            height: `calc(${50 - 50 * progress}% - 10px)`,
        };
        const testid = { 'data-testid': 'ZenOfTheDayText' };

        // choose a quote in the downloaded list
        let text = this.props.text;
        try {
            let list = JSON.parse(text);
            text = list[Math.floor(this._random * list.length)];
        } catch(err) {}

        return (
            <div className={this.props.className} style={style} {...testid}>
              <div>
                <h2>
                  <i className={ZEN_ICON} /> Zen of the day:
                </h2>
                <p>
                  {text}
                </p>
              </div>
            </div>
        );
    }
}


const ZenOfTheDayText = styled(withResources(
        _ZenOfTheDayText, { text: 'zenOfTheDayText' }))`
    margin-bottom: 10px;
    padding: 0px;
    z-index: 0;

    width: calc(100% - 20px);

    position: absolute;
    background-color: ${BG_COLOR2};
    display: flex;
    overflow-y: scroll;

    div {
        width: 100%
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow-y: scroll;
        margin: 7px;
        margin-top: ${SpringLinksConstants.large.main_button_diam / 2}px;
        @media (max-width: ${config.media.small}px) {
            margin-top: ${SpringLinksConstants.small.main_button_diam / 2}px;
        }
    }

    h2 {
        margin: 0px;
        padding: 0px;
        color: white;
        font-size: 18px;
        font-weight: normal;
        text-align: center;

        @media (max-width: ${config.media.small}px) {
            font-size: 14px;
        }
    }

    p {
        font-style: italic;
        margin: 0px;
        padding: 0px;
        color: white;
        font-size: 18px;
        text-align: center;

        @media (max-width: ${config.media.small}px) {
            font-size: 14px;
        }
    }
`;


// TODO organize project better
/**
 * The link destination for the links displayed on the home page are
 * downloaded from the static assets (API).
 * We use Link components (react routing) for links to the same app...
 */
const aLink = (href) => withResources((props) => <a {...props} />, { href });
const routerLink = (to) => withResources(Link, { to });


/**
 * HomePage
 * 
 * the home page's components are wrapped into an SpringSequence
 * component in order to manage an "open / close" animation and
 * synchronize different components in the page. The animation
 * abstraction consists of an array of progress values (0 to 1),
 * increasing or decreasing one after another, using react-motion.
 *
 * ( SpringSequence forwards the "progress" property to all its child
 * components )
 *
 * renders the wrapping SpringSequence component (renders a div).
 *
 * Layout:
 *    
 * + ---------------------------------- +
 * |    PresentationText  component     |
 * + ---------------------------------- +
 * |                                    |
 * |       SpringLinks component        |
 * |                                    |
 * + ---------------------------------- +
 * |     ZenOfTheDayText  component     |
 * + ---------------------------------- +
 */
class _HomePage extends Component {
    LINKS = [
        {
            type: aLink('resume'),
            text: "resume",
            target: ':blank',
            icon: "far fa-file-alt",  // TODO theme ?
            "data-testid": 'link1',
        },
        {
            type: routerLink('contact'),
            text: "contact",
            icon: "fa fa-at",  // TODO theme ?
        },
        {
            type: aLink('linkedin'),
            text: "profile",
            target: ':blank',
            icon: "fab fa-linkedin",  // TODO theme ?
        },
        {
            type: aLink('github'),
            text: "github",
            target: ':blank',
            icon: "fab fa-github",  // TODO theme ?
        },
        {
            type: routerLink('blog'),
            text: "blog",
            icon: "far fa-newspaper",  // TODO theme ?
        },
        {
            type: routerLink('projects'),
            text: "projects",
            'data-link': { type: "to", value: 'projects' },
            icon: "fas fa-cubes",  // TODO theme ?
        },
    ];

    /**
     * @constructs HomePage
     */
    constructor(props) {
        super(props);
        this.toggleAnimation = this.toggleAnimation.bind(this);

        // is animation opened or closed
        const store = this.props.store
        store.set('homepage', {active: false});
    }

    /**
     * render HomePage
     */
    render() {
        // prepare props for SpringSequence
        const state = this.props.store.get('homepage');

        const props = {
            ...config.homepage.animation,
            length: this.LINKS.length,
            currentState: state.active || false,
            className: this.props.className
        };

        // render components wrapped into SpringSequence
        return (
            <SpringSequence {...props} >
              <PresentationText />
              <ZenOfTheDayText />
              <Background />
              <SpingLinks toggleState={this.toggleAnimation} links={this.LINKS} />
            </SpringSequence>
        );
    }

    /**
     * toggleAnimation
     * 
     * open or close the global animation changing the homepage' state
     */
    toggleAnimation() {
        const store = this.props.store;
        const state = store.get('homepage');
        store.set('homepage', {active: !state.active});
    }
}


const HomePage = styled(_HomePage)`
    background-color: ${PAGE_BACKGROUND};
    position: relative;
    margin: 0px;
    padding: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
`;

export default withStore(HomePage);
