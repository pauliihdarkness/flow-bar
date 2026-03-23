import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, X, Package } from 'lucide-react';
import Button from '../ui/Button';

const CartItem = ({ item, onRemove, idx }) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex justify-between items-center group">
      <div className="flex gap-4 items-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center text-gray-500 flex-shrink-0">
            {!imgError && item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <Package size={24} className="opacity-20" />
            )}
          </div>
          {item.quantity > 1 && (
            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
              {item.quantity}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">{item.name}</h4>
          <p className="text-primary font-bold">${item.price}</p>
        </div>
      </div>
      <button 
        onClick={() => onRemove(idx)}
        className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
      >
        <X size={20} />
      </button>
    </div>
  );
};

const CartOverlay = ({ cart, onRemove, onCheckout, isOpen, onClose, isLoading }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Floating Mini Cart */}
        <div className="bg-primary hover:bg-red-600 text-white rounded-3xl p-5 shadow-2xl shadow-primary/40 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 group" onClick={onClose}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="font-bold text-lg leading-none mb-1">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </p>
              <p className="text-white/80 text-sm font-medium">Ver detalles</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-2xl font-black">${total}</p>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Expandable Cart View (Optional/Modal style) */}
        {isOpen && (
          <div className="fixed inset-0 bg-dark/95 backdrop-blur-2xl z-[60] flex flex-col p-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">Tu Pedido</h2>
              <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.map((item, idx) => (
                <CartItem key={idx} item={item} onRemove={onRemove} idx={idx} />
              ))}
            </div>

            <div className="pt-8 border-t border-white/10 mt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-medium">Total a pagar</span>
                <span className="text-4xl font-black text-white">${total}</span>
              </div>
              <Button variant="primary" fullWidth onClick={onCheckout} className="py-5 text-xl">
                Continuar al Pago
                <ChevronRight size={24} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOverlay;
