import React, { useState, useEffect } from 'react';
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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const firebaseDb = firebase.database();
  const usersRef = firebaseDb.ref('users');

  useEffect(() => {
    const listener = usersRef
      .orderByChild('online')
      .equalTo(true)
      .on('value', snapshot => {
        let foundOnlineUsers = [];
        snapshot.forEach(childSnapshot => {
          const email = childSnapshot.val().email;
          foundOnlineUsers.push(email);
        });
        setOnlineUsers([...foundOnlineUsers]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb]);


  const renderMainPage = (authUser) => {
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
