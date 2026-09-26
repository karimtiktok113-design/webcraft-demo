import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { ActivityLog } from '../types';

const COLLECTION_NAME = 'activityLogs';

export const logService = {
  async recordLog(actorId: string, actorEmail: string, actorRole: string, action: string, details: string): Promise<void> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLog: ActivityLog = {
      id,
      actorId,
      actorEmail,
      actorRole,
      action,
      details,
      timestamp: Date.now()
    };
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), newLog);
    } catch {
      // Best-effort logging to prevent UI crashes if security rules reject
    }
  },

  subscribeLogs(callback: (logs: ActivityLog[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list = snapshot.docs.map(d => d.data() as ActivityLog);
        list.sort((a, b) => b.timestamp - a.timestamp);
        callback(list.slice(0, 100)); // Most recent 100 entries
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );
  }
};
