import React from 'react';  
import {RouteHandler, Link} from 'react-router';
import PadList from 'components/padList';

class Main extends React.Component {

  render() {
    return (
      <div>
        <h1>Pad.</h1>
        <PadList></PadList>
      </div>
    );
  }
}

export default Main;  