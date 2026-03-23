import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

const CATEGORIES_COLLECTION = 'categories';

export const getCategories = async () => {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addCategory = async (name) => {
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    name,
    slug
  });
  return docRef.id;
};

export const updateCategory = async (id, name) => {
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, { name, slug });
};

export const deleteCategory = async (id) => {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
};
