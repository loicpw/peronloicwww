import React, { Component } from 'react';
import './App.css';
import styled, { ThemeProvider } from 'styled-components';
import { createStore, withStore } from '@spyna/react-store';
import { Route, BrowserRouter as Router } from 'react-router-dom';
// components
import Header from './components/header';
import PageTitle from './components/pagetitle';
import NavBar from './components/navbar';
import HomePage from './components/homepage';
import { INITIAL_STATE as HOMEPAGE_STATE } from './components/homepage';


/* ---------------------------------------------------------------------
 — theme —

 .. seealsol:: `styled-components`, `styled-theming`

 TODO
----------------------------------------------------------------------*/
const palette = {
    red: "#B03060",
    orange: "#FE9A76",
    yellow: "#FFD700",
    olive: "#32CD32",
    green: "#016936",
    teal: "#008080",
    blue: "#0E6EB8",
    violet: "#EE82EE",
    purple: "#B413EC",
    pink: "#FF1493",
    brown: "#A52A2A",
    grey: "#A0A0A0",
    black: "#000000"
}

const _theme = {
    primary: palette.pink,
    secondary: palette.grey,
    ...palette
};


/* ---------------------------------------------------------------------
 — Wrapper component to forward the theme —

 The theme "mode" is stored in the application state, with the
 key "theme".

 TODO
----------------------------------------------------------------------*/
const _AppContent = (props) => {
    const theme = {
        mode: props.store.get('theme'),
        ..._theme
    };
    return (
        <ThemeProvider theme={theme}>
          <div className='AppContent'>{props.children}</div>
        </ThemeProvider>
    );
}

const AppContent = withStore(_AppContent);


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

 TODO
----------------------------------------------------------------------*/
// main title
const title = "~ website ~";

// main views
// ( navbar props: name, link )
// ( main content props: isExact, component, path )
const pages = [
    {name: "home", link: "/", isExact: true, component: HomePage, path: "/"},
    {name: "todo", link: "/todo/0", component: Todo, path: "/todo/:contentId"},
];


/* ---------------------------------------------------------------------
 — main —

 TODO
----------------------------------------------------------------------*/
class App extends Component {
    render() {
        return (
            <Router>
              <div className="App">
                <AppContent>
                  <Header>
                    <PageTitle text={title}/>
                    <NavBar links={pages} />
                  </Header>
                  <Main routes={pages} />
                </AppContent>
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
    theme: 'default',
    ...HOMEPAGE_STATE,
}


export default createStore(App, initialState)
