import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { getProducts } from '../../services/products';
import { getCategories } from '../../services/categories';
import { createOrder } from '../../services/orders';
import ProductCard from '../../components/products/ProductCard';
import CategoryFilter from '../../components/products/CategoryFilter';
import CartOverlay from '../../components/orders/CartOverlay';
import { getCurrentShift } from '../../services/shifts';
import { useToast } from '../../context/ToastContext';

const MenuPage = () => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [realProducts, setRealProducts] = useState([]);
  const [realCategories, setRealCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState(null);

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

  // Filtrar productos
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
      
      // Obtener el turno actual en el momento de la compra para evitar IDs nulos
      const latestShift = await getCurrentShift();
      const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      
      const orderData = {
        items: cart,
        total,
        clientSource: 'web-mobile',
        shiftId: latestShift?.id || null,
      };

      await createOrder(orderData);
      
      setCart([]);
      setIsCartOpen(false);
      showToast('¡Pedido enviado con éxito! En breve estará listo.', 'success');
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      showToast('Hubo un error al enviar tu pedido. Por favor intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-h-screen text-white pb-32">
      {/* Header Estético */}
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <MapPin size={16} fill="currentColor" />
          <span className="text-xs font-black uppercase tracking-widest">Flow Palermo</span>
        </div>
        <h1 className="text-4xl font-black mb-6">
          ¿Qué vas a <span className="text-primary italic">tomar</span> hoy?
        </h1>

        {/* Barra de Búsqueda Glassmorphism */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Busca tu trago o comida..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="px-6">
        {/* Filtro de Categorías */}
        <CategoryFilter
          categories={realCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Grid de Productos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-primary animate-spin mb-4" size={48} />
            <p className="text-gray-500 font-medium tracking-wide">Cargando menú...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No encontramos lo que buscas...</p>
          </div>
        )}
      </main>

      {/* Overlay de Carrito */}
      <CartOverlay
        cart={cart}
        isOpen={isCartOpen}
        isLoading={loading}
        onClose={() => setIsCartOpen(!isCartOpen)}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default MenuPage;
