import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { getAllOrders } from '../../services/orders';
import { getCurrentShift } from '../../services/shifts';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentShift, setCurrentShift] = useState(null);
  const [filterByShift, setFilterByShift] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, shiftData] = await Promise.all([
          getAllOrders(),
          getCurrentShift()
        ]);
        setOrders(ordersData);
        setCurrentShift(shiftData);
        if (shiftData) setFilterByShift(true);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    let filteredOrders = orders;
    if (filterByShift && currentShift) {
      filteredOrders = orders.filter(o => o.shiftId === currentShift.id);
    }

    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    
    // Calcular productos más vendidos
    const productCounts = {};
    deliveredOrders.forEach(order => {
      order.items?.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + 1;
      });
    });
    
    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      topProducts,
      displayOrders: filteredOrders
    };
  }, [orders, filterByShift, currentShift]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Dashboard</h2>
          <p className="text-gray-500">Resumen de actividad y rendimiento</p>
        </div>
        
        {currentShift && (
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setFilterByShift(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!filterByShift ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              VISTA GLOBAL
            </button>
            <button
              onClick={() => setFilterByShift(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterByShift ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              JORNADA ACTUAL
            </button>
          </div>
        )}
      </header>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Recaudación Total" 
          value={`$${stats.totalRevenue}`} 
          icon={DollarSign} 
          trend="+12%" 
          positive={true} 
        />
        <StatCard 
          title="Pedidos Totales" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend="+5%" 
          positive={true} 
        />
        <StatCard 
          title="Pedidos Activos" 
          value={stats.pendingOrders} 
          icon={TrendingUp} 
          trend="En curso" 
          positive={true} 
        />
        <StatCard 
          title="Ticket Promedio" 
          value={`$${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0}`} 
          icon={ArrowUpRight} 
          trend="Estable" 
          positive={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Productos Estrella */}
        <div className="lg:col-span-2 bg-card/30 border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            Productos Estrella
          </h3>
          <div className="space-y-4">
            {stats.topProducts.map(([name, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-bold">{name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">{count} ventas</span>
                  <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(count / stats.topProducts[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-center text-gray-500 py-10">Aún no hay ventas entregadas para mostrar.</p>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-card/30 border border-white/5 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Últimos Movimientos
          </h3>
          <div className="space-y-6">
            {stats.displayOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  order.status === 'delivered' ? 'bg-green-500' : 
                  order.status === 'canceled' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    Pedido #{order.id.slice(-4).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-black">
                    {order.status} • ${order.total}
                  </p>
                </div>
              </div>
            ))}
            {stats.displayOrders.length === 0 && (
              <p className="text-center text-gray-500 py-10">Sin actividad en este periodo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, positive }) => (
  <div className="bg-card/30 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-all">
        <Icon className="text-gray-400 group-hover:text-primary transition-all" size={24} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

export default AdminDashboard;
