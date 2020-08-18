import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import cookies from 'js-cookie'
import firebase from 'firebase/app'
import 'firebase/auth'
import initFirebase from '../auth/initFirebase'

initFirebase();

const useUser = () => {
  const [user, setUser] = useState();
  const router = useRouter();
  const firebaseDb = firebase.database();

  const logout = async () => {
    console.log('logout user', user);
    const uUid = user.id;
    return firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        cookies.remove('auth')
        firebaseDb.ref('users/' + uUid).update({
          online: false,
        })
        setUser()
        router.push('/auth')
      })
      .catch((e) => {
        console.error(e)
      })
  }

  useEffect(() => {
    const cookie = cookies.get('auth')
    if (!cookie) {
      router.push('/')
      return
    }
    setUser(JSON.parse(cookie))
  }, [])

  return { user, logout }
}

export { useUser }
