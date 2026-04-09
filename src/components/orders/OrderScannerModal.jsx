import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Loader2, ScanLine, X } from 'lucide-react';
import Button from '../ui/Button';
import { parseOrderQrValue } from '../../utils/qr';

const SCANNER_ELEMENT_ID = 'order-qr-reader';

const OrderScannerModal = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef(null);
  const isHandlingScanRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isCancelled = false;
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    const handleDecodedValue = async (decodedText) => {
      if (isHandlingScanRef.current) {
        return;
      }

      const orderId = parseOrderQrValue(decodedText);
      if (!orderId) {
        setError('El QR escaneado no corresponde a un pedido valido.');
        return;
      }

      isHandlingScanRef.current = true;
      setStatus('processing');
      setError('');

      try {
        await onScan(orderId);
      } catch (scanError) {
        setError(scanError.message || 'No se pudo validar el pedido escaneado.');
        setStatus('ready');
        isHandlingScanRef.current = false;
      }
    };

    const startScanner = async () => {
      try {
        setStatus('starting');
        setError('');

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          handleDecodedValue,
          () => {}
        );

        if (!isCancelled) {
          setStatus('ready');
        }
      } catch (scannerError) {
        if (!isCancelled) {
          setStatus('error');
          setError('No se pudo iniciar la camara. Usa el ingreso manual como respaldo.');
        }
      }
    };

    startScanner();

    return () => {
      isCancelled = true;
      isHandlingScanRef.current = false;
      setStatus('idle');
      setError('');
      setManualValue('');

      const activeScanner = scannerRef.current;
      scannerRef.current = null;

      if (activeScanner) {
        activeScanner.stop().catch(() => {}).finally(() => {
          activeScanner.clear().catch(() => {});
        });
      }
    };
  }, [isOpen, onScan]);

  if (!isOpen) {
    return null;
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault();

    const orderId = parseOrderQrValue(manualValue);
    if (!orderId) {
      setError('Ingresa un codigo de pedido valido.');
      return;
    }

    try {
      setStatus('processing');
      setError('');
      await onScan(orderId);
    } catch (scanError) {
      setError(scanError.message || 'No se pudo validar el pedido ingresado.');
      setStatus('ready');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-card/95 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-2xl bg-white/5 p-3 text-gray-400 transition-colors hover:text-white"
          aria-label="Cerrar escaner"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-start gap-4 pr-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <ScanLine size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Escanear pedido</h2>
            <p className="mt-1 text-sm text-gray-400">Lee el QR del comprobante para validar que el pedido este listo y entregarlo.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/5 bg-dark/60 p-4">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-white/10 bg-black/30">
              <div id={SCANNER_ELEMENT_ID} className="min-h-[320px] w-full" />
              {status === 'starting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-dark/85 text-white">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Iniciando camara</p>
                </div>
              )}
              {status === 'processing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-dark/85 text-white">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Validando pedido</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                <Camera size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Lectura en vivo</p>
                <p className="text-sm font-semibold text-white">Apunta al QR del ticket del cliente</p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                Ingreso manual
              </label>
              <input
                type="text"
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                placeholder="flowbar:order:abc123 o ID del pedido"
                className="w-full rounded-2xl border border-white/10 bg-dark/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
              />
              <Button fullWidth type="submit" disabled={status === 'processing'}>
                Validar pedido
              </Button>
            </form>

            <p className="text-xs leading-relaxed text-gray-500">
              Solo se entregan pedidos en estado listo. Si el QR no abre camara en desktop, usa el codigo manual del ticket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScannerModal;