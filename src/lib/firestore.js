import { firestoreDb, firebaseEnabled } from '@/lib/firebase';
import { useFirestoreData } from '@/config/appConfig';

export const firestoreEnabled = firebaseEnabled && useFirestoreData;
export const db = firestoreDb;
