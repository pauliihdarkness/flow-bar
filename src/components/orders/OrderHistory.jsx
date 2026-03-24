import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, CheckCircle2, Handshake, Package, ChevronRight, History, X, Ticket } from 'lucide-react';
import { formatARS } from '../../utils/format';

const OrderStatusBadge = ({ status }) => {
  const configs = {
    pending: { label: 'En Cola', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    preparing: { label: 'Preparando', icon: Flame, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    ready: { label: '¡Listo!', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    delivered: { label: 'Entregado', icon: Handshake, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20' },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${config.bg} ${config.color} text-[8px] font-black uppercase tracking-widest`}>
      <Icon size={10} className={status === 'preparing' ? 'animate-pulse' : ''} />
      <span>{config.label}</span>
    </div>
  );
};

const OrderHistory = ({ orders, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOrderClick = (orderId) => {
    onClose();
    navigate(`/menu/order/${orderId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[70] bg-dark/95 backdrop-blur-2xl flex flex-col p-6 h-full w-full"
    >
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white leading-none mb-1.5 flex items-center gap-3">
            Mis<span className="text-primary italic">Pedidos</span>
            <History className="text-primary/40" size={20} />
          </h2>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">HISTORIAL LOCAL (ESTA SESIÓN)</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-90"
        >
          <X className="text-white" size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20 scale-90">
            <Package size={60} className="mb-4" />
            <p className="font-black text-xs uppercase tracking-[0.3em]">No hay pedidos recientes</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleOrderClick(order.id)}
              className="bg-white/5 border border-white/10 p-5 rounded-[2rem] group cursor-pointer hover:bg-white/10 hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Ticket size={10} /> ID: {order.id.slice(-6).toUpperCase()}
                  </p>
                  <div className="flex gap-2 flex-wrap items-center">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">
                      Hace {Math.floor((Date.now() - (order.createdAt?.getTime() || Date.now())) / 60000)} min
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-black text-xl italic tracking-tighter leading-none">{formatARS(order.total)}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-gray-400 group-hover:text-gray-300 transition-colors">
                    <span className="font-bold truncate pr-4">{item.quantity}x {item.name}</span>
                    <span className="flex-shrink-0 font-black italic opacity-60">{formatARS(item.price * (item.quantity || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Ver Comprobante</span>
                <ChevronRight size={14} className="text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 shrink-0">
        <p className="text-[9px] text-gray-600 text-center uppercase font-black tracking-[0.2em] leading-relaxed italic">
          ¡Gracias por elegir Flow Bar!<br/>Tu orden se está preparando en este momento.
        </p>
      </div>
    </motion.div>
  );
};

export default OrderHistory;
