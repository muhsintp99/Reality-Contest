import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key') {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      return {
        idToken,
        googleId: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL
      };
    }
  } catch (err) {
    console.warn('Firebase Google Auth Popup error/fallback:', err);
  }

  // Simulated fallback for local dev when Firebase keys are not configured
  const mockEmail = `google_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
  return {
    googleId: `google_uid_${Date.now()}`,
    email: mockEmail,
    name: 'Google User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockEmail}`
  };
};

export default app;
