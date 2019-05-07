/* ---------------------------------------------------------------------
 === "Header" ===

 author:       Loïc Peron
 email:        peronloic.us@gmail.com
 github:       https://github.com/loicpw

 component:    Header
 description:  app header container
--------------------------------------------------------------------- */
import React, { Component } from 'react';
import './header.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styled-theming';
import res from 'resources';


/* ---------------------------------------------------------------------
 — "FixedHeader" —
 
 creates a wrapping div element to hold children components on top.

 `FixedHeader` has a fixed position on top of the viewport. It renders a
 fix banner that occupied the whole width and whose height depends on
 its children.

 It displays in flex / column mode.

 renders a "div" element.

 example ::

    <body>
        <header>
            <FixedHeader>
                <h1>my title</h1>
                <p>this will stick on the top</p>
            </FixedHeader>
        </header>
        <nav>...</nav>
    </body>
--------------------------------------------------------------------- */
class _FixedHeader extends Component {
    constructor(props) {
        super(props)
        this._div = React.createRef();
    }
    
    // get the actual height of the component
    getHeight() {
        return this._div.current.clientHeight;
    }
    
    render() {
        return (
            <div className={this.props.className} ref={this._div}>
              {this.props.children}
            </div>
        );
    }
}


const FixedHeader = styled(_FixedHeader)`
    position: fixed;
    top: 0px;
    left: 0px;
    margin: 0px;
    padding: 10px;
    padding-bottom: 7px;
    width: calc(100% - 20px);  /* - 2 * padding */
    height: auto;
    /*background-color: #ffffff;*/
    background-image: url(${res.header.img});
    background-position: center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    z-index: 1;
`;


/* ---------------------------------------------------------------------
 — "Header" —
 
 creates a wrapping header element to hold children components on top.

 `Header` has a fixed position on top of the viewport. It renders a fix
 banner that occupied the whole width and whose height depends on its
 children.

 it also creates a phantom "div" inside the header that matches the
 height of the fixed banner so subsequent elements will respect the
 header.

 It displays in flex / column mode.

 renders a "header" element.

 example ::

    <Header>
        <header>
            <h1>my title</h1>
            <p>this will stick on the top</p>
        </header>
        <nav>...</nav>
    </Header>
--------------------------------------------------------------------- */
class Header extends Component {
    constructor(props) {
        super(props)
        // store height of the fixed banned
        this.state = {
            height: 0
        }
        this._content = React.createRef();
    }

    // record the height of the fixed banner (FixedHeader component)
    componentDidMount() {
        const height = this._content.current.getHeight();
        this.setState({ height });
    }

    render() {
        // add a phantom div that matches the height of
        // the FixedHeader component, which  will act as a
        // margin for elements following the "header"
        return (
            <header className={this.props.className}>
              <FixedHeader ref={this._content}>
                {this.props.children}
              </FixedHeader>
              <div style={{height: `${this.state.height}px`, position: 'relative'}} />
            </header>
        );
    }
}


export default Header;
