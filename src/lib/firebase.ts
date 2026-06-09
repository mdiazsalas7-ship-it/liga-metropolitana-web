// Conexión solo-lectura al Firestore de la Liga Metropolitana Eje Este.
// Las credenciales son públicas (Firebase espera que estén expuestas en el cliente).
// La protección de escritura está en las Security Rules de Firestore.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAM1IP1iFrWgxvtaskzu40GdNI6cIP5oS8',
  authDomain:        'liga-de-san-mateo.firebaseapp.com',
  projectId:         'liga-de-san-mateo',
  storageBucket:     'liga-de-san-mateo.firebasestorage.app',
  messagingSenderId: '71674005364',
  appId:             '1:71674005364:web:6d6e93746ac430b77c4e21',
};

let app: FirebaseApp;
let _db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}
