import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, Loader2, RefreshCcw, ScanLine, X } from 'lucide-react';
import Button from '../ui/Button';
import { parseOrderQrValue } from '../../utils/qr';

const SCANNER_ELEMENT_ID = 'order-qr-reader';
const INVALID_QR_FEEDBACK_COOLDOWN_MS = 1600;

const REAR_CAMERA_LABEL_PATTERN = /back|rear|environment|trasera|posterior|externa/i;

const getPreferredCameraId = (cameras = [], selectedCameraId) => {
    if (!cameras.length) {
        return null;
    }

    if (selectedCameraId && cameras.some((camera) => camera.id === selectedCameraId)) {
        return selectedCameraId;
    }

    const rearCamera = cameras.find((camera) => REAR_CAMERA_LABEL_PATTERN.test(camera.label || ''));
    if (rearCamera) {
        return rearCamera.id;
    }

    return cameras[0].id;
};

const disposeScanner = async (scanner) => {
    if (!scanner) {
        return;
    }

    try {
        const state = scanner.getState();

        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
            await scanner.stop();
        }
    } catch {
        // Ignoramos errores de carrera al cerrar en desarrollo con Strict Mode.
    }

    try {
        scanner.clear();
    } catch {
        // clear() falla si el DOM ya no esta disponible o si el scanner no llego a montar.
    }
};

const OrderScannerModal = ({ isOpen, onClose, onScan }) => {
    const scannerRef = useRef(null);
    const isHandlingScanRef = useRef(false);
    const invalidScanFeedbackAtRef = useRef(0);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [manualValue, setManualValue] = useState('');
    const [isMobileLayout, setIsMobileLayout] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(max-width: 768px)').matches;
    });
    const [retryToken, setRetryToken] = useState(0);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleLayoutChange = () => setIsMobileLayout(mediaQuery.matches);

        handleLayoutChange();
        mediaQuery.addEventListener('change', handleLayoutChange);

        return () => {
            mediaQuery.removeEventListener('change', handleLayoutChange);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        let isCancelled = false;
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;
        setStatus('starting');
        setError('');
        setManualValue('');
        isHandlingScanRef.current = false;
        invalidScanFeedbackAtRef.current = 0;

        const viewportMinSide = typeof window === 'undefined' ? 360 : Math.min(window.innerWidth, window.innerHeight);
        const mobileQrBoxSize = Math.max(180, Math.min(300, Math.round(viewportMinSide * 0.62)));
        const scannerConfig = {
            fps: isMobileLayout ? 14 : 10,
            qrbox: {
                width: isMobileLayout ? mobileQrBoxSize : 220,
                height: isMobileLayout ? mobileQrBoxSize : 220,
            },
            aspectRatio: isMobileLayout ? 1 : 1,
            disableFlip: false,
        };

        const handleDecodedValue = async (decodedText) => {
            if (isHandlingScanRef.current) {
                return;
            }

            const orderId = parseOrderQrValue(decodedText);
            if (!orderId) {
                const now = Date.now();

                if (now - invalidScanFeedbackAtRef.current > INVALID_QR_FEEDBACK_COOLDOWN_MS) {
                    setError('QR invalido. Apunta al codigo del ticket de Flow Bar.');
                    invalidScanFeedbackAtRef.current = now;
                }

                return;
            }

            isHandlingScanRef.current = true;
            setStatus('processing');
            setError('');

            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                navigator.vibrate(35);
            }

            try {
                await onScan(orderId);
            } catch (scanError) {
                setError(scanError.message || 'No se pudo validar el pedido escaneado.');
                setStatus('ready');
                isHandlingScanRef.current = false;
            }
        };

        const startScanner = async () => {
            let startError = null;

            try {
                let preferredCameraId = selectedCameraId;

                try {
                    const cameras = await Html5Qrcode.getCameras();
                    const preferredId = getPreferredCameraId(cameras, selectedCameraId);

                    if (!isCancelled) {
                        setAvailableCameras(cameras);

                        if (preferredId && preferredId !== selectedCameraId) {
                            setSelectedCameraId(preferredId);
                        }
                    }

                    preferredCameraId = preferredId;
                } catch {
                    // Algunos navegadores no exponen la lista sin permiso previo.
                }

                const cameraFallbackChain = [
                    preferredCameraId,
                    { facingMode: { exact: 'environment' } },
                    { facingMode: 'environment' },
                    { facingMode: 'user' },
                ].filter(Boolean);

                for (const cameraConfig of cameraFallbackChain) {
                    try {
                        await scanner.start(
                            cameraConfig,
                            scannerConfig,
                            handleDecodedValue,
                            () => { }
                        );

                        startError = null;
                        break;
                    } catch (candidateError) {
                        startError = candidateError;
                    }
                }

                if (startError) {
                    throw startError;
                }

                if (isCancelled) {
                    await disposeScanner(scanner);
                    return;
                }

                if (!isCancelled) {
                    setStatus('ready');
                }
            } catch (scannerError) {
                if (!isCancelled) {
                    setStatus('error');
                    setError('No se pudo iniciar la camara. Reintenta o usa el ingreso manual.');
                }
            }
        };

        startScanner();

        return () => {
            isCancelled = true;
            isHandlingScanRef.current = false;

            const activeScanner = scannerRef.current;
            scannerRef.current = null;

            disposeScanner(activeScanner);
        };
    }, [isOpen, onScan, isMobileLayout, retryToken, selectedCameraId]);

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

    const handleRetryCamera = () => {
        setStatus('idle');
        setError('');
        setRetryToken((currentValue) => currentValue + 1);
    };

    const handleSwitchCamera = () => {
        if (availableCameras.length < 2) {
            return;
        }

        const currentCameraIndex = availableCameras.findIndex((camera) => camera.id === selectedCameraId);
        const nextIndex = currentCameraIndex >= 0
            ? (currentCameraIndex + 1) % availableCameras.length
            : 0;

        setError('');
        setSelectedCameraId(availableCameras[nextIndex].id);
        setRetryToken((currentValue) => currentValue + 1);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-dark/85 backdrop-blur-md" onClick={onClose} />

            <div className="relative z-10 h-[100dvh] w-full overflow-hidden border border-white/10 bg-card/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)] sm:h-auto sm:max-w-2xl sm:rounded-[2.5rem] sm:p-6">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-2xl bg-white/5 p-3 text-gray-400 transition-colors hover:text-white sm:right-6 sm:top-6"
                    aria-label="Cerrar escaner"
                >
                    <X size={18} />
                </button>

                <div className="mb-4 flex items-start gap-3 pr-16 sm:mb-6 sm:gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                        <ScanLine size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white sm:text-2xl">Escanear pedido</h2>
                        <p className="mt-1 text-xs text-gray-400 sm:text-sm">Lee el QR del comprobante para validar que el pedido este listo y entregarlo.</p>
                    </div>
                </div>

                <div className="grid h-[calc(100dvh-7.25rem)] gap-4 overflow-y-auto pb-2 sm:h-auto sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[2rem] border border-white/5 bg-dark/60 p-3 sm:p-4">
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-white/10 bg-black/30">
                            <div id={SCANNER_ELEMENT_ID} className="h-[46dvh] w-full [&>div]:h-full [&>div]:w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover sm:h-[320px]" />
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

                        <p className="mt-3 text-center text-[11px] text-gray-500 sm:text-xs">
                            {status === 'ready' ? 'Acerca y centra el QR dentro del recuadro.' : 'Mantene la camara firme mientras detecta el codigo.'}
                        </p>
                    </div>

                    <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/[0.03] p-4 sm:p-5">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                                <Camera size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Lectura en vivo</p>
                                <p className="text-sm font-semibold text-white">Apunta al QR del ticket del cliente</p>
                            </div>
                        </div>

                        {status === 'error' && (
                            <Button variant="secondary" fullWidth onClick={handleRetryCamera}>
                                Reintentar camara
                            </Button>
                        )}

                        {availableCameras.length > 1 && (
                            <Button variant="secondary" fullWidth onClick={handleSwitchCamera} disabled={status === 'processing' || status === 'starting'}>
                                <RefreshCcw size={16} />
                                Cambiar camara
                            </Button>
                        )}

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