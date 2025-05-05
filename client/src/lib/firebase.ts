import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async (usePopup = false) => {
  try {
    if (usePopup) {
      return await signInWithPopup(auth, googleProvider);
    } else {
      return await signInWithRedirect(auth, googleProvider);
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Login com email e senha
export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email/password", error);
    throw error;
  }
};

// Registrar um novo usuário com email e senha (apenas para uso administrativo)
export const registerWithEmailPassword = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error registering with email/password", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const getRedirectResponse = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.error("Error getting redirect result", error);
    throw error;
  }
};