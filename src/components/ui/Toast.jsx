import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" size={18} />,
    error: <AlertCircle className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" size={18} />,
    info: <Info className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" size={18} />,
  };

  const statusColors = {
    success: 'border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
    error: 'border-rose-500/30 text-rose-400 shadow-rose-500/10',
    info: 'border-sky-500/30 text-sky-400 shadow-sky-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden flex items-center gap-3.5 p-4 rounded-2xl border backdrop-blur-3xl shadow-2xl 
        bg-dark/60 group
        ${statusColors[type]}
      `}
    >
      {/* Subtle CRT Scanline Highlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-50" />
      
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-0 blur-md opacity-20 bg-current" />
        {icons[type]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.15em] leading-tight text-white/90">
          {message}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="p-1.5 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-90"
      >
        <X size={14} />
      </button>
      
      {/* Progress Bar timer effect (CRT Loader style) */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-white/5 w-full">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 3, ease: 'linear' }}
          className={`h-full shadow-[0_0_8px_rgba(255,255,255,0.2)] ${
            type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
          }`} 
        />
      </div>
    </motion.div>
  );
};

export default Toast;
