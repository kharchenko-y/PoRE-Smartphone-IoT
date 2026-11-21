import {
  configured, auth, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, friendlyError
} from './firebase-client.js';

const $ = (id) => document.getElementById(id);
export function setupAuth(onUserChanged) {
  const authPanel = $('authPanel');
  const appPanel = $('appPanel');
  const authMessage = $('authMessage');
  const authForm = $('authForm');
  const registerButton = $('registerButton');
  const submitButton = $('submitButton');
  const logoutButton = $('logoutButton');

  if (!configured) {
    authMessage.textContent = 'Firebase not configured. Paste your Web app config into firebase-config.js.';
    submitButton.disabled = true;
    registerButton.disabled = true;
    return;
  }

  let pending = false;
  const busy = (flag) => {
    pending = flag;
    submitButton.disabled = flag;
    registerButton.disabled = flag;
  };

  async function enter(mode) {
    if (pending) return;
    const email = $('email').value.trim();
    const password = $('password').value;
    if (!email || !password) {
      authMessage.textContent = 'Enter email and password.';
      return;
    }
    busy(true);
    authMessage.textContent = mode === 'register' ? 'Creating account...' : 'Signing in...';
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      authMessage.textContent = '';
      $('password').value = '';
    } catch (error) {
      authMessage.textContent = friendlyError(error);
    } finally {
      busy(false);
    }
  }

  authForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void enter('signin');
  });
  registerButton.addEventListener('click', () => void enter('register'));
  logoutButton.addEventListener('click', async () => {
    try { await signOut(auth); }
    catch (error) { authMessage.textContent = friendlyError(error); }
  });

  onAuthStateChanged(auth, (user) => {
    authPanel.hidden = Boolean(user);
    appPanel.hidden = !user;
    if (user) $('signedInAs').textContent = user.email || 'Authenticated user';
    onUserChanged(user);
  }, (error) => {
    authMessage.textContent = friendlyError(error);
  });
}
