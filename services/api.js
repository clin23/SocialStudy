import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

export const api = {
  // Generic CRUD operations
  async getDocument(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  async getCollection(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  },

  async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, data);
      return { id: documentId, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return { id: documentId };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}; 