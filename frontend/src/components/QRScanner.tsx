import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface QRScannerProps {
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanningRef = useRef<boolean>(true);
    const lastScanTimeRef = useRef<number>(0);

    // Start camera with optimized settings
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 }, // Higher resolution for better QR detection
                    height: { ideal: 1080 },
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Unable to access camera. Please check permissions or enter QR code manually.');
        }
    };

    // Stop camera
    const stopCamera = () => {
        scanningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // Handle manual QR code input
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            navigate(`/pot/${manualInput.trim()}`);
            stopCamera();
            onClose();
        }
    };

    // Scan QR code from video frame - optimized version
    const scanQRCode = async () => {
        if (!videoRef.current || !scanningRef.current) return;

        const now = Date.now();
        // Scan every 100ms instead of every frame for better performance
        if (now - lastScanTimeRef.current < 100) {
            requestAnimationFrame(scanQRCode);
            return;
        }
        lastScanTimeRef.current = now;

        const video = videoRef.current;

        // Skip if video not ready
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanQRCode);
            return;
        }

        const canvas = document.createElement('canvas');
        // Use smaller canvas for faster processing
        const scale = 0.5; // Process at half resolution
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                // Use browser's built-in barcode detection if available
                if ('BarcodeDetector' in window) {
                    const barcodeDetector = new (window as any).BarcodeDetector({
                        formats: ['qr_code']
                    });
                    const barcodes = await barcodeDetector.detect(canvas);

                    if (barcodes.length > 0) {
                        const qrCode = barcodes[0].rawValue;
                        // Extract QR code ID from URL or use directly
                        const match = qrCode.match(/\/pot\/([^\/\?]+)/);
                        const potId = match ? match[1] : qrCode;

                        scanningRef.current = false;
                        stopCamera();
                        navigate(`/pot/${potId}`);
                        onClose();
                        return;
                    }
                }
            } catch (err) {
                console.error('QR scan error:', err);
            }
        }

        // Continue scanning
        if (scanningRef.current && streamRef.current) {
            requestAnimationFrame(scanQRCode);
        }
    };

    // Start camera and scanning on mount
    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    // Start scanning when video is ready
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.addEventListener('loadedmetadata', () => {
                scanQRCode();
            });
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">📷 Scan QR Code</h2>
                <button
                    onClick={() => {
                        stopCamera();
                        onClose();
                    }}
                    className="text-white hover:text-gray-300 text-2xl"
                >
                    ✕
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative max-w-lg w-full">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                    />

                    {/* Scanning overlay */}
                    <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50"></div>
                        </div>
                    </div>

                    {error && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-3 rounded-b-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Input */}
            <div className="bg-gray-900 text-white p-4">
                <p className="text-sm text-gray-300 mb-2 text-center">
                    Can't scan? Enter QR code manually:
                </p>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Enter pot QR code (e.g., QR-001)"
                        className="flex-1 px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        Go
                    </button>
                </form>

                <p className="text-xs text-gray-400 mt-3 text-center">
                    💡 Point camera at QR code on pot label
                </p>
            </div>
        </div>
    );
};

export default QRScanner;
