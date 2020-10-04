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

interface Invitation {
  invitationTo: string,
  invitationFrom: string,
  invitationTime: number,
}

const Index = () => {
  const { logout } = useUser();
  const [onlineUsers, setOnlineUsers] = useState([] as User[]);
  const [invitations, setInvitations] = useState([] as Invitation[]);
  const firebaseDb = firebase.database();
  const usersRef = firebaseDb.ref('users');
  const invtiationsRef = firebaseDb.ref('invitations');

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

  useEffect(() => {
    const listener = invtiationsRef
      .orderByChild('invitationTime')
      .on('value', snapshot => {
        let activeInvitations = [];
        snapshot.forEach(childSnapshot => {
          const invitationTo = childSnapshot.val().invitationTo;
          const invitationFrom = childSnapshot.val().invitationFrom;
          activeInvitations.push({
            id: childSnapshot.key,
            invitationTo,
            invitationFrom,
          });
        });
        setInvitations([...activeInvitations]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb]);

  const inviteUser = (invitationTo: string, invitationFrom: string) => {
    const newInvite = firebaseDb.ref('invitations/').push();
    newInvite.set({
      invitationTo,
      invitationFrom,
      invitationTime: Date.now(),
    });
  }

  const renderInvitations = (authUserId) => {
    if (!invitations.length) return null;
    return invitations
      .filter(invitation => invitation.invitationTo !== authUserId)
      .map(invitation => {
        return invitationItem(invitation.invitationFrom);
      })
  }

  const invitationItem = (from: string) => {
    return (
      <Paper key={from}>
        { from}
      </Paper>
    )
  }

  const renderOnlineUserMails = (authUserId) => {
    if (!onlineUsers.length) return null;
    return onlineUsers
      .filter(user => user.id !== authUserId)
      .map(user => {
        return onlinePlayerWithInvite(user, authUserId);
      })
  }

  const onlinePlayerWithInvite = (user: User, authUserId: string) => {
    return (
      <Paper key={user.id}>
        { user.email}
        // TODO: should switch to Cancel invite! after pushed
        <Button
          variant='contained'
          color='primary'
          onClick={() => inviteUser(user.id, authUserId)}
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
        <p>Active invitations to you:</p>
        {renderInvitations(authUser.id)}
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
