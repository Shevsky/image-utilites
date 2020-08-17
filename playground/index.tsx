import classNames from 'classnames';
import { createHashHistory, History } from 'history';
import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch, useHistory, useLocation } from 'react-router';
import { Routes, TRoute } from './config/routes';
import './index.sass';

function App(): JSX.Element {
  const history = useHistory();
  const location = useLocation();

  useEffect((): void => {
    if (!location.pathname || location.pathname === '/') {
      history.push(Object.keys(Routes)[0]);
    }
  }, []);

  return (
    <div className="app">
      <div className="app__header">Image Utilites Playground</div>

      <div className="app__menu">
        {Object.entries(Routes).map(
          ([path, route]: [string, TRoute]): JSX.Element => (
            <a
              key={path}
              className={classNames('app__menu-item', {
                ['app__menu-item--active']: location.pathname === path,
              })}
              href={`#${path}`}
            >
              {route.name}
            </a>
          )
        )}
      </div>

      <Switch>
        {Object.entries(Routes).map(
          ([path, route]: [string, TRoute]): JSX.Element => (
            <Route key={path} path={path} component={route.component} />
          )
        )}
      </Switch>
    </div>
  );
}

function AppWrapper(): JSX.Element {
  const history = useMemo((): History => createHashHistory(), []);

  return (
    <Router history={history}>
      <App />
    </Router>
  );
}

ReactDOM.render(<AppWrapper />, document.querySelector('#root'));
