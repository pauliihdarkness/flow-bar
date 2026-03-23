import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className={`
      relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl 
      animate-toast-in
      ${bgColors[type]}
    `}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-bold text-white leading-tight">
        {message}
      </p>
      <button 
        onClick={onClose}
        className="text-white/40 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>
      
      {/* Progress Bar timer effect (visual only) */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/10 rounded-full overflow-hidden w-full">
        <div className={`h-full animate-toast-progress ${
          type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`} />
      </div>
    </div>
  );
};

export default Toast;
