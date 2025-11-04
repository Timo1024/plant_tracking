import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { potAPI, plantAPI } from '../services/api';
import { Pot } from '../types';

const PotDetail: React.FC = () => {
    const { qrCodeId } = useParams<{ qrCodeId: string }>();
    const navigate = useNavigate();
    const [pot, setPot] = useState<Pot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeletePotConfirm, setShowDeletePotConfirm] = useState(false);
    const [showDeletePlantConfirm, setShowDeletePlantConfirm] = useState(false);
    const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [editingLocation, setEditingLocation] = useState(false);
    const [newLocation, setNewLocation] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (qrCodeId) {
            fetchPot(qrCodeId);
        }
    }, [qrCodeId]);

    const fetchPot = async (id: string) => {
        try {
            setLoading(true);
            const response = await potAPI.getByQRCode(id);
            setPot(response.data);
            setError(null);
        } catch (err) {
            setError('Pot not found');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePot = async () => {
        if (!pot) return;

        try {
            setDeleting(true);
            await potAPI.delete(pot.id);
            navigate('/pots');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete pot');
            setShowDeletePotConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeletePlant = async () => {
        if (!selectedPlantId || !deleteReason.trim()) return;

        try {
            setDeleting(true);
            await plantAPI.remove(selectedPlantId, deleteReason);
            if (qrCodeId) {
                await fetchPot(qrCodeId);
            }
            setShowDeletePlantConfirm(false);
            setSelectedPlantId(null);
            setDeleteReason('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete plant');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditLocation = () => {
        if (!pot) return;
        setNewLocation(pot.room);
        setEditingLocation(true);
    };

    const handleSaveLocation = async () => {
        if (!pot || !newLocation.trim()) return;

        setSaving(true);
        try {
            await potAPI.update(pot.id, { room: newLocation.trim() });
            setPot({ ...pot, room: newLocation.trim() });
            setEditingLocation(false);
        } catch (err) {
            console.error('Failed to update location:', err);
            alert('Failed to update location. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingLocation(false);
        setNewLocation('');
    };

    if (loading) {
        return <div className="text-center py-12">Loading pot details...</div>;
    }

    if (error || !pot) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Pot not found'}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            {/* QR Scan Success Banner */}
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Pot Found!</span>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6">
                    🪴 Pot Details
                </h1>

                {!pot.active && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded">
                        <p className="font-bold text-sm sm:text-base">⚠️ This pot is no longer active</p>
                        <p className="text-xs sm:text-sm">This pot has been marked as inactive/deleted but its history is preserved.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-600">QR Code ID</p>
                        <p className="text-2xl font-mono">{pot.qr_code_id}</p>
                    </div>

                    <div className="border-b pb-4">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">Location</p>
                            {!editingLocation && (
                                <button
                                    onClick={handleEditLocation}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingLocation ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter room/location"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveLocation}
                                        disabled={saving || !newLocation.trim()}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {saving ? 'Saving...' : '✓ Save'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-2xl">{pot.room}</p>
                        )}
                    </div>

                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-600">Pot Size</p>
                        <p className="text-2xl">{pot.size}</p>
                    </div>

                    {pot.notes && (
                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-700">{pot.notes}</p>
                        </div>
                    )}

                    {pot.current_plants && pot.current_plants.length > 0 ? (
                        <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-500">
                            <h2 className="text-2xl font-bold text-green-800 mb-4">
                                🌱 Current Plant{pot.current_plants.length !== 1 ? 's' : ''} ({pot.current_plants.length})
                            </h2>
                            <div className="space-y-6">
                                {pot.current_plants.map((plant, index) => (
                                    <div key={plant.id} className={index > 0 ? 'pt-6 border-t border-green-200' : ''}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <Link to={`/plants/${plant.id}`} className="text-xl font-semibold text-green-700 hover:text-green-900">
                                                    {plant.name}
                                                </Link>
                                                <p className="italic text-gray-700">
                                                    {plant.genus} {plant.species}
                                                    {plant.species2 && ` × ${plant.species2}`}
                                                </p>
                                                <p className="text-gray-600">
                                                    Family: {plant.family}
                                                </p>
                                                <p className="text-gray-600 capitalize">
                                                    Size: {plant.size}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex flex-col gap-2">
                                                <Link
                                                    to="/move"
                                                    state={{ plantId: plant.id, sourcePotQR: pot.qr_code_id }}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm text-center whitespace-nowrap"
                                                >
                                                    Move Plant
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPlantId(plant.id);
                                                        setShowDeletePlantConfirm(true);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {pot.current_soil && (
                                    <div className="mt-4 pt-4 border-t border-green-200">
                                        <p className="text-sm text-gray-600">Soil Mix</p>
                                        <p className="font-semibold">{pot.current_soil.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {pot.current_soil.composition}
                                        </p>
                                    </div>
                                )}
                                {pot.start_date && (
                                    <p className="text-sm text-gray-600 mt-4">
                                        First potted on: {new Date(pot.start_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-center">
                                This pot is currently empty
                            </p>
                        </div>
                    )}

                    {/* Delete Pot Button - Only show for empty and active pots */}
                    {pot.active && (!pot.current_plants || pot.current_plants.length === 0) && (
                        <div className="mt-6 pt-6 border-t">
                            <button
                                onClick={() => setShowDeletePotConfirm(true)}
                                className="w-full bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                            >
                                Delete Pot
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Pot Confirmation Modal */}
            {showDeletePotConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Mark Pot as Inactive</h2>
                        <p className="mb-4">
                            Are you sure you want to mark pot <strong>{pot?.qr_code_id}</strong> as inactive?
                        </p>
                        <p className="mb-4 text-sm text-gray-600">
                            The pot will be hidden from the pot list but its history will be preserved.
                            It can still be accessed via its QR code for reference.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeletePotConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePot}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? 'Processing...' : 'Mark Inactive'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Plant Confirmation Modal */}
            {showDeletePlantConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Remove Plant</h2>
                        <p className="mb-4">
                            Please provide a reason for removing this plant:
                        </p>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 min-h-24"
                            placeholder="e.g., Plant died, Gave away, Sold, etc."
                            disabled={deleting}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeletePlantConfirm(false);
                                    setSelectedPlantId(null);
                                    setDeleteReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePlant}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                disabled={deleting || !deleteReason.trim()}
                            >
                                {deleting ? 'Removing...' : 'Remove Plant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PotDetail;
