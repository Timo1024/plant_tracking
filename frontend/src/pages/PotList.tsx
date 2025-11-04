import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { potAPI } from '../services/api';
import { Pot } from '../types';

const PotList: React.FC = () => {
    const navigate = useNavigate();
    const [pots, setPots] = useState<Pot[]>([]);
    const [filteredPots, setFilteredPots] = useState<Pot[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'empty'>('all');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPots();
    }, [filterActive]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, filterActive, pots]);

    const fetchPots = async () => {
        try {
            setLoading(true);
            const includeInactive = filterActive === 'all' || filterActive === 'inactive';
            const response = await potAPI.getAll(includeInactive);
            setPots(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch pots');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...pots];

        // Filter by active status
        if (filterActive === 'active') {
            filtered = filtered.filter(pot => pot.active);
        } else if (filterActive === 'inactive') {
            filtered = filtered.filter(pot => !pot.active);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(term) ||
                pot.room.toLowerCase().includes(term) ||
                pot.size.toLowerCase().includes(term) ||
                pot.current_plants?.some(plant =>
                    plant.name.toLowerCase().includes(term) ||
                    plant.genus.toLowerCase().includes(term) ||
                    plant.species.toLowerCase().includes(term)
                )
            );
        }

        // Filter by occupancy status
        if (filterStatus === 'occupied') {
            filtered = filtered.filter(pot => pot.current_plants && pot.current_plants.length > 0);
        } else if (filterStatus === 'empty') {
            filtered = filtered.filter(pot => !pot.current_plants || pot.current_plants.length === 0);
        }

        setFilteredPots(filtered);
    };

    const getPotStatusColor = (pot: Pot) => {
        if (!pot.current_plants || pot.current_plants.length === 0) {
            return 'bg-gray-100 border-gray-300';
        }
        return 'bg-green-50 border-green-300';
    };

    const getPotStatusBadge = (pot: Pot) => {
        const count = pot.current_plants?.length || 0;
        return count > 0 ? (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">{count} plant{count !== 1 ? 's' : ''}</span>
        ) : <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">Empty</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading pots...</div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🪴 Pot Overview</h1>
                <button
                    onClick={() => navigate('/add-pot')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                    <span>➕</span>
                    Add New Pot
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-gray-800">{pots.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Pots</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-green-700">
                        {pots.filter(p => p.current_plants && p.current_plants.length > 0).length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Occupied</div>
                </div>
                <div className="bg-gray-50 rounded-lg shadow p-3 sm:p-4 col-span-2 sm:col-span-1">
                    <div className="text-xl sm:text-2xl font-bold text-gray-700">
                        {pots.filter(p => !p.current_plants || p.current_plants.length === 0).length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Empty</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by QR code, room, size, or plant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Pot Status
                        </label>
                        <div className="flex gap-1 sm:gap-2">
                            <button
                                onClick={() => setFilterActive('active')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterActive === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterActive('inactive')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterActive === 'inactive'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Inactive
                            </button>
                            <button
                                onClick={() => setFilterActive('all')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterActive === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Occupancy
                        </label>
                        <div className="flex gap-1 sm:gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterStatus === 'all'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('occupied')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterStatus === 'occupied'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Occupied
                            </button>
                            <button
                                onClick={() => setFilterStatus('empty')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm ${filterStatus === 'empty'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Empty
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-gray-600">
                Showing {filteredPots.length} of {pots.length} pots
            </div>

            {/* Pot Grid */}
            {filteredPots.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-gray-500 text-lg">No pots found matching your filters</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPots.map((pot) => (
                        <div
                            key={pot.id}
                            className={`border-2 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${getPotStatusColor(pot)}`}
                            onClick={() => navigate(`/pot/${pot.qr_code_id}`)}
                        >
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-2">
                                        <div className="text-xs text-gray-500 mb-1">QR Code</div>
                                        <div className="font-mono font-bold text-lg text-gray-800">
                                            {pot.qr_code_id}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        {!pot.active && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                        {getPotStatusBadge(pot)}
                                    </div>
                                </div>

                                {/* Pot Details */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center text-sm">
                                        <span className="text-gray-600 w-16">📍 Room:</span>
                                        <span className="font-medium text-gray-800">{pot.room}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="text-gray-600 w-16">📏 Size:</span>
                                        <span className="font-medium text-gray-800">{pot.size}</span>
                                    </div>
                                    {pot.current_soil && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600 w-16">🌱 Soil:</span>
                                            <span className="font-medium text-gray-800 truncate">
                                                {pot.current_soil.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Current Plants */}
                                {pot.current_plants && pot.current_plants.length > 0 ? (
                                    <div className="border-t pt-3">
                                        <div className="text-xs text-gray-600 mb-2 font-semibold">
                                            Current Plant{pot.current_plants.length > 1 ? 's' : ''}:
                                        </div>
                                        <div className="space-y-2">
                                            {pot.current_plants.map((plant) => (
                                                <div
                                                    key={plant.id}
                                                    className="bg-white bg-opacity-50 rounded p-2 hover:bg-opacity-100 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plants/${plant.id}`);
                                                    }}
                                                >
                                                    <div className="font-medium text-gray-800">
                                                        {plant.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 italic">
                                                        {plant.genus} {plant.species}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                            {plant.size}
                                                        </span>
                                                        {plant.status === 'removed' && (
                                                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                                                Removed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t pt-3">
                                        <div className="text-sm text-gray-500 italic">No plants in this pot</div>
                                    </div>
                                )}

                                {/* Notes */}
                                {pot.notes && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="text-xs text-gray-600 mb-1">Notes:</div>
                                        <div className="text-sm text-gray-700 line-clamp-2">{pot.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PotList;
