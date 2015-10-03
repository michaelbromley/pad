import React from 'react';
import {RouteHandler} from 'react-router';
import PadList from 'components/padList/padList';

class Main extends React.Component {

  render() {
    return (
      <div>
        <div className="header">Pad.</div>
        <RouteHandler></RouteHandler>
      </div>
    );
  }
}

export default Main;  