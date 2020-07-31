import React from 'react';
import FirebaseAuth from '../../components/FirebaseAuth/FirebaseAuth';

const Auth = () => {
  return (
    <div>
      <p>Sign in</p>
      <div>
        <FirebaseAuth />
      </div>
    </div>
  )
}

export default Auth;
