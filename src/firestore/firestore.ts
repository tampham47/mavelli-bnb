// @ts-nocheck
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../mavelli-bnb-firebase-adminsdk-7ief1-2786e26626.json';

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export const StrategyCollection = db.collection('strategies');
