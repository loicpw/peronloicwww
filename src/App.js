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
import ContactPage from './components/contactpage';


/* ---------------------------------------------------------------------
 — theme —

 .. seealsol:: `styled-components`, `styled-theming`
----------------------------------------------------------------------*/
const _theme = {
    primary: '#154360',
    secondary: '#fbfcfc',
    error: '#cc0000',
    success: '#00bb00',
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
class App extends Component {
    render() {
        return (
            <Router>
              <div className="App">
                <AppContent>
                  <Header>
                    <PageTitle />
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
}


export default createStore(App, initialState)
