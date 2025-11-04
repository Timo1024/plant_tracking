import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { plantAPI } from '../services/api';
import { Plant } from '../types';

const PlantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plant, setPlant] = useState<Plant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = async () => {
        if (!plant || !deleteReason.trim()) return;

        try {
            setDeleting(true);
            await plantAPI.remove(plant.id, deleteReason);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete plant');
            console.error(err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
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
        <div className="px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <Link to="/" className="text-green-600 hover:text-green-700 inline-block text-sm sm:text-base">
                    ← Back to Dashboard
                </Link>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                        to={`/plants/${plant.id}/edit`}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit Plant</span>
                        <span className="sm:hidden">Edit</span>
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Delete Plant</h3>
                        <p className="text-sm sm:text-base text-gray-700 mb-4">
                            Are you sure you want to delete <strong>{plant.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion *
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="e.g., Plant died, Gave away, etc."
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteReason('');
                                }}
                                disabled={deleting}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || !deleteReason.trim()}
                                className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Plant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
