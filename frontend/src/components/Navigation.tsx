import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navigation: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <nav className="bg-green-600 dark:bg-gray-800 text-white shadow-lg sticky top-0 z-50 transition-colors duration-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">
                        🌱 Plant Tracker
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Home
                        </Link>
                        <Link to="/plants" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Plants
                        </Link>
                        <Link to="/pots" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Pots
                        </Link>
                        <Link to="/soils" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Soils
                        </Link>
                        <Link to="/add-plant" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Add Plant
                        </Link>
                        <Link to="/add-pot" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Add Pot
                        </Link>
                        <Link to="/move" className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors">
                            Move
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className="hover:bg-green-700 dark:hover:bg-gray-700 px-3 py-2 rounded transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
