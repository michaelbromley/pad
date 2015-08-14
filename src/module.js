// Bootstrapping module
import React from 'react';  
import Router from 'react-router';  
import routes from 'routes';

// Common styles
require('flexboxgrid/dist/flexboxgrid.css');
require('styles/main.css');

Router.run(routes, Router.HashLocation, (Root, state) => {
  React.render(<Root {...state}/>, document.getElementById('content'));
});