import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
    return (
        <nav className="bg-green-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">
                        🌱 Plant Tracker
                    </Link>
                    <div className="flex space-x-4">
                        <Link to="/" className="hover:bg-green-700 px-3 py-2 rounded">
                            Dashboard
                        </Link>
                        <Link to="/pots" className="hover:bg-green-700 px-3 py-2 rounded">
                            Pots
                        </Link>
                        <Link to="/add-plant" className="hover:bg-green-700 px-3 py-2 rounded">
                            Add Plant
                        </Link>
                        <Link to="/add-pot" className="hover:bg-green-700 px-3 py-2 rounded">
                            Add Pot
                        </Link>
                        <Link to="/move" className="hover:bg-green-700 px-3 py-2 rounded">
                            Move Plant
                        </Link>
                        <Link to="/soils" className="hover:bg-green-700 px-3 py-2 rounded">
                            Soils
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
