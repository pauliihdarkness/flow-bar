import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, X, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { formatARS } from '../../utils/format';

const CartItem = ({ item, onRemove, idx }) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 group hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 items-center min-w-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center text-gray-500 flex-shrink-0 shadow-inner">
            {!imgError && item.image ? (
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <Package size={20} className="opacity-20" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-[15px] leading-tight mb-1">{item.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest">{item.quantity || 1} x {formatARS(item.price)}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => onRemove(idx)}
          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none italic">Subtotal</span>
        <span className="text-primary font-black text-base italic leading-none">{formatARS(item.price * (item.quantity || 1))}</span>
      </div>
    </div>
  );
};

const CartOverlay = ({ cart, onRemove, onCheckout, isOpen, onClose, isLoading, isSuccess }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (itemCount === 0 && !isSuccess) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Floating Mini Cart */}
        <AnimatePresence mode="wait">
          {!isOpen && itemCount > 0 && (
            <motion.div 
              key="mini-cart"
              initial={{ scale: 0.9, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 25,
                mass: 0.5
              }}
              className="bg-primary hover:bg-red-600 text-white rounded-full py-3 px-4 shadow-2xl shadow-primary/40 flex items-center justify-between cursor-pointer transition-colors duration-300 group border border-white/10" 
              onClick={onClose}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="bg-white/20 p-1.5 rounded-lg shadow-inner group-hover:rotate-6 transition-transform flex-shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-[11px] leading-tight truncate uppercase tracking-tight">
                    <motion.span
                      key={itemCount}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="inline-block"
                    >
                      {itemCount}
                    </motion.span> {itemCount === 1 ? 'Producto' : 'Productos'}
                  </p>
                  <p className="text-white/60 text-[8px] font-black uppercase tracking-widest leading-none">Ver Pedido</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <p className="text-base font-black italic tracking-tighter">{formatARS(total)}</p>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform opacity-40" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Cart View / Success Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 bg-dark/98 backdrop-blur-3xl z-[60] flex flex-col p-6 pointer-events-auto h-full w-full"
            >
              {isSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <CheckCircle2 size={100} className="text-primary relative z-10" />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-black text-white mb-2"
                  >
                    ¡PEDIDO <span className="text-primary italic">RECIBIDO</span>!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] max-w-[200px] leading-relaxed"
                  >
                    Estamos cocinando tu orden. Revisa el historial para ver el estado.
                  </motion.p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                      <h2 className="text-2xl font-black text-white leading-none mb-1.5">Tu <span className="text-primary italic">Pedido</span></h2>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">{itemCount} ARTÍCULOS</p>
                      </div>
                    </div>
                    <button 
                      onClick={onClose} 
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
                    >
                      <X size={22} className="text-white" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {cart.map((item, idx) => (
                      <CartItem key={idx} item={item} onRemove={onRemove} idx={idx} />
                    ))}
                  </div>

                  <div className="pt-8 border-t border-white/10 mt-6 shrink-0">
                    <div className="px-2 mb-8">
                      <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.2em] mb-2 text-right">Impuestos Incluidos</p>
                      <div className="flex justify-between items-baseline gap-4">
                        <p className="text-white/40 font-black text-xs uppercase tracking-widest leading-none">Total del Pedido</p>
                        <div className="text-right flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary italic opacity-70">$</span>
                          <span className="text-4xl font-black text-primary italic tracking-tighter leading-none">{total.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="primary" 
                      fullWidth 
                      onClick={onCheckout} 
                      className="py-5 text-base rounded-2xl shadow-xl shadow-primary/20 group/go"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <>
                          <span className="uppercase font-black tracking-widest text-sm">Finalizar Pedido</span>
                          <ChevronRight size={20} className="group-hover/go:translate-x-2 transition-transform ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartOverlay;
