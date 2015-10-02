import React from 'react';
import {Route, DefaultRoute} from 'react-router';

import Main from 'components/main';
import PadList from 'components/padList';
import Pad from 'components/pad/pad';

const routes = (
  <Route handler={Main}>
    <DefaultRoute handler={PadList}/>
    <Route name="pad" path="pad/:id" handler={Pad}/>
  </Route>
);

export default routes;