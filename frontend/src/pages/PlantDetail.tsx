import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { plantAPI } from '../services/api';
import { Plant } from '../types';

const PlantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [plant, setPlant] = useState<Plant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchPlant(parseInt(id));
        }
    }, [id]);

    const fetchPlant = async (plantId: number) => {
        try {
            setLoading(true);
            const response = await plantAPI.getById(plantId);
            setPlant(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch plant details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading plant details...</div>;
    }

    if (error || !plant) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Plant not found'}
            </div>
        );
    }

    return (
        <div>
            <Link to="/" className="text-green-600 hover:text-green-700 mb-4 inline-block">
                ← Back to Dashboard
            </Link>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">{plant.name}</h1>
                    <span
                        className={`px-3 py-1 rounded ${plant.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {plant.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Botanical Information</h2>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm text-gray-600">Scientific Name:</dt>
                                <dd className="italic">
                                    {plant.genus} {plant.species}
                                    {plant.species2 && ` × ${plant.species2}`}
                                    {plant.variation && ` '${plant.variation}'`}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-600">Family:</dt>
                                <dd>{plant.family}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-600">Size:</dt>
                                <dd className="capitalize">{plant.size}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-600">Date Added:</dt>
                                <dd>{new Date(plant.date_added).toLocaleDateString()}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-3">Current Location</h2>
                        {plant.current_pot ? (
                            <div className="space-y-2">
                                <p>
                                    <span className="text-sm text-gray-600">Room:</span>{' '}
                                    {plant.current_pot.room}
                                </p>
                                <p>
                                    <span className="text-sm text-gray-600">Pot Size:</span>{' '}
                                    {plant.current_pot.size}
                                </p>
                                <p>
                                    <span className="text-sm text-gray-600">QR Code:</span>{' '}
                                    {plant.current_pot.qr_code_id}
                                </p>
                                {plant.current_soil && (
                                    <div>
                                        <p className="text-sm text-gray-600">Soil Mix:</p>
                                        <p className="font-semibold">{plant.current_soil.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {plant.current_soil.composition}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Not currently in a pot</p>
                        )}
                    </div>
                </div>

                {plant.notes && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Notes</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{plant.notes}</p>
                    </div>
                )}

                {plant.status === 'removed' && plant.removed_reason && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Removed</h2>
                        <p className="text-red-700">{plant.removed_reason}</p>
                    </div>
                )}
            </div>

            {plant.history && plant.history.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">Pot History</h2>

                    <div className="space-y-4">
                        {plant.history.map((entry) => (
                            <div
                                key={entry.id}
                                className="border-l-4 border-green-500 pl-4 py-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">
                                            {entry.pot?.room} - {entry.pot?.size}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Soil: {entry.soil?.name}
                                        </p>
                                        {entry.notes && (
                                            <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <p>{new Date(entry.start_date).toLocaleDateString()}</p>
                                        {entry.end_date && (
                                            <p>to {new Date(entry.end_date).toLocaleDateString()}</p>
                                        )}
                                        {!entry.end_date && (
                                            <p className="text-green-600 font-semibold">Current</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantDetail;
