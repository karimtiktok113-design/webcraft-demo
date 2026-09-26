import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { AccessRequest, RequestStatus } from '../types';
import { sessionService } from './sessionService';

const COLLECTION_NAME = 'accessRequests';

export const requestService = {
  async submitRequest(request: Omit<AccessRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReq: AccessRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), newReq);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  subscribeClientRequests(clientId: string, callback: (requests: AccessRequest[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const all = snapshot.docs.map(d => d.data() as AccessRequest);
        const filtered = all.filter(r => r.clientId === clientId).sort((a, b) => b.createdAt - a.createdAt);
        callback(filtered);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );
  },

  subscribeAllRequests(callback: (requests: AccessRequest[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const all = snapshot.docs.map(d => d.data() as AccessRequest);
        all.sort((a, b) => b.createdAt - a.createdAt);
        callback(all);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );
  },

  async resolveRequest(requestId: string, status: RequestStatus, adminNotes?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, requestId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const req = snap.data() as AccessRequest;

      await updateDoc(docRef, {
        status,
        adminNotes: adminNotes || '',
        resolvedAt: Date.now()
      });

      // If approved time extension, automatically extend the client's session in Firestore!
      if (status === 'approved' && req.requestType === 'time_extension' && req.requestedMinutes) {
        await sessionService.extendSessionTime(req.clientId, req.requestedMinutes);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${requestId}`);
    }
  },

  async updateRequestStatus(requestId: string, status: RequestStatus, adminNotes?: string): Promise<void> {
    return this.resolveRequest(requestId, status, adminNotes);
  },

  async deleteRequestsForClient(clientId: string): Promise<void> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);
      const matches = snap.docs.filter(d => d.data()?.clientId === clientId);
      for (const d of matches) {
        await deleteDoc(d.ref);
      }
    } catch (error) {
      console.warn('deleteRequestsForClient note:', error);
    }
  }
};
