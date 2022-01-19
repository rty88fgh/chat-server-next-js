import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase"
import Login from './login';
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if(user){
      const userDoc = doc(db, "users", user.uid);
      setDoc(userDoc, {
          email: user.email,
          lastSeen: serverTimestamp(),
          photoURL: user.photoURL
        },{ merge: true })
      .catch(_ => console.log(_));
    }
  }, [user])

  if(user) return <Component {...pageProps} />;

  return (<Login />);
}

export default MyApp
