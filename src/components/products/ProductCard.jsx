import React, { useState, useEffect } from 'react';
import { Plus, Package, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatARS } from '../../utils/format';

const ProductCard = ({ product, onAdd, cartCount = 0 }) => {
  const { name, price, image, category, description } = product;
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Trigger flash effect when adding
  const handleAdd = () => {
    setIsAdding(true);
    onAdd(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      animate={{ 
        borderColor: isAdding ? 'rgba(255, 59, 48, 0.5)' : 'rgba(255, 255, 255, 0.05)',
        boxShadow: isAdding ? '0 0 25px rgba(255, 59, 48, 0.15)' : '0 0 0px rgba(0,0,0,0)'
      }}
      transition={{ duration: 0.4 }}
      className="bg-card/40 backdrop-blur-md border rounded-2xl overflow-hidden group shadow-xl flex flex-col sm:flex-row h-full relative"
    >
      {/* Product Image section - Compact for mobile */}
      <div className="relative w-full sm:w-28 h-36 sm:h-full overflow-hidden bg-white/5 flex-shrink-0">
        {!imgError && product.image ? (
          <img 
            src={product.image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gradient-to-br from-white/5 to-transparent">
            <Package size={24} className="mb-2 opacity-10" />
            <span className="text-[7px] uppercase tracking-[0.2em] font-black opacity-20">No Image</span>
          </div>
        )}
        
        {/* Category Badge - Minimalist */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-dark/80 backdrop-blur-md text-[7px] uppercase tracking-widest border border-white/5 py-0.5 px-2">
            {category}
          </Badge>
        </div>

        {/* Cart Indicator Badge - Animated */}
        <AnimatePresence mode="popLayout">
          {cartCount > 0 && (
            <motion.div 
              key="badge"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 15 }}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20,
                mass: 0.8
              }}
              className="absolute bottom-2 right-2 z-30"
            >
              <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl border-2 border-dark">
                {cartCount}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Info Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-sm font-black text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {name}
          </h3>
          <span className="text-white font-black text-xs italic whitespace-nowrap pt-0.5">
            {formatARS(price)}
          </span>
        </div>
        
        <p className="text-gray-500 text-[9px] line-clamp-1 mb-3 font-medium leading-relaxed opacity-40">
          {description}
        </p>
        
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={handleAdd}
          className={`group/btn py-2.5 rounded-xl border transition-all duration-300 ${
            cartCount > 0 ? 'bg-primary/5 text-primary border-primary/20' : 'border-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={isAdding ? { y: [0, -5, 0], scale: 1.15 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {cartCount > 0 ? <ShoppingCart size={12} /> : <Plus size={14} />}
            </motion.div>
            <span className="text-[9px] uppercase font-black tracking-widest leading-none">
              {cartCount > 0 ? `Llevando (${cartCount})` : 'Añadir'}
            </span>
          </div>
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
