/**
 * Servicio de almacenamiento local para persistencia del cliente
 */

const KEYS = {
  CART: 'flow_bar_cart',
  ORDERS: 'flow_bar_orders',
};

export const storage = {
  // --- CARRITO ---
  saveCart: (cart) => {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  },

  getCart: () => {
    try {
      const saved = localStorage.getItem(KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
      return [];
    }
  },

  clearCart: () => {
    localStorage.removeItem(KEYS.CART);
  },

  // --- PEDIDOS (HISTORIAL) ---
  addOrderId: (orderId) => {
    try {
      const orders = storage.getOrderIds();
      if (!orders.includes(orderId)) {
        const updated = [orderId, ...orders].slice(0, 50); // Guardamos los últimos 50
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Error adding orderId to localStorage", e);
    }
  },

  getOrderIds: () => {
    try {
      const saved = localStorage.getItem(KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading orderIds from localStorage", e);
      return [];
    }
  }
};
