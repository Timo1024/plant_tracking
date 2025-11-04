import React, { useState, useEffect } from 'react';
import { soilAPI } from '../services/api';
import { Soil } from '../types';

const SoilList: React.FC = () => {
    const [soils, setSoils] = useState<Soil[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deletingSoilId, setDeletingSoilId] = useState<number | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        composition: '',
    });

    useEffect(() => {
        fetchSoils();
    }, [showInactive]);

    const fetchSoils = async () => {
        try {
            setLoading(true);
            const response = await soilAPI.getAll(showInactive);
            setSoils(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch soils');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await soilAPI.create(formData);
            setFormData({ name: '', composition: '' });
            setShowForm(false);
            fetchSoils();
        } catch (err) {
            setError('Failed to add soil mix');
            console.error(err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDeleteSoil = async (soilId: number, soilName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${soilName}"? It will be marked as deleted but still visible in history.`)) {
            return;
        }

        try {
            setDeletingSoilId(soilId);
            await soilAPI.delete(soilId);
            // Refresh the soil list
            await fetchSoils();
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete soil mix');
            console.error(err);
        } finally {
            setDeletingSoilId(null);
        }
    };

    const handleRestoreSoil = async (soilId: number, soilName: string) => {
        if (!window.confirm(`Restore "${soilName}"?`)) {
            return;
        }

        try {
            setDeletingSoilId(soilId);
            await soilAPI.update(soilId, { active: true });
            // Refresh the soil list
            await fetchSoils();
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to restore soil mix');
            console.error(err);
        } finally {
            setDeletingSoilId(null);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading soil mixes...</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Soil Mixes</h1>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base ${showInactive
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {showInactive ? 'Hide Deleted' : 'Show Deleted'}
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base"
                    >
                        {showForm ? 'Cancel' : '+ Add Soil Mix'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Add New Soil Mix</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mix Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Aroid Mix, Succulent Mix"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Composition *
                            </label>
                            <textarea
                                name="composition"
                                required
                                value={formData.composition}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 40% bark, 30% perlite, 30% peat moss"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Add Soil Mix
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {soils.map((soil) => (
                    <div
                        key={soil.id}
                        className={`bg-white rounded-lg shadow-md p-6 relative ${!soil.active ? 'opacity-60 border-2 border-red-300' : ''
                            }`}
                    >
                        {soil.active ? (
                            <button
                                onClick={() => handleDeleteSoil(soil.id, soil.name)}
                                disabled={deletingSoilId === soil.id}
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-700 text-white p-1.5 rounded-full disabled:opacity-50 transition-colors"
                                title="Delete soil mix"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleRestoreSoil(soil.id, soil.name)}
                                disabled={deletingSoilId === soil.id}
                                className="absolute top-3 right-3 bg-green-500 hover:bg-green-700 text-white p-1.5 rounded-full disabled:opacity-50 transition-colors"
                                title="Restore soil mix"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}

                        {!soil.active && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                DELETED
                            </span>
                        )}

                        <h2 className="text-xl font-bold text-gray-800 mb-2 pr-12">
                            {soil.name}
                        </h2>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                            {soil.composition}
                        </p>
                    </div>
                ))}
            </div>

            {soils.length === 0 && !showForm && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-4">{showInactive ? 'No deleted soil mixes!' : 'No soil mixes yet!'}</p>
                    {!showInactive && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-green-600 hover:text-green-700 underline"
                        >
                            Add your first soil mix
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SoilList;
