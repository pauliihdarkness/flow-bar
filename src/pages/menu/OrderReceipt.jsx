import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Flame, CheckCircle2, Handshake, Printer, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToOrder } from '../../services/orders';
import { formatARS } from '../../utils/format';
import { buildOrderQrValue } from '../../utils/qr';
import Button from '../../components/ui/Button';

const statusLabels = {
  pending: 'Aceptado por el bar',
  preparing: 'Preparando tus bebidas',
  ready: '¡Acércate a la barra!',
  delivered: 'Pedido Entregado'
};

const OrderStatusStep = ({ active, completed, label, icon: Icon, color }) => (
  <div 
    role="listitem"
    aria-label={`${label}: ${active ? 'completado' : 'pendiente'}`}
    className={`flex flex-col items-center gap-2 ${active ? color : 'opacity-20'}`}
  >
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${active ? 'border-current shadow-[0_0_15px_rgba(255,59,48,0.15)]' : 'border-white/10'}`}>
      <Icon size={20} aria-hidden="true" />
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

const OrderReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToOrder(id, (orderData) => {
      setOrder(orderData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6" role="status" aria-label="Cargando comprobante">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" aria-hidden="true" />
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-4">Buscando Comprobante...</p>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center" role="alert">
        <h1 className="text-2xl font-black text-white mb-4">COMPROBANTE NO ENCONTRADO</h1>
        <p className="text-gray-500 text-xs mb-6">El pedido que buscas no existe o fue eliminado.</p>
        <Button onClick={() => navigate('/menu')} aria-label="Volver al menú principal">Volver al Menú</Button>
      </div>
    );
  }

  const statusMap = { pending: 1, preparing: 2, ready: 3, delivered: 4 };
  const currentStep = statusMap[order.status] || 1;

  const handlePrint = () => window.print();
  const handleShare = async () => {
    try {
      await navigator.share?.({ title: `Flow Bar - Pedido #${order.id.slice(-6)}`, url: window.location.href });
    } catch { /* User cancelled share */ }
  };

  return (
    <main className="min-h-screen bg-dark pb-12 overflow-x-hidden" aria-label="Comprobante de pedido">
      
      {/* Navigation - Hidden on print */}
      <nav className="no-print p-6 flex items-center justify-between max-w-lg mx-auto" aria-label="Navegación del comprobante">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/menu')}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white"
          aria-label="Volver al menú"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </motion.button>
        <div className="text-right">
          <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest leading-none mb-1">ID Único</p>
          <p className="text-white font-black text-sm tracking-tighter uppercase" aria-label={`Identificador de pedido: ${order.id.slice(-8)}`}>
            {order.id.slice(-8)}
          </p>
        </div>
      </nav>

      <div className="px-6 max-w-lg mx-auto">
        
        {/* Progress Tracker - Hidden on print */}
        <section className="no-print bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 mb-6" aria-label="Estado del pedido">
          <div className="flex justify-between items-start relative" role="list" aria-label="Pasos del pedido">
            {/* Progress Line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 -z-10" aria-hidden="true">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep - 1) * 33}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-primary shadow-[0_0_10px_#ff3b30]"
              />
            </div>
            
            <OrderStatusStep active={currentStep >= 1} label="En Cola" icon={Clock} color="text-amber-400" />
            <OrderStatusStep active={currentStep >= 2} label="Cocina" icon={Flame} color="text-purple-400" />
            <OrderStatusStep active={currentStep >= 3} label="Listo" icon={CheckCircle2} color="text-emerald-400" />
            <OrderStatusStep active={currentStep >= 4} label="Entregado" icon={Handshake} color="text-gray-400" />
          </div>

          <div className="mt-8 text-center bg-white/[0.02] border border-white/5 py-4 rounded-2xl" role="status" aria-live="polite">
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Estado de tu Orden</p>
            <h2 className="text-xl font-black text-white italic">
              {statusLabels[order.status]}
            </h2>
          </div>
        </section>

        {/* The Receipt (Ticket) - THIS IS WHAT PRINTS */}
        <motion.article 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
          aria-label="Ticket de compra"
        >
          <div className="print-ticket bg-white text-dark p-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <header className="text-center border-b-2 border-dashed border-dark/20 pb-6 mb-6">
              <h1 className="text-3xl font-black tracking-tighter mb-1">FLOW BAR <span className="text-primary italic">®</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-dark/60">Ticket de Consumición Digital</p>
              <time className="text-[9px] font-black text-dark/40 mt-2 block" dateTime={order.createdAt?.toISOString()}>
                {order.createdAt?.toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}
              </time>
              <p className="text-[8px] font-bold text-dark/30 mt-1">ID: {order.id.slice(-8).toUpperCase()}</p>
              
              {/* Print-only status */}
              <p className="hidden print:block text-xs font-black mt-3 uppercase">
                Estado: {statusLabels[order.status]}
              </p>
            </header>

            <section className="border-b-2 border-dashed border-dark/20 pb-6 mb-6 text-center">
              <div className="inline-flex p-4 border border-dark/10 rounded-[2rem] bg-white shadow-sm">
                <QRCodeSVG
                  value={buildOrderQrValue(order.id)}
                  size={172}
                  bgColor="#ffffff"
                  fgColor="#121212"
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-dark/40 mt-4">Presenta este QR en barra</p>
              <p className="text-[10px] font-bold text-dark/60 mt-1">Se valida solo cuando tu pedido estA listo para entregar.</p>
            </section>

            {/* Items table */}
            <table className="w-full mb-8" aria-label="Detalle de productos">
              <thead>
                <tr className="text-[10px] font-black uppercase text-dark/40 tracking-widest">
                  <th className="text-left pb-3">Descripción</th>
                  <th className="text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-dark/5">
                    <td className="py-2.5">
                      <div className="flex gap-2 items-start">
                        <span className="font-black text-primary italic shrink-0">{item.quantity}x</span>
                        <div>
                          <p className="font-black text-xs leading-tight uppercase">{item.name}</p>
                          <p className="text-[9px] text-dark/40 font-bold mt-0.5">c/u {formatARS(item.price)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-black text-sm italic align-top py-2.5">
                      {formatARS(item.price * (item.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-6">
                    <p className="text-[9px] font-black text-dark/50 uppercase tracking-widest">Total</p>
                    <p className="text-dark/40 text-[8px] font-bold">Impuestos Incluidos</p>
                  </td>
                  <td className="text-right pt-6">
                    <p className="text-3xl font-black tracking-tighter italic leading-none">{formatARS(order.total)}</p>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Decorative Ticket Bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between h-4 overflow-hidden translate-y-1/2 no-print" aria-hidden="true">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-dark rounded-full shrink-0 -translate-y-1/2" />
              ))}
            </div>
          </div>
          
          {/* CRT Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-dark rounded-xl no-print" aria-hidden="true" />
        </motion.article>

        {/* Action Buttons - Hidden on print */}
        <div className="no-print grid grid-cols-2 gap-4 mt-8">
          <Button variant="secondary" className="bg-white/5 border-white/10" onClick={handlePrint} aria-label="Imprimir comprobante">
            <Printer size={16} className="mr-2" aria-hidden="true" /> <span className="text-[10px] font-black uppercase">Imprimir</span>
          </Button>
          <Button variant="secondary" className="bg-white/5 border-white/10" onClick={handleShare} aria-label="Compartir comprobante">
            <Share2 size={16} className="mr-2" aria-hidden="true" /> <span className="text-[10px] font-black uppercase">Compartir</span>
          </Button>
        </div>

        <p className="no-print text-center text-gray-700 text-[8px] font-black uppercase tracking-[0.3em] mt-12 leading-loose">
          Este es un comprobante electrónico válido.<br/>Sigue el progreso en tiempo real.<br/>¡Gracias por tu visita!
        </p>
      </div>
    </main>
  );
};

export default OrderReceipt;
