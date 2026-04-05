import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBIpzS1srfCXPCn0Z21fZ2AbpZHh0rsfY4",
  authDomain: "gaz-tzmi-606ab.firebaseapp.com",
  projectId: "gaz-tzmi-606ab",
  storageBucket: "gaz-tzmi-606ab.firebasestorage.app",
  messagingSenderId: "828719977700",
  appId: "1:828719977700:web:06c789b03369053f9208f1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
