/* eslint-disable react/react-in-jsx-scope */

import { useEffect } from 'react';
import { AppProps } from 'next/app';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../src/theme';
import { SelfXSSWarning } from 'components/App/SelfXSSWarning';
import { AuthUserContext } from '../components/Session';
import { useUser } from '../utils/auth/useUser';
import firebase from 'firebase';

function MyApp({ Component, pageProps }: AppProps) {
  const { user } = useUser();

  // console.log('_app user:', user);

  const firebaseDb = firebase.database();

  const checkAuthStateChanged = () => {
    // console.log('checkAuthStateChanged ran for user:', user);
    // this users the auth db user w uid
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        firebaseDb.ref('users/' + user.uid).set({
          email: user.email,
          online: true
        })
          .then(function () {
            console.log('Synchronization succeeded');
          })
          .catch(function (error) {
            console.log('Synchronization failed');
          });
      }
      if (!user) {
        console.log('User logged out:', user);
      }
    });
  }

  useEffect(() => {
    // Remove the server-side injected CSS:
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // console.log({ pageProps, Component });

  checkAuthStateChanged();

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
