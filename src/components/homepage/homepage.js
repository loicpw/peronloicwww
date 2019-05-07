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
import res from 'resources';

// TODO organize project better
const ZEN_ICON = "fas fa-seedling";

// TODO organize project better
// the links values are downloaded using 'value' in
// 'data-link' as key in resources.homepage
const LINKS = [
    {
        type: 'a',
        text: "resume",
        'data-link': { type: "href", value: 'resume' },
        target: ':blank',
        icon: "far fa-file-alt",  // TODO theme ?
        "data-testid": 'link1',
    },
    {
        type: Link,
        'data-link': { type: "to", value: 'contact' },
        text: "contact",
        icon: "fa fa-at",  // TODO theme ?
    },
    {
        type: 'a',
        text: "profile",
        'data-link': { type: "href", value: 'linkedin' },
        target: ':blank',
        icon: "fab fa-linkedin",  // TODO theme ?
    },
    {
        type: 'a',
        text: "github",
        'data-link': { type: "href", value: 'github' },
        target: ':blank',
        icon: "fab fa-github",  // TODO theme ?
    },
    {
        type: Link,
        text: "blog",
        'data-link': { type: "to", value: 'blog' },
        icon: "far fa-newspaper",  // TODO theme ?
    },
    {
        type: Link,
        text: "projects",
        'data-link': { type: "to", value: 'projects' },
        icon: "fas fa-cubes",  // TODO theme ?
    },
];


/* ---------------------------------------------------------------------
 — theme —
----------------------------------------------------------------------*/
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


/* ---------------------------------------------------------------------
 — "Background" —
 
 the home page's background, expecting to receive 'progress' props,
 which is an array containing progress values of the home page animation.
 `Background` will use the main (index 0) value. See `HomePage` for
 details.

 The background change the aspect of the images according to the main
 animation's progress value, changing the opacity / size of the images.

 .. seealso:: `SpringSequence` forwards the "progress" property to all
    its children components.

 renders a div containing one background image. The div has an "absolute"
 position so it's integrated in the home page div seamlessly.
----------------------------------------------------------------------*/
class _Background extends Component {
    //
    render() {
        // render components wrapped into a main div
        const layer1 = res.homepage.backgroundLayer1;
        const p = this.props.progress[0];
        // img increase opacity and size (spread effect)
        const layer1Style = {
            opacity: p / 5,
            width: `${p * 100}%`,
            height: `${p * 100}%`,
        }
        // images are rendered centered on top of each other
        return (
            <div className={this.props.className} style={{opacity: p}}>
              <img src={layer1} style={layer1Style} />
            </div>
        );
    }
}


const Background = styled(_Background)`
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


/* ---------------------------------------------------------------------
 — "DownloadText" —
 
 HOC to display text on the home page, the component downloads the plain
 text content from the specified adress.
 A 'Missing text' placeholder is used until the content is downloaded.

 The content is passed as props to the wrapped component as 'text'

 parameters:

 + content: path of the content (plain text content)
----------------------------------------------------------------------*/
const DownloadText = (WrappedComponent, content) => {
    return class extends Component {
        _isMounted = false;  // prevent setState if unmounted (Http request)
    
        //
        constructor(props) {
            super(props);
    
            // get text from static assets repos using API
            // update text asap, see componentDidMount
            this.state = {
                text: 'Missing text',
            };
        }
    
        // handle this in componentDidMount to be sure we dont change the
        // state before the component is mounted (ex: automated tests)
        componentDidMount() {
            this._isMounted = true;
    
            // the text is stored in a text file, get plain text from API
            const Http = new XMLHttpRequest();
            // TODO organize project better
            Http.open("GET", content);
            Http.onload = () => {
                if (this._isMounted) {
                    this.setState({ text: Http.responseText });
                }
            };
            Http.send();
        }
    
        // prevent setState if unmounted (Http request)
        componentWillUnmount() {
            this._isMounted = false;
        }
    
        // render the Wrapped component with 'text'
        render() {
            return <WrappedComponent text={this.state.text} {...this.props} />;
        }
    };
}


/* ---------------------------------------------------------------------
 — "PresentationText" —

 .. seealso:: `DownloadText`
 
 shows presentation text content from static assets on top of the page,
 the component is slided up and disappear when the animation run.

 the text content is downloaded from the API (text/introduction.txt)
----------------------------------------------------------------------*/
class _PresentationText extends Component {
    // the text is centered between the top border and the main button
    // when the button expands (animation) the text is slided up and
    // eventually disappear
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


const PresentationText = styled(DownloadText(_PresentationText,
                                             res.homepage.presentationText))`
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


/* ---------------------------------------------------------------------
 — "ZenOfTheDayText" —
 
 .. seealso:: `DownloadText`

 randomly pick one of the zen quotes from static assets and display it
 on the bottom of the page.

 The component is slided down and disappear when the animation run.

 the quotes are downloaded from the static assets (API). The data is
 expected to be a json list in plain text.
----------------------------------------------------------------------*/
class _ZenOfTheDayText extends Component {
    _random = Math.random();  // randomly choose a quote in the list

    // the text is centered between the main button and the bottom
    // when the button expands (animation) the text is slided down and
    // eventually disappear
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


const ZenOfTheDayText = styled(DownloadText(_ZenOfTheDayText,
                                            res.homepage.zenOfTheDayText))`
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


/* ---------------------------------------------------------------------
 — "HomePage" —
 
 the home page's components are wrapped into an `SpringSequence`
 component in order to manage an "open / close" animation and
 synchronize different components in the page. The animation abstraction
 consists of an array of progress values (0 to 1), increasing or
 decreasing one after another, using react-motion.

 .. seealso:: `SpringSequence` forwards the "progress" property to all
    its children components.

 renders the wrapping `SpringSequence` component (renders a div).

 Layout ::
    
    + ---------------------------------- +
    |    PresentationText  component     |
    + ---------------------------------- +
    |                                    |
    |       SpringLinks component        |
    |                                    |
    + ---------------------------------- +
    |     ZenOfTheDayText  component     |
    + ---------------------------------- +

 .. seealso:: `SpringLinks` component
----------------------------------------------------------------------*/
class _HomePage extends Component {
    _isMounted = false;  // prevent setState if unmounted (Http request)

    //
    constructor(props) {
        super(props);
        this.toggleAnimation = this.toggleAnimation.bind(this);

        // is animation opened or closed
        const store = this.props.store
        store.set('homepage', {active: false});

        // get link values from static assets repos using API
        // update links asap
        
        // setupLink: process one item in 'LINKS':
        // search for 'data-link' key in the object,
        // 'data-link' should be as followings:
        //
        //   { 
        //      type,  // type of link, ex: 'a' or Link (see SpringLinks)
        //      value, // path of the link value
        //   }
        //
        // then create a XMLHttpRequest to obtain the link value from
        // the API. Once the value is obtained, the state of HomePage
        // is updated.
        // A "missing link" placeholder is set as link value until then.
        const setupLink = (link, index) => {
            const _link = {...link};
            const data = _link['data-link'];
            if (data) {
                _link[data.type] = "missing link";
                const Http = new XMLHttpRequest();
                // TODO organize project better
                Http.open("GET", res.homepage[data.value]);

                Http.onload = () => {
                    const current = this.state.links
                    const update = {...current[index]};
                    const resp = JSON.parse(Http.responseText);
                    update[`${data.type}`] = resp.Items[0].link.S;
                    if (this._isMounted) {
                        this.setState({ 
                            links: [
                                ...current.slice(0,index),
                                update,
                                ...current.slice(index + 1),
                            ]
                        });
                    }
                };

                _link['data-link'] = Http;
            } 
            return _link;
        }

        // init the state
        this.state = { links: LINKS.map(setupLink) };
    }

    // handle this in componentDidMount to be sure we dont change the
    // state before the component is mounted (ex: automated tests)
    componentDidMount() {
        this._isMounted = true;

        // get the XMLHttpRequest for each link and send it
        this.state.links.forEach((link) => {
            const http = link['data-link'];
            if (http)
                http.send();
        });
    }

    // prevent setState if unmounted (Http request)
    componentWillUnmount() {
        this._isMounted = false;
    }

    //
    render() {
        // prepare props for SpringSequence
        const state = this.props.store.get('homepage');

        const props = {
            ...config.homepage.animation,
            length: LINKS.length,
            currentState: state.active || false,
            className: this.props.className
        };

        // render components wrapped into SpringSequence
        return (
            <SpringSequence {...props} >
              <PresentationText />
              <ZenOfTheDayText />
              <Background />
              <SpingLinks toggleState={this.toggleAnimation} links={this.state.links} />
            </SpringSequence>
        );
    }

    // open / close animation toggling the homepage' state
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
