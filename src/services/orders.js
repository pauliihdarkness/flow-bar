import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

const ordersCollection = collection(db, 'orders');

/**
 * Crea un nuevo pedido en Firestore
 */
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Suscribe a los pedidos activos (pendientes, en preparación, listos)
 * @param {Function} callback Función que recibe la lista de pedidos actualizada
 * @returns {Function} Función para cancelar la suscripción (unsubscribe)
 */
export const subscribeToOrders = (callback) => {
  const q = query(
    ordersCollection, 
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      .filter(order => ['pending', 'preparing', 'ready'].includes(order.status));
    callback(orders);
  });
};

/**
 * Actualiza el estado de un pedido
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Obtiene todos los pedidos históricos para estadísticas
 */
export const getAllOrders = async () => {
  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
