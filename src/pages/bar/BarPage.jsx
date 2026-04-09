import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Play, 
  ChevronRight,
  LogOut,
  Bell,
  AlertCircle,
  Zap,
  Handshake,
  ScanLine
} from 'lucide-react';
import { getOrderById, subscribeToOrders, updateOrderStatus } from '../../services/orders';
import { logoutUser } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import { formatARS } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import OrderScannerModal from '../../components/orders/OrderScannerModal';
import newNotificationSound from '../../assets/sound/new-notification.mp3';

const BarPage = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active'); // active, ready, delivered
  const [now, setNow] = useState(new Date());
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const notificationAudioRef = useRef(null);

  useEffect(() => {
    notificationAudioRef.current = new Audio(newNotificationSound);
    notificationAudioRef.current.preload = 'auto';

    return () => {
      if (notificationAudioRef.current) {
        notificationAudioRef.current.pause();
        notificationAudioRef.current.src = '';
      }
    };
  }, []);

  // Actualizar el "ahora" cada minuto para que los contadores de tiempo se muevan
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => {
      if (newOrders.length > orders.length) {
        const audio = notificationAudioRef.current;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.play().catch((error) => {
            if (error?.name !== 'AbortError') {
              console.warn('No se pudo reproducir el sonido de notificacion:', error?.message || error);
            }
          });
        }
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

  const handleQrDelivery = async (orderId) => {
    const order = await getOrderById(orderId);

    if (!order) {
      throw new Error('No se encontro el pedido escaneado.');
    }

    if (order.status === 'delivered') {
      throw new Error('Ese pedido ya fue entregado.');
    }

    if (order.status !== 'ready') {
      throw new Error('El pedido aun no esta listo para entregar.');
    }

    await updateOrderStatus(order.id, 'delivered');
    showToast(`Pedido #${order.id.slice(-4).toUpperCase()} entregado`, 'success');
    setIsScannerOpen(false);
  };

  const activeOrdersCount = useMemo(() => 
    orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
  , [orders]);

  const activeOrders = orders.filter(o => 
    filter === 'active' ? (o.status === 'pending' || o.status === 'preparing') : o.status === filter
  ).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // Los más viejos primero para el barman

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-500', border: 'border-amber-500/30', icon: Clock, pulse: true };
      case 'preparing': return { label: 'Preparando', color: 'bg-primary/20 text-primary', border: 'border-primary/30', icon: Play, pulse: true };
      case 'ready': return { label: 'Listo', color: 'bg-green-500/20 text-green-500', border: 'border-green-500/30', icon: CheckCircle2, pulse: false };
      default: return { label: status, color: 'bg-gray-500/20 text-gray-400', border: 'border-white/5', icon: Clock, pulse: false };
    }
  };

  const getItemCategoryColor = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('cerveza') || cat.includes('beer')) return 'bg-amber-500';
    if (cat.includes('cocktail') || cat.includes('trago')) return 'bg-purple-500';
    if (cat.includes('food') || cat.includes('comida')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col font-sans">
      {/* Header Barra */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-card/40 px-4 py-4 backdrop-blur-2xl sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 sm:h-14 sm:w-14">
              <Bell className="text-white animate-bounce-slow" size={22} />
            </div>
            {activeOrdersCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-dark bg-white text-[10px] font-black text-dark shadow-lg">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="mb-1 text-xl font-black leading-none tracking-tight sm:text-2xl">Panel de <span className="text-primary italic">Barra</span></h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 sm:text-[10px]">{activeOrdersCount} PEDIDOS EN COLA</p>
            </div>
          </div>
        </div>

          <button
            onClick={logoutUser}
            className="rounded-2xl border border-transparent bg-white/5 p-3 text-gray-400 transition-all hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400 sm:p-4"
            aria-label="Cerrar sesion"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            className="w-full rounded-[1.25rem] border-white/10 bg-white/5 px-5 py-3 sm:w-auto sm:rounded-[1.5rem]"
            onClick={() => setIsScannerOpen(true)}
          >
            <ScanLine size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Escanear QR</span>
          </Button>

          <div className="flex w-full gap-2 overflow-x-auto rounded-[1.5rem] border border-white/5 bg-dark/50 p-1.5 shadow-inner sm:w-auto sm:rounded-[2rem]">
            <button 
              onClick={() => setFilter('active')}
              className={`flex-1 whitespace-nowrap rounded-[1.1rem] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 sm:flex-none sm:rounded-[1.5rem] sm:px-8 sm:text-xs sm:tracking-widest ${filter === 'active' ? 'bg-primary text-white shadow-xl shadow-primary/20 sm:scale-105' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Activos
            </button>
            <button 
              onClick={() => setFilter('ready')}
              className={`flex-1 whitespace-nowrap rounded-[1.1rem] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 sm:flex-none sm:rounded-[1.5rem] sm:px-8 sm:text-xs sm:tracking-widest ${filter === 'ready' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20 sm:scale-105' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Listos
            </button>
          </div>
        </div>
      </header>

      {/* Lista de Comandas */}
      <main className="flex-1 overflow-y-auto bg-dark/20 p-4 sm:p-6 lg:p-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeOrders.map((order) => {
          const { label, color, border, icon: StatusIcon, pulse } = getStatusInfo(order.status);
          
          // Fix Time Logic: Firestore handles Dates/Timestamps differently
          const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
          const timeDiffMs = now - orderDate;
          const timeAgo = order.createdAt ? Math.floor(timeDiffMs / 60000) : 0;
          
          const isStale = timeAgo > 10 && (order.status === 'pending' || order.status === 'preparing');
          const isNew = timeAgo < 2;

          return (
            <div 
              key={order.id} 
              className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-card/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-500 hover:border-white/20 sm:rounded-[2.5rem] ${isStale ? 'border-red-500/30 animate-pulse-slow shadow-red-500/5' : 'border-white/5'}`}
            >
              {/* Indicador de Nuevo Pedido */}
              {isNew && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-[8px] font-black uppercase tracking-tighter text-dark shadow-lg animate-bounce">
                    <Zap size={10} fill="currentColor" /> NUEVO
                  </div>
                </div>
              )}

              {/* Header Comanda */}
              <div className={`relative z-10 flex items-center justify-between overflow-hidden border-b px-4 py-3 sm:px-6 sm:py-4 ${color} ${border}`}>
                <div className="flex items-center gap-3">
                  <div className={pulse ? "animate-pulse" : ""}>
                    <StatusIcon size={20} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">#{order.id.slice(-4).toUpperCase()}</span>
                {/* Visual feedback glow */}
                <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-3xl opacity-20 ${color.split(' ')[0]}`} />
              </div>

              {/* Items */}
              <div className="relative z-10 flex-1 space-y-4 p-4 sm:p-6">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="group/item flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:bg-white/[0.07] sm:rounded-3xl sm:p-4">
                      <div className="flex gap-4 items-center">
                        <div className={`w-1.5 h-10 rounded-full ${getItemCategoryColor(item.category)} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                        <div className="flex flex-col">
                          <span className="text-base font-black leading-tight text-white transition-colors group-hover:text-primary sm:text-lg">{item.name}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{item.category}</span>
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-dark shadow-2xl transition-transform group-hover/item:rotate-6 sm:h-14 sm:w-14 sm:rounded-[1.25rem]">
                        <span className="text-xl font-black sm:text-2xl">{item.quantity || 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Comanda */}
              <div className="relative z-10 mt-auto p-4 pt-0 sm:p-8 sm:pt-0">
                <div className="flex justify-between items-center py-5 border-t border-white/5">
                  <div className={`flex items-center gap-2 ${isStale ? 'text-red-400' : 'text-gray-500'}`}>
                    {isStale ? <AlertCircle size={16} /> : <Clock size={16} />}
                    <span className={`text-xs font-black uppercase ${isStale ? 'animate-pulse' : ''}`}>
                      {timeAgo < 0 ? 'Ahora' : `${timeAgo} min`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest -mb-1">Total Pedido</span>
                    <span className="text-xl font-black text-white italic">{formatARS(order.total)}</span>
                  </div>
                </div>

                <Button 
                  fullWidth 
                  variant={order.status === 'pending' ? 'primary' : order.status === 'preparing' ? 'secondary' : 'primary'}
                  className={`group/btn transform rounded-2xl py-4 active:scale-95 shadow-xl transition-all duration-300 sm:py-5 ${isStale ? 'shadow-red-500/10' : ''}`}
                  onClick={() => handleStatusUpdate(order.id, order.status)}
                >
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' ? <Play size={16} fill="currentColor" /> : 
                     order.status === 'preparing' ? <CheckCircle2 size={16} /> : 
                     <Handshake size={18} />}
                    <span className="uppercase font-black tracking-widest text-xs">
                      {order.status === 'pending' ? 'Empezar' : order.status === 'preparing' ? 'Listo' : 'Entregar'}
                    </span>
                  </div>
                  <ChevronRight size={20} className="group-hover/btn:translate-x-1.5 transition-transform" />
                </Button>
              </div>
            </div>
          );
        })}

        {activeOrders.length === 0 && (
          <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-600 space-y-6 py-48">
            <div className="w-32 h-32 border-4 border-dashed border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
              <Clock size={56} className="text-white/5" />
            </div>
            <div className="text-center">
              <p className="font-black uppercase tracking-[0.3em] text-white/20 text-sm">Sin comandas activas</p>
              <p className="text-[10px] text-white/10 font-bold uppercase mt-2 italic">Esperando nuevos pedidos...</p>
            </div>
          </div>
        )}
      </main>

      <OrderScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQrDelivery}
      />
    </div>
  );
};

export default BarPage;
