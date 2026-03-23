import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  History as HistoryIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { getCurrentShift, openShift, closeShift, getShiftsHistory } from '../../services/shifts';
import { getAllOrders } from '../../services/orders';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';

const AdminShifts = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentShift, setCurrentShift] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shiftOrders, setShiftOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shift, shiftsHistory] = await Promise.all([
        getCurrentShift(),
        getShiftsHistory()
      ]);
      setCurrentShift(shift);
      setHistory(shiftsHistory);

      if (shift) {
        const allOrders = await getAllOrders();
        const activeOrders = allOrders.filter(o => o.shiftId === shift.id);
        setShiftOrders(activeOrders);
      }
    } catch (error) {
      console.error("Error fetching shift data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async () => {
    setProcessing(true);
    try {
      await openShift(user);
      showToast("Jornada iniciada correctamente", "success");
      fetchData(); // No await here or wait after toast
    } catch (error) {
      showToast("Error al abrir caja", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseShift = async () => {
    if (!window.confirm("¿Estás seguro de cerrar la caja actual? No se podrán recibir más pedidos hasta abrir una nueva.")) return;
    
    setProcessing(true);
    try {
      const deliveredOrders = shiftOrders.filter(o => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      const summary = {
        totalRevenue,
        orderCount: shiftOrders.length,
        deliveredCount: deliveredOrders.length
      };

      await closeShift(currentShift.id, summary);
      showToast("Caja cerrada. Resumen guardado en el historial.", "success");
      fetchData();
    } catch (error) {
      showToast("Error al cerrar caja", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-white">Control de Caja</h2>
        <p className="text-gray-500">Gestión de jornadas y turnos de trabajo</p>
      </header>

      {/* Estado de Caja Actual */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-10 border transition-all duration-500 ${
        currentShift 
          ? 'bg-primary/10 border-primary/20 shadow-2xl shadow-primary/10' 
          : 'bg-card/30 border-white/5'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
              currentShift ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'
            }`}>
              {currentShift ? <Unlock size={32} /> : <Lock size={32} />}
            </div>
            <div>
              <h3 className="text-2xl font-black mb-1">
                {currentShift ? 'Caja Abierta' : 'Caja Cerrada'}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {currentShift 
                  ? `Iniciada por ${currentShift.openedBy} el ${currentShift.openedAt?.toLocaleString()}` 
                  : 'No hay una jornada activa en este momento.'}
              </p>
            </div>
          </div>

          <button
            onClick={currentShift ? handleCloseShift : handleOpenShift}
            disabled={processing}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              currentShift 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                : 'bg-primary text-white hover:scale-105 active:scale-95'
            }`}
          >
            {processing ? <Loader2 className="animate-spin" size={20} /> : (currentShift ? <Lock size={20} /> : <Unlock size={20} />)}
            {currentShift ? 'Cerrar Jornada' : 'Abrir Nueva Jornada'}
          </button>
        </div>

        {/* Decoraciones de fondo */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full transition-all duration-1000 ${
          currentShift ? 'bg-primary/20 translate-x-32 -translate-y-32' : 'bg-white/5'
        }`} />
      </div>

      {currentShift && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/30 border border-white/5 p-8 rounded-[2rem]">
            <p className="text-gray-500 text-xs font-black uppercase mb-2">Ventas del Turno</p>
            <p className="text-3xl font-black">${shiftOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)}</p>
          </div>
          <div className="bg-card/30 border border-white/5 p-8 rounded-[2rem]">
            <p className="text-gray-500 text-xs font-black uppercase mb-2">Pedidos Totales</p>
            <p className="text-3xl font-black">{shiftOrders.length}</p>
          </div>
          <div className="bg-card/30 border border-white/5 p-8 rounded-[2rem]">
            <p className="text-gray-500 text-xs font-black uppercase mb-2">Tiempo Transcurrido</p>
            <p className="text-3xl font-black flex items-center gap-2">
              <Clock className="text-primary" size={24} />
              {Math.floor((new Date() - currentShift.openedAt) / (1000 * 60 * 60))}h {Math.floor(((new Date() - currentShift.openedAt) / (1000 * 60)) % 60)}m
            </p>
          </div>
        </div>
      )}

      {/* Historial de Jornadas */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <HistoryIcon className="text-primary" size={22} />
          Historial de Cierres
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.filter(h => h.status === 'closed').map((shift) => (
            <div key={shift.id} className="bg-card/30 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all flex items-center justify-between group">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                  {shift.openedAt?.toLocaleDateString()}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">${shift.totalRevenue || 0}</span>
                  <span className="text-xs text-gray-500">• {shift.orderCount || 0} pedidos</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Abrió: {shift.openedBy}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-all">
                <ChevronRight className="text-gray-500 group-hover:text-primary" size={20} />
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-500 py-10 col-span-full italic">No hay registros de jornadas anteriores.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShifts;
