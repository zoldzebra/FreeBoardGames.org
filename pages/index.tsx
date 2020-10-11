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
  invitationToId: string,
  invitationFromEmail: string,
  invitationFromId: string,
  invitationTime: number,
}

const Index = () => {
  const { logout, user } = useUser();
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
          if (user && user.id !== childSnapshot.key) {
            foundOnlineUsers.push({
              id: childSnapshot.key,
              email,
            });
          }
        });
        setOnlineUsers([...foundOnlineUsers]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb, user]);

  useEffect(() => {
    const listener = invtiationsRef
      .orderByChild('invitationTime')
      .on('value', snapshot => {
        let activeInvitations = [];
        snapshot.forEach(childSnapshot => {
          const invitationToId = childSnapshot.val().invitationToId;
          const invitationFromEmail = childSnapshot.val().invitationFromEmail;
          const invitationFromId = childSnapshot.val().invitationFromId;
          if (user && user.id !== invitationToId) {
            activeInvitations.push({
              id: childSnapshot.key,
              invitationToId,
              invitationFromEmail,
              invitationFromId,
            });
          }
        });
        setInvitations([...activeInvitations]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb, user]);

  const inviteUser = (invitationToId: string) => {
    // check if invitation exists already
    let invitationExists = false;
    invtiationsRef.once('value', invitations => {
      invitations.forEach(invitation => {
        if (invitationToId === invitation.val().invitationToId
          && user.id === invitation.val().invitationFromId) {
          invitationExists = true;
        }
      })
    });
    if (invitationExists) {
      console.log('Invitation already created!');
      return;
    }

    const newInvite = invtiationsRef.push();
    newInvite.set({
      invitationToId,
      invitationFromEmail: user.email,
      invitationFromId: user.id,
      invitationTime: Date.now(),
    });
  }

  const renderReceivedInvitations = () => {
    if (!invitations.length) return null;
    return invitations
      .map(invitation => {
        return invitationItem(invitation.invitationFromId, invitation.invitationFromEmail);
      })
  }

  const invitationItem = (fromID: string, fromEmail: string) => {
    return (
      <Paper key={fromID}>
        { fromEmail}
      </Paper>
    )
  }

  const renderOnlineUserMails = () => {
    if (!onlineUsers.length) return null;
    return onlineUsers
      .map(onlineUser => {
        return onlinePlayerWithInvite(onlineUser);
      })
  }

  const onlinePlayerWithInvite = (onlineUser: User) => {
    return (
      <Paper key={onlineUser.id}>
        {onlineUser.email}
        <Button
          variant='contained'
          color='primary'
          onClick={() => inviteUser(onlineUser.id)}
        >
          Invite!
        </Button>
      </Paper>
    )
  }

  if (user) {
    return (
      <FreeBoardGamesBar FEATURE_FLAG_readyForDesktopView>
        <SEO
          title={'Play Free Board Games Online'}
          description={
            'Play board games in your browser for free.  Compete against your online friends or play locally.  Free and open-source software project.'
          }
        />
        <Header />
        <p>You're signed in. Email: {user.email}</p>
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
        <p>You have got invitations from:</p>
        {renderReceivedInvitations()}
        <GamesList />
      </FreeBoardGamesBar>
    )
  }

  return (
    <GoToSignInPage />
  )
}

export default Index
