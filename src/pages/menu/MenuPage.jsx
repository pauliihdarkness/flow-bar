import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Loader2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../../services/products';
import { getCategories } from '../../services/categories';
import { createOrder } from '../../services/orders';
import ProductCard from '../../components/products/ProductCard';
import CategoryFilter from '../../components/products/CategoryFilter';
import CartOverlay from '../../components/orders/CartOverlay';
import { getCurrentShift } from '../../services/shifts';
import { useToast } from '../../context/ToastContext';

import { storage } from '../../services/storage';
import { subscribeToMyOrders } from '../../services/orders';
import OrderHistory from '../../components/orders/OrderHistory';

const MenuPage = () => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => storage.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [realProducts, setRealProducts] = useState([]);
  const [realCategories, setRealCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState(null);
  
  // Real-time local order tracking
  const [localOrderIds, setLocalOrderIds] = useState(() => storage.getOrderIds());
  const [myOrders, setMyOrders] = useState([]);

  // Sync cart to localStorage
  useEffect(() => {
    storage.saveCart(cart);
  }, [cart]);

  // Subscribe to local orders for real-time status
  useEffect(() => {
    if (localOrderIds.length > 0) {
      const unsubscribe = subscribeToMyOrders(localOrderIds, (ordersData) => {
        setMyOrders(ordersData);
        
        // Show notification if an order becomes ready
        const justReady = ordersData.find(o => o.status === 'ready');
        const prevReady = myOrders.find(o => o.status === 'ready' && o.id === justReady?.id);
        if (justReady && !prevReady) {
          showToast(`¡Tu pedido #${justReady.id.slice(-4).toUpperCase()} está listo! 🍹`, 'success');
        }
      });
      return () => unsubscribe();
    }
  }, [localOrderIds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, shiftData] = await Promise.all([
          getProducts(),
          getCategories(),
          getCurrentShift()
        ]);
        setRealProducts(productsData);
        setRealCategories(categoriesData);
        setCurrentShift(shiftData);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return realProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, realProducts]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => (item.id || item.name) === (product.id || product.name));
      if (existing) {
        return prev.map(item => 
          (item.id || item.name) === (product.id || product.name) 
            ? { ...item, quantity: (item.quantity || 1) + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => {
      const newCart = [...prev];
      const item = newCart[index];
      if (item.quantity > 1) {
        newCart[index] = { ...item, quantity: item.quantity - 1 };
        return newCart;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;
    try {
      setLoading(true);
      const latestShift = await getCurrentShift();
      const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      
      const orderData = {
        items: cart,
        total,
        clientSource: 'web-mobile',
        shiftId: latestShift?.id || null,
      };

      const orderId = await createOrder(orderData);
      
      // TRIGGER SUCCESS FEEDBACK
      setIsOrderSuccess(true);
      setLoading(false);

      // Wait 2s for the animation before cleaning up
      setTimeout(() => {
        storage.addOrderId(orderId);
        storage.clearCart();
        setCart([]);
        setLocalOrderIds(storage.getOrderIds());
        setIsCartOpen(false);
        setIsOrderSuccess(false);
        showToast('¡Pedido enviado con éxito! 🍹', 'success');
      }, 2500);

    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      showToast('Hubo un error al enviar tu pedido.', 'error');
      setLoading(false);
    }
  };

  const getCartCount = (product) => {
    const item = cart.find(i => (i.id || i.name) === (product.id || product.name));
    return item ? item.quantity : 0;
  };

  const activeOrdersCount = myOrders.filter(o => o.status !== 'delivered').length;

  return (
    <div className="bg-dark min-h-screen text-white pb-32">
      {/* Sticky Top Header - Optimized for space */}
      <div className="sticky top-0 z-50 bg-dark/90 backdrop-blur-3xl border-b border-white/5 pt-4 px-6 pb-2">
        <header className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-black leading-tight">
              Menu <span className="text-primary italic">Digital</span>
            </h1>
            <div className="flex items-center gap-1.5 text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <MapPin size={10} fill="currentColor" className="text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.1em]">Palermo</span>
            </div>
          </div>

          <div className="relative group mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="¿Qué vas a tomar hoy?"
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-xs placeholder:text-gray-700 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <CategoryFilter
            categories={realCategories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </header>
      </div>

      <main className="px-6 mt-8 max-w-xl mx-auto">
        <AnimatePresence mode='wait'>
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <Loader2 className="text-primary animate-spin mb-4" size={40} />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Cargando la carta...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onAdd={addToCart}
                    cartCount={getCartCount(product)}
                  />
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-24 px-10 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-sm mb-2">No hay resultados</p>
                  <p className="text-[10px] text-gray-700 px-6">Prueba con otra categoría o busca algo diferente.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating History Button */}
      {localOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className={`w-14 h-14 bg-dark/80 backdrop-blur-xl border rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 group relative ${
              activeOrdersCount > 0 ? 'border-primary/50 shadow-[0_0_15px_rgba(255,59,48,0.2)]' : 'border-white/10 hover:bg-white/10'
            }`}
          >
            <History size={24} className={`text-white transition-opacity ${activeOrdersCount > 0 ? 'opacity-100 animate-pulse' : 'opacity-40 group-hover:opacity-100'}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-dark">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      )}

      <OrderHistory 
        orders={myOrders}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <CartOverlay
        cart={cart}
        isOpen={isCartOpen}
        isLoading={loading}
        isSuccess={isOrderSuccess}
        onClose={() => setIsCartOpen(!isCartOpen)}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default MenuPage;
