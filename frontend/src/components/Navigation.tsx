import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRScanner from './QRScanner';

const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    return (
        <>
            <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="text-xl sm:text-2xl font-bold">
                            🌱 Plant Tracker
                        </Link>

                        <div className="flex items-center gap-2">
                            {/* QR Scanner Button */}
                            <button
                                onClick={() => setShowScanner(true)}
                                className="bg-green-700 hover:bg-green-800 px-3 py-2 rounded flex items-center gap-2"
                                title="Scan QR Code"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                <span className="hidden sm:inline">Scan</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 rounded hover:bg-green-700 focus:outline-none"
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Desktop menu */}
                        <div className="hidden md:flex space-x-4">
                            <Link to="/" className="hover:bg-green-700 px-3 py-2 rounded">
                                Home
                            </Link>
                            <Link to="/plants" className="hover:bg-green-700 px-3 py-2 rounded">
                                Plants
                            </Link>
                            <Link to="/pots" className="hover:bg-green-700 px-3 py-2 rounded">
                                Pots
                            </Link>
                            <Link to="/soils" className="hover:bg-green-700 px-3 py-2 rounded">
                                Soils
                            </Link>
                            <Link to="/add-plant" className="hover:bg-green-700 px-3 py-2 rounded">
                                Add Plant
                            </Link>
                            <Link to="/add-pot" className="hover:bg-green-700 px-3 py-2 rounded">
                                Add Pot
                            </Link>
                            <Link to="/move" className="hover:bg-green-700 px-3 py-2 rounded">
                                Move
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="md:hidden mt-4 pb-2 space-y-2">
                            <Link
                                to="/"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/plants"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Plants
                            </Link>
                            <Link
                                to="/pots"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Pots
                            </Link>
                            <Link
                                to="/soils"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Soils
                            </Link>
                            <Link
                                to="/add-plant"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Add Plant
                            </Link>
                            <Link
                                to="/add-pot"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Add Pot
                            </Link>
                            <Link
                                to="/move"
                                className="block hover:bg-green-700 px-3 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Move
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* QR Scanner Modal */}
            {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}
        </>
    );
};

export default Navigation;
