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
  apiKey: 'AIzaSyCQGoZzlG256V4IruJAtB7TaB8hAojcNxE',
  authDomain: 'laofi-d1191.firebaseapp.com',
  projectId: 'laofi-d1191',
  storageBucket: 'laofi-d1191.appspot.com',
  messagingSenderId: '575738894689',
  appId: '1:575738894689:web:95fbc9017799730c890d20',
  databaseURL:
    'https://laofi-d1191-default-rtdb.asia-southeast1.firebasedatabase.app',
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
