import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI } from '../services/api';

const AddPlantForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        family: '',
        genus: '',
        species: '',
        species2: '',
        variation: '',
        size: 'small',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataToSubmit: any = {
                name: formData.name,
                family: formData.family,
                genus: formData.genus,
                species: formData.species,
                size: formData.size as 'seedling' | 'small' | 'medium' | 'large' | 'giant',
                species2: formData.species2 || undefined,
                variation: formData.variation || undefined,
                notes: formData.notes || undefined,
            };

            await plantAPI.create(dataToSubmit);
            navigate('/');
        } catch (err) {
            setError('Failed to add plant. Please check all fields.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Plant</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Common Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., My Monstera"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Family *
                        </label>
                        <input
                            type="text"
                            name="family"
                            required
                            value={formData.family}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Araceae"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Genus *
                        </label>
                        <input
                            type="text"
                            name="genus"
                            required
                            value={formData.genus}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Monstera"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Species *
                        </label>
                        <input
                            type="text"
                            name="species"
                            required
                            value={formData.species}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., deliciosa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Species 2 (for hybrids)
                        </label>
                        <input
                            type="text"
                            name="species2"
                            value={formData.species2}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variation
                        </label>
                        <input
                            type="text"
                            name="variation"
                            value={formData.variation}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., variegated"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size *
                        </label>
                        <select
                            name="size"
                            required
                            value={formData.size}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="seedling">Seedling</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="giant">Giant</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Any additional notes about this plant..."
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Adding...' : 'Add Plant'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPlantForm;
