import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  const icons = {
    warning: <AlertCircle className="text-primary" size={48} />,
    success: <CheckCircle2 className="text-green-500" size={48} />,
    error: <XCircle className="text-red-500" size={48} />,
    info: <Info className="text-secondary" size={48} />
  };

  const colors = {
    warning: 'border-primary/20 bg-primary/5',
    success: 'border-green-500/20 bg-green-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    info: 'border-secondary/20 bg-secondary/5'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl ${colors[type]}`}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon Container */}
              <div className="p-4 rounded-3xl bg-white/5 shadow-inner">
                {icons[type]}
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full gap-4 pt-4">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={onClose}
                >
                  {cancelText}
                </Button>
                <Button 
                  variant={type === 'error' || type === 'warning' ? 'primary' : 'secondary'} 
                  fullWidth 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {confirmText}
                </Button>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[60px] rounded-full" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
