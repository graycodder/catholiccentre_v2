import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDlbw6ioFQCxSYZXt7VDjCWbXO5UJIziw8",
  authDomain: "catholiccentreweb.firebaseapp.com",
  projectId: "catholiccentreweb",
  storageBucket: "catholiccentreweb.firebasestorage.app",
  messagingSenderId: "591783524020",
  appId: "1:591783524020:web:7c3fdb6ad55dfd7685c9e1",
  measurementId: "G-XGGHMKMTSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances
export const auth = getAuth(app);
export const db = getDatabase(app, "https://catholiccentreweb-default-rtdb.asia-southeast1.firebasedatabase.app/");
export const storage = getStorage(app);
export default app;
