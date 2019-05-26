import React, { Component } from 'react';
import './App.css';
import styled, { ThemeProvider } from 'styled-components';
import { createStore, withStore } from '@spyna/react-store';
import { Route, BrowserRouter as Router } from 'react-router-dom';
// components
import Header from 'components/header';
import PageTitle from 'components/pagetitle';
import NavBar from 'components/navbar';
import HomePage from 'components/homepage';
import ContactPage from 'components/contactpage';
import config from 'config';
// theme
import theme from 'themes/default';
// resources mapping
import { future } from 'resources';


/* ---------------------------------------------------------------------
 — Wrapper component to forward the theme —

 The theme "mode" is stored in the application state, with the
 key "theme".

 Use theme.small or theme.large depending on the viewport size
 (config.media.small).

 The theme is then expected to have 'small' and 'large' attributes
 containing the actual theme.

 TODO see below
----------------------------------------------------------------------*/
// render the child components with the appropriate theme according
// to the 'viewport' state ('small', 'large'...)
const _AppContent = (props) => {
        // get state and setup theme
        const store = props.store;
        const _theme = {
            mode: store.get('theme'),
            ...theme[store.get('viewport')],  // 'small', 'large'...
        };
        // render children with theme
        return (
            <ThemeProvider theme={_theme}>
              <div className='AppContent'>
                {props.children}
              </div>
            </ThemeProvider>
        );
};

export const AppContent = withStore(_AppContent);


// TODO separate component (separate file),
// ( tests are currently in App.test.js )
//
// HOC to maintain a 'viewport' state in the global store,
// the value is updated according to the window size, comparing the
// width to values defined in config.media. The 'viewport' state is
// set to 'small', 'large'...
// 
// At App level this allows to forward the theme (theme.small,
// theme.large...). Components are also able to access the 'viewport'
// state from the global store anywhere in the hierarchy if needed.
export const DetectViewport = (Wrapped) => {
    class Viewport extends Component {
        constructor(props) {
            super(props);
            
            // create sorted array containing viewport sizes from config:
            const sizes = []
            for (let type in config.media) {
                if (type != 'default') {
                    const size = config.media[type];
                    sizes.push([size, type]);
                }
            }
            // [ [479, 's1'], [600, 's2'], ..., [800, 'sN'] ]
            // max-width values, last one (largest) does not matter
            sizes.sort((a, b) => a[0] - b[0]);
            this.sizes = sizes;

            // prepare callback
            this.updateViewport = this.updateViewport.bind(this);
        }
    
        // update the viewport state ("small", "large"...)
        updateViewport() {
            let wType = config.media.default;
            // determine wType according to current viewport width
            const innerW = window.innerWidth;
            // ignore if undefined or 0
            if (innerW) {
                // [ [479, 's1'], [600, 's2'], ..., [800, 'sN'] ]
                // this.sizes contains max-width value for each label,
                // the value of the last one does not matter.
                let i = 0;
                let w;
                do {
                    [w, wType] = this.sizes[i];
                    i++;
                } while (i < this.sizes.length && innerW > w);
            }
            // set state
            const store = this.props.store;
            store.set('viewport', wType);
        }

        // init viewport state and add resize window listener
        componentWillMount() {
            this.updateViewport();
            window.addEventListener("resize", this.updateViewport);
        }

        // remove resize window listener
        componentWillUnmount() {
            window.removeEventListener("resize", this.updateViewport);
        }
    
        // render wrapped component
        render() {
            return <Wrapped {...this.props} />;
        }
    };
    
    return withStore(Viewport);
};


/* ---------------------------------------------------------------------
 — main views components —

 TODO
----------------------------------------------------------------------*/
// dummy page
const Todo = ({ match }) => {
    let id = match.params.contentId;
    return (
        <div>
          <p style={{margin: "0px", color: "black"}}>
            show content: {id == ':contentId' ? 0 : id}
          </p>
        </div>
    );
};


// props: isExact + path, component... (Route)
const Main = (props) => {
    let routes = props.routes.map(
        ({isExact=false, ...route}, index) => (
            ({isExact} ? <Route exact {...route} key={index} />
                     : <Route {...route} key={index} />))
    );
    return <main>{routes}</main>;
};


/* ---------------------------------------------------------------------
 — main views setup —

 TODO organize project better
----------------------------------------------------------------------*/
// main views
// ( navbar props: name, link )
// ( main content props: isExact, component, path )
const pages = [
    {name: "home", link: "/", isExact: true, component: HomePage, path: "/"},
    {name: "contact", link: "/contact", component: ContactPage, path: "/contact"},
    {name: "todo", link: "/todo/0", component: Todo, path: "/todo/:contentId"},
];


/* ---------------------------------------------------------------------
 — main —

 TODO
----------------------------------------------------------------------*/
const RootContent = DetectViewport(AppContent);

class App extends Component {
    render() {
        return (
            <Router>
              <div className="App">
                <RootContent>
                  <Header>
                    <PageTitle />
                    <NavBar links={pages} />
                  </Header>
                  <Main routes={pages} />
                </RootContent>
              </div>
            </Router>
        );
    }
}


/* ---------------------------------------------------------------------
 — app state setup —

 TODO:
 will do the job for now
----------------------------------------------------------------------*/
const initialState = {
    theme: 'default',  // mode to use with the theme
    viewport: config.media.default,  // "small", "large"...
    resources: future,  // resources mapping => TODO tmp ("future")
}


export default createStore(App, initialState)
