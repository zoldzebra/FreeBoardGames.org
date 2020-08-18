import React from 'react';
import FreeBoardGamesBar from 'components/App/FreeBoardGamesBar';
import Header from 'components/Header';
import { GamesList } from 'components/App/GamesList';
import SEO from 'components/SEO';
import { AuthUserContext, GoToSignInPage } from '../components/Session';
import { useUser } from '../utils/auth/useUser';
import firebase from 'firebase/app';

const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json());


const Index = () => {
  const { logout } = useUser();

  const fetchOnlineUsers = () => {
    let onlineUsers = [];
    const onDataCallback = (snapshot) => {
      snapshot.forEach(snapshotData => {
        const email = snapshotData.val().email;
        onlineUsers.push(email);
      })
    };
    const firebaseDb = firebase.database();
    const usersRef = firebaseDb.ref('users');
    usersRef
      .orderByChild('online')
      .equalTo(true)
      .on(
        'value',
        onDataCallback
      );
    return onlineUsers;
  }

  // update has to put to useEffect or sthg like that

  const renderMainPage = (authUser) => {
    const onlineUsers: string[] = fetchOnlineUsers();
    console.log({ onlineUsers });

    const renderOnlineUserMails = () => {
      if (!onlineUsers.length) return null;
      return (
        <ul>
          {onlineUsers.map(userMail => {
            return (
              <li key={userMail}>{`${userMail}`}</li>
            )
          })
          }
        </ul>
      )
    }

    return (
      <FreeBoardGamesBar FEATURE_FLAG_readyForDesktopView>
        <SEO
          title={'Play Free Board Games Online'}
          description={
            'Play board games in your browser for free.  Compete against your online friends or play locally.  Free and open-source software project.'
          }
        />
        <Header />
        <p>You're signed in. Email: {authUser.email}</p>
        <p
          style={{
            display: 'inline-block',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() => logout()}
        >
          Log out
        </p>
        <p>Online users:</p>
        {renderOnlineUserMails()}
        <GamesList />
      </FreeBoardGamesBar>
    )
  }

  return (
    <AuthUserContext.Consumer>
      {authUser => {
        return authUser ? renderMainPage(authUser) : <GoToSignInPage />
      }
      }
    </AuthUserContext.Consumer>
  )
}

export default Index
