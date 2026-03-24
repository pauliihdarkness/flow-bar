import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShoppingBag, 
  User, 
  History,
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import { getShiftById } from '../../services/shifts';
import { getOrdersByShiftId } from '../../services/orders';
import Badge from '../../components/ui/Badge';
import { formatARS } from '../../utils/format';

const ShiftDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftData, ordersData] = await Promise.all([
        getShiftById(id),
        getOrdersByShiftId(id)
      ]);
      setShift(shiftData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching shift details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="text-primary animate-spin" size={48} />
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header con navegación de vuelta */}
      <header className="flex flex-col gap-6">
        <button 
          onClick={() => navigate('/admin/shifts')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group w-fit"
        >
          <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Volver a Jornadas</span>
        </button>

        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-white">Detalles de Jornada</h2>
              <Badge variant="primary" className="uppercase text-[10px] bg-primary/10 text-primary border-primary/20">
                Resumen Final
              </Badge>
            </div>
            <p className="text-gray-500 font-medium">Análisis detallado de ventas y operaciones</p>
          </div>
          
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">RESPONSABLE</p>
              <p className="font-bold text-white text-sm">{shift?.openedBy}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Stats de la Jornada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Recaudación Total" 
          value={formatARS(shift?.totalRevenue)} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Pedidos Totales" 
          value={orders.length} 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Apertura" 
          value={shift?.openedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
          icon={Clock} 
        />
        <StatCard 
          title="Cierre" 
          value={shift?.closedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
          icon={Calendar} 
        />
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 px-2">
          <History className="text-primary" size={20} />
          Desglose de Pedidos
        </h3>
        
        <div className="bg-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Hora</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">ID</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Productos</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-6 text-sm text-gray-400 font-medium">
                    {order.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-400 font-bold">
                          {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-white">
                    {formatARS(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-card/30 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group relative overflow-hidden">
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
      <Icon size={120} />
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-all">
        <Icon className="text-gray-400 group-hover:text-primary transition-all" size={24} />
      </div>
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">{title}</p>
    <p className="text-2xl font-black text-white tracking-tight relative z-10">{value}</p>
  </div>
);

export default ShiftDetails;
