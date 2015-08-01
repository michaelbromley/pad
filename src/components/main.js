import React from 'react';
import {RouteHandler} from 'react-router';
import PadList from 'components/padList';

class Main extends React.Component {

  render() {
    return (
      <div>
        <h1>Pad.</h1>
        <RouteHandler></RouteHandler>
      </div>
    );
  }
}

export default Main;  