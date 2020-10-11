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
          const invitationToId = childSnapshot.val().invitationToId;
          const invitationFromEmail = childSnapshot.val().invitationFromEmail;
          const invitationFromId = childSnapshot.val().invitationFromId;
          activeInvitations.push({
            id: childSnapshot.key,
            invitationToId,
            invitationFromEmail,
            invitationFromId,
          });
        });
        setInvitations([...activeInvitations]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb]);

  const inviteUser = (invitationToId: string, invitationFromEmail: string, invitationFromId: string) => {
    // check if invitation exists already
    let invitationExists = false;
    invtiationsRef.once('value', invitations => {
      invitations.forEach(invitation => {
        if (invitationToId === invitation.val().invitationToId
          && invitationFromId === invitation.val().invitationFromId) {
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
      invitationFromEmail,
      invitationFromId,
      invitationTime: Date.now(),
    });
  }

  const renderReceivedInvitations = (authUserId) => {
    if (!invitations.length) return null;
    return invitations
      .filter(invitation => invitation.invitationToId === authUserId)
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

  const renderOnlineUserMails = (authUser) => {
    if (!onlineUsers.length) return null;
    return onlineUsers
      .filter(user => user.id !== authUser.id)
      .map(user => {
        return onlinePlayerWithInvite(user, authUser.email, authUser.id);
      })
  }

  const onlinePlayerWithInvite = (user: User, authUserEmail: string, authUserId: string) => {
    return (
      <Paper key={user.id}>
        { user.email}
        // TODO: should switch to Cancel invite! after pushed
        <Button
          variant='contained'
          color='primary'
          onClick={() => inviteUser(user.id, authUserEmail, authUserId)}
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
        {renderOnlineUserMails(authUser)}
        <p>You have got invitations from:</p>
        {renderReceivedInvitations(authUser.id)}
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
