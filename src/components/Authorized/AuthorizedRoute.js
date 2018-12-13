import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Authorized from './Authorized';

class AuthorizedRoute extends React.Component {
  render() {
    const {
      component: Component,
      render,
      authority,
      redirectPath,
      list,
      sessionId,
      ...rest
    } = this.props;
    return (
      <Authorized
        authority={authority}
        noMatch={<Route {...rest} render={() => <Redirect to={{ pathname: redirectPath }} />} />}
      >
        <Route
          {...rest}
          render={props => {
            console.log(rest);
            return Component ? (
              <Component {...rest} list={list} sessionId={sessionId} {...props} />
            ) : (
              render(props)
            );
          }}
        />
      </Authorized>
    );
  }
}

export default AuthorizedRoute;
