/* eslint-disable @typescript-eslint/no-inferrable-types */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  addDoc,
} from 'firebase/firestore';

const initialized = initializeApp({
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_ID,
  appId: process.env.FB_APP_ID,
  databaseURL: process.env.FB_DATABASE_URL,
});

const db = getFirestore(initialized);

export class RealTimeNotifications<
  T extends Record<string, any> = Record<string, any>,
> {
  public id: string = '';
  public db: string = 'notifications';
  public lastPage: QuerySnapshot<DocumentData> | undefined;

  constructor(id: string) {
    this.id = id;
  }

  public async sendData(data: T): Promise<void> {
    try {
      await addDoc(collection(db, this.db), {
        user: this.id,
        ...data,
        created: Timestamp.now().toMillis(),
      });
    } catch (e) {
      console.log(e);
    }
  }
}
