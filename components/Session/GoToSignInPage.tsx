import React from 'react';
import Link from 'next/link';

const GoToSignInPage = () => {
  return (
    <>
      <p>Hi there!</p>
      <p>
        You are not signed in.{' '}
        <Link href={'/auth'}>
          <a>Go to sign in page</a>
        </Link>
      </p>
    </>
  )
}

export default GoToSignInPage;