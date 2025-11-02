import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { potAPI } from '../services/api';

const AddPotForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        room: '',
        size: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataToSubmit = {
                ...formData,
                notes: formData.notes || undefined,
                domain: window.location.origin,
            };

            await potAPI.create(dataToSubmit);
            navigate('/');
        } catch (err) {
            setError('Failed to add pot. Please check all fields.');
            console.error(err);
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Pot</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room / Location *
                    </label>
                    <input
                        type="text"
                        name="room"
                        required
                        value={formData.room}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Living Room, Balcony"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pot Size *
                    </label>
                    <input
                        type="text"
                        name="size"
                        required
                        value={formData.size}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 15 cm, 2L"
                    />
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
                        placeholder="Any additional notes about this pot..."
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                        ℹ️ A unique QR code will be generated automatically when you create this pot.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Adding...' : 'Add Pot'}
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

export default AddPotForm;
