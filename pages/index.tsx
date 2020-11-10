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
  invitationToEmail: string,
  invitationFromEmail: string,
  invitationFromId: string,
  invitationTime: number,
}

const Index = () => {
  const { logout, user } = useUser();
  const [onlineUsers, setOnlineUsers] = useState([] as User[]);
  const [userInvitedBy, setUserInvitedBy] = useState([] as Invitation[]);
  const [invitedByUser, setInvitedByUser] = useState([] as Invitation[]);

  const firebaseDb = firebase.database();
  const usersRef = firebaseDb.ref('users');
  const invtiationsRef = firebaseDb.ref('invitations');

  // get online users
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

  // get active invitations, set userInvitedBy, invitedByUser
  useEffect(() => {
    const listener = invtiationsRef
      .orderByChild('invitationTime')
      .on('value', snapshot => {
        let userInvitationsBy = [];
        let invitationsByUser = [];
        snapshot.forEach(childSnapshot => {
          const invitationToId = childSnapshot.val().invitationToId;
          const invitationToEmail = childSnapshot.val().invitationToEmail;
          const invitationFromEmail = childSnapshot.val().invitationFromEmail;
          const invitationFromId = childSnapshot.val().invitationFromId;
          if (user && user.id === invitationToId) {
            userInvitationsBy.push({
              id: childSnapshot.key,
              invitationToId,
              invitationToEmail,
              invitationFromEmail,
              invitationFromId,
            });
          }
          if (user && user.id === invitationFromId) {
            invitationsByUser.push({
              id: childSnapshot.key,
              invitationToId,
              invitationToEmail,
              invitationFromEmail,
              invitationFromId,
            });
          }
        });
        setUserInvitedBy([...userInvitationsBy]);
        setInvitedByUser([...invitationsByUser]);
      });
    return () => usersRef.off('value', listener);
  }, [firebaseDb, user]);

  // not used at the moment
  const getUserData = async (uid) => {
    let user;
    firebaseDb.ref('users/' + uid).once("value", snap => {
      user = {
        email: snap.val().email,
        online: snap.val().online,
      }
    })
    return user;
  }

  const inviteUser = (invitationToId: string, invitationToEmail: string) => {
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
      invitationToEmail,
      invitationFromEmail: user.email,
      invitationFromId: user.id,
      invitationTime: Date.now(),
    });
  }

  const renderUserInvitedBy = () => {
    if (!userInvitedBy.length) return null;
    return userInvitedBy
      .map(invitation => {
        return invitationItem(invitation.invitationFromId, invitation.invitationFromEmail);
      })
  }

  const renderInvitedByUser = () => {
    if (!invitedByUser.length) return null;
    return invitedByUser
      .map(invitation => {
        return invitationItem(invitation.invitationToId, invitation.invitationToEmail);
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
          onClick={() => inviteUser(onlineUser.id, onlineUser.email)}
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
        {renderUserInvitedBy()}
        <p>You have invited:</p>
        {renderInvitedByUser()}
        <GamesList />
      </FreeBoardGamesBar>
    )
  }

  return (
    <GoToSignInPage />
  )
}

export default Index
