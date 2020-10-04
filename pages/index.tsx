import React, { useState, useEffect } from 'react';
import FreeBoardGamesBar from 'components/App/FreeBoardGamesBar';
import Header from 'components/Header';
import { GamesList } from 'components/App/GamesList';
import SEO from 'components/SEO';
import { AuthUserContext, GoToSignInPage } from '../components/Session';
import { useUser } from '../utils/auth/useUser';
import firebase from 'firebase/app';
import { Button, Paper } from '@material-ui/core';

interface User {
  id: string,
  email: string,
}

const Index = () => {
  const { logout } = useUser();
  const [onlineUsers, setOnlineUsers] = useState([] as User[]);
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
          foundOnlineUsers.push({
            id: childSnapshot.key,
            email
          });
        });
        setOnlineUsers([...foundOnlineUsers]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb]);

  const renderOnlineUserMails = (authUserId) => {
    if (!onlineUsers.length) return null;
    return onlineUsers
      .filter(user => user.id !== authUserId)
      .map(user => {
        return onlinePlayerWithInvite(user);
      })
  }

  const onlinePlayerWithInvite = (user: User) => {
    return (
      <Paper key={user.id}>
        { user.email}
        <Button
          variant='contained'
          color='primary'
          onClick={() => console.log(`click on user id ${user.id}`)}
        >
          Invite!
        </Button>
      </Paper>
    )
  }

  const renderMainPage = (authUser) => {
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
        {renderOnlineUserMails(authUser.id)}
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
