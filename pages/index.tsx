import React from 'react';
import FreeBoardGamesBar from 'components/App/FreeBoardGamesBar';
import Header from 'components/Header';
import { GamesList } from 'components/App/GamesList';
import SEO from 'components/SEO';
import Link from 'next/link';
import useSWR from 'swr';
import { useUser } from '../utils/auth/useUser';

const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json());


const Index = () => {
  const { user, logout } = useUser();
  // const { data, error } = useSWR(
  //   user ? ['/api/getFood', user.token] : null,
  //   fetcher
  // )
  if (!user) {
    return (
      <>
        <p>Hi there!</p>
        <p>
          You are not signed in.{' '}
          <Link href={'/auth'}>
            <a>Sign in</a>
          </Link>
        </p>
      </>
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
      <GamesList />
    </FreeBoardGamesBar>
  )
}

export default Index
