/* eslint-disable react/react-in-jsx-scope */

import { useEffect, useState } from 'react';
import App from 'next/app';
import { AppProps } from 'next/app';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../src/theme';
import { SelfXSSWarning } from 'components/App/SelfXSSWarning';
import withError from 'next-with-error';
import ErrorPage from './_error';
import ReactGA from 'react-ga';
import Router from 'next/router';
import { AuthUserContext } from '../components/Session';
import { useUser } from '../utils/auth/useUser';

function MyApp({ Component, pageProps }: AppProps) {
  const { user, logout } = useUser();

  useEffect(() => {
    // Remove the server-side injected CSS:
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  console.log({ pageProps, Component });
  return (
    <ThemeProvider theme={theme}>
      <AuthUserContext.Provider value={user}>
        <SelfXSSWarning />
        <Component {...pageProps} />
      </AuthUserContext.Provider>
    </ThemeProvider>
  );
}
// todo: handle errors
// export default withError(ErrorPage)(MyApp);

export default MyApp;
