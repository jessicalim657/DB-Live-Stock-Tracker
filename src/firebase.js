import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/*
  Fill these in with your own project's values.

  How to get them (all free, ~5 minutes):
  1. Go to https://console.firebase.google.com and sign in with any Google account.
  2. Click "Add project", give it a name (e.g. "dental-boutique-stock"), and
     accept the defaults through setup.
  3. On your new project's overview page, click the "</>" (web) icon to
     register a web app. Give it any nickname.
  4. Firebase will show you a `firebaseConfig` object exactly like the shape
     below -- copy each value into the matching field here.
  5. In the left sidebar, go to Build -> Firestore Database -> "Create database".
     Choose a region close to you, and start in "test mode" for now (we'll
     tighten security once the beta is working).

  These values are safe to leave in your code -- they identify your project,
  they are not secret passwords.
*/
const firebaseConfig = {
  apiKey: "AIzaSyACSsRVfu3Fib_5hbGLZ1D2uxejUi9cu3M",
  authDomain: "db-inventory-stock-tracker.firebaseapp.com",
  projectId: "db-inventory-stock-tracker",
  storageBucket: "db-inventory-stock-tracker.firebasestorage.app",
  messagingSenderId: "359853729507",
  appId: "1:359853729507:web:6ecd179d42723520d587d6",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
