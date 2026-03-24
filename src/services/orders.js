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
  getDocs,
  documentId
} from 'firebase/firestore';

// ... existing code ...

/**
 * Suscribe a una lista específica de IDs de pedidos (Historial Local)
 */
export const subscribeToMyOrders = (orderIds, callback) => {
  if (!orderIds || orderIds.length === 0) {
    callback([]);
    return () => {};
  }

  // Firestore "in" query limited to 10 items
  const idsToTrack = orderIds.slice(0, 10);
  
  const q = query(
    ordersCollection,
    where(documentId(), 'in', idsToTrack)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    // Devolvemos ordenados por fecha de creación (los más recientes primero)
    callback(orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  });
};
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

/**
 * Obtiene los pedidos asociados a una jornada específica
 */
export const getOrdersByShiftId = async (shiftId) => {
  try {
    // Quitamos el orderBy de aquí para evitar el error de índice compuesto en Firebase
    const q = query(ordersCollection, where('shiftId', '==', shiftId));
    const snapshot = await getDocs(q);
    
    // Mapeamos y ordenamos en memoria
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Orden descendente por fecha
  } catch (error) {
    console.error("Error fetching orders by shift ID:", error);
    throw error;
  }
};

/**
 * Obtiene un solo pedido por su ID
 */
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const q = query(ordersCollection, where(documentId(), '==', orderId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return {
      id: docData.id,
      ...docData.data(),
      createdAt: docData.data().createdAt?.toDate()
    };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};

/**
 * Se suscribe a los cambios de un solo pedido en tiempo real
 */
export const subscribeToOrder = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId);
  return onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate()
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error subscribing to order:", error);
    callback(null);
  });
};
