import React, { useState, useEffect } from 'react';
import { soilAPI } from '../services/api';
import { Soil } from '../types';

const SoilList: React.FC = () => {
    const [soils, setSoils] = useState<Soil[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        composition: '',
    });

    useEffect(() => {
        fetchSoils();
    }, []);

    const fetchSoils = async () => {
        try {
            setLoading(true);
            const response = await soilAPI.getAll();
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

    if (loading) {
        return <div className="text-center py-12">Loading soil mixes...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Soil Mixes</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {showForm ? 'Cancel' : '+ Add Soil Mix'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
                    <div key={soil.id} className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{soil.name}</h2>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                            {soil.composition}
                        </p>
                    </div>
                ))}
            </div>

            {soils.length === 0 && !showForm && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-xl mb-4">No soil mixes yet!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-green-600 hover:text-green-700 underline"
                    >
                        Add your first soil mix
                    </button>
                </div>
            )}
        </div>
    );
};

export default SoilList;
