import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { potAPI } from '../services/api';
import { Pot } from '../types';
import AutocompleteInput from '../components/AutocompleteInput';

const AddPotForm: React.FC = () => {
    const navigate = useNavigate();
    const [pots, setPots] = useState<Pot[]>([]);
    const [formData, setFormData] = useState({
        room: '',
        size: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get unique room and size values for autocomplete suggestions
    const getUniqueRooms = (): string[] => {
        const rooms = pots.map(pot => pot.room).filter(room => room.trim() !== '');
        return [...new Set(rooms)].sort();
    };

    const getUniqueSizes = (): string[] => {
        const sizes = pots.map(pot => pot.size).filter(size => size.trim() !== '');
        return [...new Set(sizes)].sort();
    };

    useEffect(() => {
        fetchPots();
    }, []);

    const fetchPots = async () => {
        try {
            const response = await potAPI.getAll();
            setPots(response.data);
        } catch (err) {
            console.error('Failed to fetch pots for suggestions:', err);
        }
    };

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
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Add New Pot</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4" autoComplete="off">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room / Location *
                    </label>
                    <AutocompleteInput
                        name="room"
                        value={formData.room}
                        onChange={(value) => setFormData({ ...formData, room: value })}
                        suggestions={getUniqueRooms()}
                        placeholder="e.g., Living Room, Balcony"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pot Size *
                    </label>
                    <AutocompleteInput
                        name="size"
                        value={formData.size}
                        onChange={(value) => setFormData({ ...formData, size: value })}
                        suggestions={getUniqueSizes()}
                        placeholder="e.g., Small (10cm), Medium (15cm)"
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
