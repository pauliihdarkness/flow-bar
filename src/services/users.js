import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

export const getStaff = async () => {
  const q = query(collection(db, USERS_COLLECTION), where('role', 'in', ['admin', 'barman']));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateUserRole = async (userId, newRole) => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, { role: newRole });
};
