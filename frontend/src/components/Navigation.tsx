import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xl sm:text-2xl font-bold">
                        🌱 Plant Tracker
                    </Link>

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
    );
};

export default Navigation;
