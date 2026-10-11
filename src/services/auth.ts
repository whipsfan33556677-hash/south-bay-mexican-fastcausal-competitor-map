import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

/**
 * Access Control List Specification:
 * - loganreese110216@gmail.com
 * - reese.dawn@gmail.com
 * - marcusreese10@gmail.com
 * - any email ending in @qdoba.com
 * - user's own email (whipsfan33556677@gmail.com)
 * - any email matching franchiser-email@example.com or franchiser pattern
 */
export const AUTHORIZED_SPECIFIC_EMAILS = [
  'loganreese110216@gmail.com',
  'reese.dawn@gmail.com',
  'marcusreese10@gmail.com',
  'whipsfan33556677@gmail.com',
  'franchiser-email@example.com',
];

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();

  // 1. Direct match on specific authorized emails
  if (AUTHORIZED_SPECIFIC_EMAILS.some((e) => e.toLowerCase() === normalized)) {
    return true;
  }

  // 2. Any email ending in @qdoba.com
  if (normalized.endsWith('@qdoba.com')) {
    return true;
  }

  // 3. Any franchiser email or domain matching franchis* or qdoba
  const [localPart, domain] = normalized.split('@');
  if (
    domain?.includes('qdoba') ||
    domain?.includes('franchis') ||
    localPart?.includes('franchis') ||
    localPart?.includes('qdoba')
  ) {
    return true;
  }

  return false;
}

export interface AuthUserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  isAuthorized: boolean;
}

// In-memory token & user state cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Custom simulated session for dev preview / quick testing
const SIMULATED_USER_KEY = 'qdoba_acl_simulated_user';

export const getSimulatedUser = (): AuthUserProfile | null => {
  try {
    const raw = sessionStorage.getItem(SIMULATED_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
};

export const setSimulatedUser = (user: AuthUserProfile | null) => {
  try {
    if (user) {
      sessionStorage.setItem(SIMULATED_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SIMULATED_USER_KEY);
    }
  } catch (e) {
    // ignore
  }
};

export const initAuth = (
  onUserChanged: (user: AuthUserProfile | null) => void
) => {
  // Check for simulated session first
  const sim = getSimulatedUser();
  if (sim) {
    onUserChanged(sim);
  }

  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    // If there is an active simulated user, prefer that
    const currentSim = getSimulatedUser();
    if (currentSim) {
      onUserChanged(currentSim);
      return;
    }

    if (firebaseUser && firebaseUser.email) {
      const isAuth = isEmailAuthorized(firebaseUser.email);
      onUserChanged({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        isAuthorized: isAuth,
      });
    } else {
      cachedAccessToken = null;
      onUserChanged(null);
    }
  });
};

/**
 * Real Google Account Sign-In with Firebase Auth Popup
 */
export const signInWithGoogle = async (): Promise<AuthUserProfile> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    const email = result.user.email || '';
    const isAuth = isEmailAuthorized(email);
    const profile: AuthUserProfile = {
      email,
      displayName: result.user.displayName || email.split('@')[0],
      photoURL: result.user.photoURL || undefined,
      isAuthorized: isAuth,
    };

    setSimulatedUser(null);
    return profile;
  } catch (error: any) {
    console.warn('Firebase popup sign-in notice:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out of both Firebase and simulated sessions
 */
export const signOutUser = async () => {
  cachedAccessToken = null;
  setSimulatedUser(null);
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Error signing out:', e);
  }
};
