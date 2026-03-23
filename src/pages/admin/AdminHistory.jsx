import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Loader2, 
  ChevronRight,
  Filter,
  Package
} from 'lucide-react';
import { getAllOrders } from '../../services/orders';
import Badge from '../../components/ui/Badge';

const AdminHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white">Historial</h2>
          <p className="text-gray-500">Registro completo de transacciones</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por ID o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3 focus:outline-none focus:border-primary/50 text-sm font-medium w-64 md:w-80"
          />
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-primary animate-spin" size={48} />
        </div>
      ) : (
        <div className="bg-card/30 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Fecha</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">ID Pedido</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Items</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Total</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">
                      {order.createdAt?.toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">
                      {order.createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/5 px-2 py-1 rounded-lg text-[10px] text-gray-400">
                          {item.name} {item.quantity > 1 ? ` (x${item.quantity})` : ''}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white">${order.total}</span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-500 font-medium italic">
                    No se encontraron pedidos en el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'delivered': return <Badge variant="primary" className="uppercase text-[10px] bg-green-500/10 text-green-500 border-green-500/20">Entregado</Badge>;
    case 'pending': return <Badge variant="secondary" className="uppercase text-[10px]">Pendiente</Badge>;
    case 'preparing': return <Badge variant="secondary" className="uppercase text-[10px] bg-primary/10 text-primary border-primary/20">Preparando</Badge>;
    case 'ready': return <Badge variant="primary" className="uppercase text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">Listo</Badge>;
    case 'canceled': return <Badge variant="gray" className="uppercase text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Cancelado</Badge>;
    default: return <Badge variant="gray" className="uppercase text-[10px]">{status}</Badge>;
  }
};

export default AdminHistory;
