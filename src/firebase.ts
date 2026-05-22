import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, serverTimestamp, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CartItem } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
export const auth = getAuth();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Utility for authenticating user and ensuring profile exists
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Attempt to create user profile if it doesn't exist
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDocFromServer(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      if (err.code !== 'permission-denied') {
         // Profile creation might fail if rules limit it and it already exists, which is fine, 
         // but log other errors.
         console.warn("Could not fetch/create user profile:", err);
      }
    }
    return user;
  } catch (error) {
    console.error("Login with Google failed", error);
    throw error;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

export async function fetchUserOrders() {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'orders'), where('userId', '==', auth.currentUser.uid));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  }
}

export async function createOrder(amount: number, currencyCode: string, items: CartItem[], email: string, reference: string) {
  if (!auth.currentUser) throw new Error("Must be logged in to create an order");
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      userId: auth.currentUser.uid,
      email,
      amount,
      currency: currencyCode,
      items: items.map(i => ({...i})),
      status: 'completed',
      reference,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const docRef = await addDoc(collection(db, 'subscribers'), {
      email,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'subscribers');
  }
}
