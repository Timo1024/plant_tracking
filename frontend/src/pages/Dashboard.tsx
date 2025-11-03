import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { plantAPI } from '../services/api';
import { Plant } from '../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to highlight matching text
    const highlightMatch = (text: string, search: string) => {
        if (!search.trim()) return text;

        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === search.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-200 font-semibold">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPlants(plants);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = plants.filter(plant => {
            // Search by plant name
            if (plant.name.toLowerCase().includes(term)) return true;

            // Search by botanical names
            if (plant.family.toLowerCase().includes(term)) return true;
            if (plant.genus.toLowerCase().includes(term)) return true;
            if (plant.species.toLowerCase().includes(term)) return true;
            if (plant.species2?.toLowerCase().includes(term)) return true;
            if (plant.variation?.toLowerCase().includes(term)) return true;

            // Search by size
            if (plant.size.toLowerCase().includes(term)) return true;

            // Search by status
            if (plant.status.toLowerCase().includes(term)) return true;

            // Search by pot information
            if (plant.current_pot) {
                if (plant.current_pot.qr_code_id.toLowerCase().includes(term)) return true;
                if (plant.current_pot.room.toLowerCase().includes(term)) return true;
                if (plant.current_pot.size.toLowerCase().includes(term)) return true;
            }

            // Search by soil information
            if (plant.current_soil?.name.toLowerCase().includes(term)) return true;

            // Search by notes
            if (plant.notes?.toLowerCase().includes(term)) return true;

            return false;
        });

        setFilteredPlants(filtered);
    }, [searchTerm, plants]);

    const fetchPlants = async () => {
        try {
            setLoading(true);
            const response = await plantAPI.getAll();
            setPlants(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch plants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading plants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Plant Dashboard</h1>
                <Link
                    to="/add-plant"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Add New Plant
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search plants by name, species, pot, room, soil, or QR code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                    />
                    <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <p className="mt-2 text-sm text-gray-600">
                        Found {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlants.map((plant) => (
                    <div
                        key={plant.id}
                        onClick={() => navigate(`/plants/${plant.id}`)}
                        className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${plant.status === 'removed' ? 'opacity-50' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex-grow">
                                {highlightMatch(plant.name, searchTerm)}
                            </h2>
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/plants/${plant.id}/edit`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Edit plant"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <span
                                    className={`px-2 py-1 text-xs rounded ${plant.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {highlightMatch(plant.status, searchTerm)}
                                </span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="italic">
                                {highlightMatch(plant.genus, searchTerm)} {highlightMatch(plant.species, searchTerm)}
                                {plant.species2 && <> × {highlightMatch(plant.species2, searchTerm)}</>}
                                {plant.variation && <> '{highlightMatch(plant.variation, searchTerm)}'</>}
                            </p>
                            <p>Family: {highlightMatch(plant.family, searchTerm)}</p>
                            <p>Size: {highlightMatch(plant.size, searchTerm)}</p>

                            {plant.current_pot && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="font-semibold">📍 {highlightMatch(plant.current_pot.room, searchTerm)}</p>
                                    <p>Pot: {highlightMatch(plant.current_pot.size, searchTerm)} ({highlightMatch(plant.current_pot.qr_code_id, searchTerm)})</p>
                                    {plant.current_soil && (
                                        <p className="text-xs">Soil: {highlightMatch(plant.current_soil.name, searchTerm)}</p>
                                    )}
                                </div>
                            )}

                            {plant.status === 'removed' && plant.removed_reason && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-red-600">
                                    <p className="text-xs">Removed: {highlightMatch(plant.removed_reason, searchTerm)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPlants.length === 0 && plants.length > 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-4">No plants match your search</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-green-600 hover:text-green-700 underline"
                    >
                        Clear search
                    </button>
                </div>
            )}

            {plants.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-4">No plants yet!</p>
                    <Link
                        to="/add-plant"
                        className="text-green-600 hover:text-green-700 underline"
                    >
                        Add your first plant
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
