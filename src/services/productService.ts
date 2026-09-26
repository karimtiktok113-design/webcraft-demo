import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  increment,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Product } from '../types';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const COLLECTION_NAME = 'products';

export const productService = {
  // Initialize default catalog into Firestore if empty (admin only write)
  async seedCatalogIfEmpty(isAdminUser?: boolean): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (snap.empty && isAdminUser) {
        for (const prod of DEFAULT_PRODUCTS) {
          await setDoc(doc(db, COLLECTION_NAME, prod.id), prod);
        }
      }
    } catch (err) {
      console.warn('Seeding note:', err);
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (snap.empty) {
        return DEFAULT_PRODUCTS;
      }
      return snap.docs.map(d => d.data() as Product);
    } catch (error) {
      console.warn('getAllProducts note:', error);
      return DEFAULT_PRODUCTS;
    }
  },

  subscribeProducts(callback: (products: Product[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_PRODUCTS);
        } else {
          callback(snapshot.docs.map(d => d.data() as Product));
        }
      },
      (error) => {
        console.warn('Products onSnapshot note, falling back to defaults:', error);
        callback(DEFAULT_PRODUCTS);
      }
    );
  },

  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Product;
      }
      const fallback = DEFAULT_PRODUCTS.find(p => p.id === id);
      return fallback || null;
    } catch {
      const fallback = DEFAULT_PRODUCTS.find(p => p.id === id);
      return fallback || null;
    }
  },

  async saveProduct(product: Product): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, product.id);
    try {
      await setDoc(docRef, product, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${product.id}`);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async incrementViews(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(docRef, { viewsCount: increment(1) });
    } catch {
      // best-effort increment
    }
  },

  async incrementLaunches(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(docRef, { demoLaunchesCount: increment(1) });
    } catch {
      // best-effort increment
    }
  }
};
