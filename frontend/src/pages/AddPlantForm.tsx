import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, potAPI, soilAPI, historyAPI } from '../services/api';
import { Pot, Soil } from '../types';

const AddPlantForm: React.FC = () => {
    const navigate = useNavigate();
    const [pots, setPots] = useState<Pot[]>([]);
    const [soils, setSoils] = useState<Soil[]>([]);
    const [potQR, setPotQR] = useState('');
    const [selectedPot, setSelectedPot] = useState<Pot | null>(null);
    const [filteredPots, setFilteredPots] = useState<Pot[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        family: '',
        genus: '',
        species: '',
        species2: '',
        variation: '',
        size: 'small',
        notes: '',
        pot_id: '',
        soil_id: '',
        start_date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [potsRes, soilsRes] = await Promise.all([
                potAPI.getAll(),
                soilAPI.getAll()
            ]);
            setPots(potsRes.data);
            setSoils(soilsRes.data);
        } catch (err) {
            setError('Failed to fetch pots and soils');
            console.error(err);
        }
    };

    // Filter pots based on QR code input
    useEffect(() => {
        if (potQR && !selectedPot) {
            const filtered = pots.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(potQR.toLowerCase())
            );
            setFilteredPots(filtered);
        } else {
            setFilteredPots([]);
        }
    }, [potQR, pots, selectedPot]);

    const handlePotSelect = async (qrCode: string) => {
        setFilteredPots([]);
        try {
            const response = await potAPI.getByQRCode(qrCode);
            setSelectedPot(response.data);
            setPotQR(qrCode);
        } catch (err) {
            setError('Failed to fetch pot details');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedPot) {
            setError('Please select a pot for the plant');
            setLoading(false);
            return;
        }

        if (selectedPot.current_plant) {
            setError('Selected pot already has a plant. Please choose an empty pot.');
            setLoading(false);
            return;
        }

        if (!formData.soil_id) {
            setError('Please select a soil mix');
            setLoading(false);
            return;
        }

        try {
            // First, create the plant
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

            const plantResponse = await plantAPI.create(dataToSubmit);
            const newPlant = plantResponse.data;

            // Then, move the plant to the selected pot
            await historyAPI.movePlant({
                plant_id: newPlant.id,
                pot_id: selectedPot.id,
                soil_id: parseInt(formData.soil_id),
                start_date: formData.start_date,
                notes: undefined,
            });

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

                {/* Pot Selection */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pot (QR Code) *
                    </label>
                    <input
                        type="text"
                        placeholder="Enter or scan QR code of pot..."
                        value={potQR}
                        onChange={(e) => setPotQR(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!!selectedPot}
                        required
                    />

                    {filteredPots.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded max-h-48 overflow-y-auto bg-white shadow-lg">
                            {filteredPots.map((pot) => (
                                <button
                                    key={pot.id}
                                    type="button"
                                    onClick={() => handlePotSelect(pot.qr_code_id)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                >
                                    <div className="font-medium">📦 QR: {pot.qr_code_id}</div>
                                    <div className="text-sm text-gray-600">
                                        {pot.room} - {pot.size}
                                        {pot.current_plant && (
                                            <span className="text-orange-600 font-semibold"> • Occupied by {pot.current_plant.name}</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedPot && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-green-900">✓ Pot Selected</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedPot(null);
                                        setPotQR('');
                                    }}
                                    className="text-sm text-green-700 hover:text-green-900 underline"
                                >
                                    Change
                                </button>
                            </div>
                            <p className="text-sm text-green-800">
                                <span className="font-medium">QR Code:</span> {selectedPot.qr_code_id}
                            </p>
                            <p className="text-sm text-green-800">
                                <span className="font-medium">Location:</span> {selectedPot.room} - {selectedPot.size}
                            </p>
                            {selectedPot.current_plant && (
                                <p className="text-sm text-orange-600 font-semibold mt-2">
                                    ⚠️ Warning: Pot is occupied by {selectedPot.current_plant.name}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Soil Mix Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Soil Mix *
                    </label>
                    <select
                        name="soil_id"
                        required
                        value={formData.soil_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- Select a Soil Mix --</option>
                        {soils.map((soil) => (
                            <option key={soil.id} value={soil.id}>
                                {soil.name} - {soil.composition}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        required
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
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
