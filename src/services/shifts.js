import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const shiftsCollection = collection(db, 'shifts');

/**
 * Obtiene el turno actual abierto (si existe)
 */
export const getCurrentShift = async () => {
  try {
    const snapshot = await getDocs(shiftsCollection);
    const openShift = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find(s => s.status === 'open');
    
    if (!openShift) return null;

    return {
      ...openShift,
      openedAt: openShift.openedAt?.toDate()
    };
  } catch (error) {
    console.error("Error getting current shift:", error);
    throw error;
  }
};

/**
 * Abre una nueva jornada
 */
export const openShift = async (userData) => {
  try {
    const docRef = await addDoc(shiftsCollection, {
      status: 'open',
      openedAt: serverTimestamp(),
      openedBy: userData.email,
      totalRevenue: 0,
      orderCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error opening shift:", error);
    throw error;
  }
};

/**
 * Cierra la jornada actual y guarda el resumen
 */
export const closeShift = async (shiftId, summary) => {
  try {
    const shiftRef = doc(db, 'shifts', shiftId);
    await updateDoc(shiftRef, {
      status: 'closed',
      closedAt: serverTimestamp(),
      ...summary
    });
  } catch (error) {
    console.error("Error closing shift:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de jornadas
 */
export const getShiftsHistory = async () => {
  try {
    const q = query(shiftsCollection, orderBy('openedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      openedAt: doc.data().openedAt?.toDate(),
      closedAt: doc.data().closedAt?.toDate()
    }));
  } catch (error) {
    console.error("Error getting shifts history:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una jornada específica
 */
export const getShiftById = async (shiftId) => {
  try {
    const docRef = doc(db, 'shifts', shiftId);
    const snapshot = await getDocs(query(shiftsCollection)); // Temporary search if doc() reference is direct
    // Since we usually get from shiftsCollection, let's use a simpler approach
    const shiftDoc = snapshot.docs.find(d => d.id === shiftId);
    
    if (!shiftDoc) return null;
    
    const data = shiftDoc.data();
    return {
      id: shiftId,
      ...data,
      openedAt: data.openedAt?.toDate(),
      closedAt: data.closedAt?.toDate()
    };
  } catch (error) {
    console.error("Error getting shift by ID:", error);
    throw error;
  }
};
