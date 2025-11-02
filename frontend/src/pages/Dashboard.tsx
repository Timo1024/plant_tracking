import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plantAPI } from '../services/api';
import { Plant } from '../types';

const Dashboard: React.FC = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlants();
    }, []);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plants.map((plant) => (
                    <Link
                        key={plant.id}
                        to={`/plants/${plant.id}`}
                        className={`block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${plant.status === 'removed' ? 'opacity-50' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800">{plant.name}</h2>
                            <span
                                className={`px-2 py-1 text-xs rounded ${plant.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {plant.status}
                            </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="italic">
                                {plant.genus} {plant.species}
                                {plant.species2 && ` × ${plant.species2}`}
                                {plant.variation && ` '${plant.variation}'`}
                            </p>
                            <p>Family: {plant.family}</p>
                            <p>Size: {plant.size}</p>

                            {plant.current_pot && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="font-semibold">📍 {plant.current_pot.room}</p>
                                    <p>Pot: {plant.current_pot.size}</p>
                                    {plant.current_soil && (
                                        <p className="text-xs">Soil: {plant.current_soil.name}</p>
                                    )}
                                </div>
                            )}

                            {plant.status === 'removed' && plant.removed_reason && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-red-600">
                                    <p className="text-xs">Removed: {plant.removed_reason}</p>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

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
