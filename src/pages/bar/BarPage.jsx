import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Play, 
  Check, 
  ChevronRight,
  LogOut,
  Bell
} from 'lucide-react';
import { subscribeToOrders, updateOrderStatus } from '../../services/orders';
import { logoutUser } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const BarPage = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active'); // active, ready, delivered

  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => {
      // Notificación sonora si entra un pedido nuevo (opcional)
      if (newOrders.length > orders.length) {
        new Audio('/notification.mp3').play().catch(() => {});
      }
      setOrders(newOrders);
    });

    return () => unsubscribe();
  }, [orders.length]);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const statusMap = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'delivered'
    };
    
    const nextStatus = statusMap[currentStatus];
    if (nextStatus) {
      try {
        await updateOrderStatus(orderId, nextStatus);
        showToast(`Pedido actualizado a ${nextStatus}`, 'success');
      } catch (error) {
        showToast("Error al actualizar el estado", "error");
      }
    }
  };

  const activeOrders = orders.filter(o => 
    filter === 'active' ? (o.status === 'pending' || o.status === 'preparing') : o.status === filter
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock };
      case 'preparing': return { label: 'Preparando', color: 'bg-primary/20 text-primary', icon: Play };
      case 'ready': return { label: 'Listo', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 };
      default: return { label: status, color: 'bg-gray-500/20 text-gray-400', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      {/* Header Barra */}
      <header className="px-6 py-6 border-b border-white/5 bg-card/30 flex justify-between items-center sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Bell className="text-white animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Panel de <span className="text-primary">Barra</span></h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{orders.length} Pedidos activos</p>
          </div>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'active' ? 'bg-primary text-white shadow-lg' : 'text-gray-500'}`}
          >
            Activos
          </button>
          <button 
            onClick={() => setFilter('ready')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'ready' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-500'}`}
          >
            Listos
          </button>
        </div>

        <button 
          onClick={logoutUser}
          className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
        >
          <LogOut size={22} />
        </button>
      </header>

      {/* Lista de Comandas */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto flex-1">
        {activeOrders.map((order) => {
          const { label, color, icon: StatusIcon } = getStatusInfo(order.status);
          const timeAgo = order.createdAt ? Math.floor((new Date() - order.createdAt) / 60000) : 0;

          return (
            <div key={order.id} className="bg-card/50 border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl hover:border-white/10 transition-all group">
              {/* Header Comanda */}
              <div className={`p-4 ${color.split(' ')[0]} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <StatusIcon size={18} />
                  <span className="font-black text-xs uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">#{order.id.slice(-4).toUpperCase()}</span>
              </div>

              {/* Items */}
              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white leading-tight text-lg">{item.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-center bg-white text-dark w-12 h-12 rounded-xl shadow-xl transform group-hover:scale-110 transition-transform">
                        <span className="font-black text-xl">{item.quantity || 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Comanda */}
              <div className="p-6 pt-0 border-t border-white/5 mt-auto">
                <div className="flex justify-between items-center py-4 mb-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    <span className="text-xs font-bold">{timeAgo} min</span>
                  </div>
                  <span className="text-xl font-black text-white">${order.total}</span>
                </div>

                <Button 
                  fullWidth 
                  variant={order.status === 'pending' ? 'primary' : order.status === 'preparing' ? 'secondary' : 'primary'}
                  className="py-4 rounded-2xl group/btn"
                  onClick={() => handleStatusUpdate(order.id, order.status)}
                >
                  <span className="uppercase font-black tracking-widest text-xs">
                    {order.status === 'pending' ? 'Empezar' : order.status === 'preparing' ? 'Listo' : 'Entregar'}
                  </span>
                  <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          );
        })}

        {activeOrders.length === 0 && (
          <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 space-y-4 py-32 opacity-30">
            <div className="w-24 h-24 border-4 border-dashed border-gray-600 rounded-full flex items-center justify-center">
              <Clock size={48} />
            </div>
            <p className="font-black uppercase tracking-widest text-sm">Sin comandas activas</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BarPage;
