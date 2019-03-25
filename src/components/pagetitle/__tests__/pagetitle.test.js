import React from 'react';
import ReactDOM from 'react-dom';
import PageTitle from '../pagetitle';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PageTitle />, div);
  ReactDOM.unmountComponentAtNode(div);
});
