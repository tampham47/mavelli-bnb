import { Strategy } from '../strategies';
import { StrategyCollection } from './firestore';

export type FirebaseStrategy = Partial<Strategy>;

export const fetchStrategies = async (): Promise<FirebaseStrategy[]> => {
  return StrategyCollection.get().then((resp: any) => {
    return resp.docs.map((i: any) => i.data());
  });
};

export const onDataChange = (callback: (v: FirebaseStrategy[]) => void) => {
  const q = StrategyCollection;
  return q.onSnapshot((sn: any) => {
    const list = sn.docChanges().map((i: any) => i.doc.data());
    callback(list);
  });
};
