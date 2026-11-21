import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  getFirestore, collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

export const configured = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('PASTE_') &&
  firebaseConfig.projectId && !firebaseConfig.projectId.includes('PASTE_') &&
  firebaseConfig.appId && !firebaseConfig.appId.includes('PASTE_')
);

export const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = configured ? getAuth(app) : null;
export const db = configured ? getFirestore(app) : null;
export {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp
};

export function friendlyError(error) {
  const code = error?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Wrong email or password. Check the test account credentials.';
  if (code.includes('email-already-in-use')) return 'Account already exists. Use Sign in.';
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.';
  if (code.includes('permission-denied')) return 'Database permission denied. Check firestore.rules and sign-in account.';
  if (code.includes('unavailable')) return 'Cloud unavailable. Check connection and Firestore setup.';
  return error?.message || 'Unexpected error.';
}
