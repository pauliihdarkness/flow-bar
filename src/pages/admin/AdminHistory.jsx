import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Loader2, 
  ChevronRight,
  Filter,
  Package,
  Calendar,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { getAllOrders } from '../../services/orders';
import { getShiftsHistory } from '../../services/shifts';
import Badge from '../../components/ui/Badge';
import { formatARS } from '../../utils/format';

const AdminHistory = () => {
  const [orders, setOrders] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, shiftsData] = await Promise.all([
        getAllOrders(),
        getShiftsHistory()
      ]);
      setOrders(ordersData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  // Agrupar pedidos por jornada
  const groupedShifts = useMemo(() => {
    const groups = shifts.map(shift => ({
      ...shift,
      orders: filteredOrders.filter(o => o.shiftId === shift.id)
    })).filter(group => group.orders.length > 0 || searchTerm === '');

    // Pedidos sin jornada asignada
    const shiftIds = new Set(shifts.map(s => s.id));
    const looseOrders = filteredOrders.filter(o => !o.shiftId || !shiftIds.has(o.shiftId));

    if (looseOrders.length > 0) {
      groups.push({
        id: 'external',
        openedBy: 'Operaciones Externas',
        openedAt: null,
        totalRevenue: looseOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        status: 'unknown',
        orders: looseOrders
      });
    }

    return groups.sort((a, b) => (b.openedAt || 0) - (a.openedAt || 0));
  }, [shifts, filteredOrders, searchTerm]);

  return (
    <div className="space-y-10 pb-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white leading-tight">Historial General</h2>
          <p className="text-gray-500 font-medium">Registro completo organizado por jornadas</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por ID o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-primary/50 text-sm font-medium w-full md:w-96 transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-primary animate-spin" size={48} />
        </div>
      ) : (
        <div className="space-y-12">
          {groupedShifts.map((group) => (
            <section key={group.id} className="space-y-6">
              {/* Header de la Jornada */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${group.id === 'external' ? 'bg-gray-500/10 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">
                      {group.openedAt ? group.openedAt.toLocaleDateString() : 'Jornada Externa'}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      {group.openedBy} {group.closedAt ? `• Cerrada el ${group.closedAt.toLocaleDateString()}` : group.status === 'open' ? '• EN CURSO' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-0.5">Ventas</p>
                    <p className="text-sm font-black text-white">{formatARS(group.orders.reduce((sum, o) => sum + (o.total || 0), 0))}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-0.5">Pedidos</p>
                    <p className="text-sm font-black text-white">{group.orders.length}</p>
                  </div>
                </div>
              </div>

              {/* Tabla de Pedidos */}
              <div className="bg-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Hora</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">ID Pedido</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Productos</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Total</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {group.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-all group">
                          <td className="px-8 py-6 font-bold text-gray-400">
                            {order.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-mono text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">#{order.id.slice(-6).toUpperCase()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {order.items?.map((item, idx) => (
                                <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-[10px] text-gray-400 font-medium">
                                  {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-6 font-black text-white">{formatARS(order.total)}</td>
                          <td className="px-8 py-6 text-right">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ))}

          {groupedShifts.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 bg-white/5 rounded-full text-gray-600">
                <ShoppingBag size={48} />
              </div>
              <div>
                <p className="text-xl font-black text-white">Sin resultados</p>
                <p className="text-gray-500 max-w-xs">No encontramos pedidos que coincidan con tu búsqueda en ninguna jornada.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'delivered': return <Badge variant="primary" className="uppercase text-[9px] font-black bg-green-500/10 text-green-500 border-green-500/20 px-3">Entregado</Badge>;
    case 'pending': return <Badge variant="secondary" className="uppercase text-[9px] font-black px-3">Pendiente</Badge>;
    case 'preparing': return <Badge variant="secondary" className="uppercase text-[9px] font-black bg-primary/10 text-primary border-primary/20 px-3">Preparando</Badge>;
    case 'ready': return <Badge variant="primary" className="uppercase text-[9px] font-black bg-blue-500/10 text-blue-500 border-blue-500/20 px-3">Listo</Badge>;
    case 'canceled': return <Badge variant="gray" className="uppercase text-[9px] font-black bg-red-500/10 text-red-500 border-red-500/20 px-3">Cancelado</Badge>;
    default: return <Badge variant="gray" className="uppercase text-[9px] font-black px-3">{status}</Badge>;
  }
};

export default AdminHistory;
