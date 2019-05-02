import React from 'react';
import ReactDOM from 'react-dom';
import NavBar from 'components/navbar';
import { BrowserRouter as Router } from 'react-router-dom';


it('renders without crashing', () => {
  const div = document.createElement('div');
  let links = [
    {name: "home", link: "/"},
    {name: "topic", link: "/topic"},
  ];
  ReactDOM.render(<Router><NavBar links={links} /></Router>, div);
  ReactDOM.unmountComponentAtNode(div);
});
