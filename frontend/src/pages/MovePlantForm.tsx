import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { potAPI, soilAPI, historyAPI, plantAPI } from '../services/api';
import { Pot, Soil } from '../types';

const MovePlantForm: React.FC = () => {
    const navigate = useNavigate();
    const [pots, setPots] = useState<Pot[]>([]);
    const [soils, setSoils] = useState<Soil[]>([]);
    const [sourcePotQR, setSourcePotQR] = useState('');
    const [destPotQR, setDestPotQR] = useState('');
    const [sourcePot, setSourcePot] = useState<Pot | null>(null);
    const [destPot, setDestPot] = useState<Pot | null>(null);
    const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
    const [filteredSourcePots, setFilteredSourcePots] = useState<Pot[]>([]);
    const [filteredDestPots, setFilteredDestPots] = useState<Pot[]>([]);
    const [isArchiving, setIsArchiving] = useState(false);
    const [removeReason, setRemoveReason] = useState('');
    const [formData, setFormData] = useState({
        soil_id: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
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
                soilAPI.getAll(),
            ]);
            setPots(potsRes.data);
            setSoils(soilsRes.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        }
    };

    // Filter pots based on QR code input
    useEffect(() => {
        if (sourcePotQR && !sourcePot) {
            const filtered = pots.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(sourcePotQR.toLowerCase())
            );
            setFilteredSourcePots(filtered.slice(0, 10));
        } else {
            setFilteredSourcePots([]);
        }
    }, [sourcePotQR, pots, sourcePot]);

    useEffect(() => {
        if (destPotQR && !destPot) {
            const filtered = pots.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(destPotQR.toLowerCase())
            );
            setFilteredDestPots(filtered.slice(0, 10));
        } else {
            setFilteredDestPots([]);
        }
    }, [destPotQR, pots, destPot]);

    const handleSourcePotSelect = async (qrCode: string) => {
        // Clear dropdown immediately
        setFilteredSourcePots([]);
        setSourcePotQR(qrCode);
        setSelectedPlantId(null); // Reset plant selection when changing pot

        try {
            const response = await potAPI.getByQRCode(qrCode);
            setSourcePot(response.data);
            // Auto-select plant if only one plant in pot
            if (response.data.current_plants && response.data.current_plants.length === 1) {
                setSelectedPlantId(response.data.current_plants[0].id);
            }
        } catch (err) {
            setError('Failed to fetch source pot details');
            console.error(err);
        }
    };

    const handleDestPotSelect = async (qrCode: string) => {
        // Clear dropdown immediately
        setFilteredDestPots([]);
        setDestPotQR(qrCode);

        try {
            const response = await potAPI.getByQRCode(qrCode);
            setDestPot(response.data);
        } catch (err) {
            setError('Failed to fetch destination pot details');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!sourcePot) {
            setError('Please select a source pot');
            setLoading(false);
            return;
        }

        if (!selectedPlantId) {
            setError('Please select a plant to move');
            setLoading(false);
            return;
        }

        const selectedPlant = sourcePot.current_plants?.find(p => p.id === selectedPlantId);
        if (!selectedPlant) {
            setError('Selected plant not found');
            setLoading(false);
            return;
        }

        if (isArchiving) {
            // Archive/remove the plant
            if (!removeReason.trim()) {
                setError('Please provide a reason for removing the plant');
                setLoading(false);
                return;
            }

            if (!window.confirm(`Are you sure you want to archive ${selectedPlant.name}?\nReason: ${removeReason}`)) {
                setLoading(false);
                return;
            }

            try {
                await plantAPI.remove(selectedPlant.id, removeReason);
                navigate('/');
            } catch (err) {
                setError('Failed to archive plant. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            // Move the plant to a new pot
            if (!destPot) {
                setError('Please select a destination pot');
                setLoading(false);
                return;
            }

            if (!formData.soil_id) {
                setError('Please select a soil mix');
                setLoading(false);
                return;
            }

            try {
                await historyAPI.movePlant({
                    plant_id: selectedPlant.id,
                    pot_id: destPot.id,
                    soil_id: parseInt(formData.soil_id),
                    start_date: formData.start_date,
                    notes: formData.notes || undefined,
                });
                navigate('/');
            } catch (err) {
                setError('Failed to move plant. Please check all fields.');
                console.error(err);
            } finally {
                setLoading(false);
            }
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Move Plant Between Pots</h1>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Scan or enter the QR code from the pot labels to identify pots quickly.
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Source Pot Selection */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Pot (QR Code) *
                    </label>
                    <input
                        type="text"
                        placeholder="Enter or scan QR code of current pot..."
                        value={sourcePotQR}
                        onChange={(e) => setSourcePotQR(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!!sourcePot}
                    />

                    {filteredSourcePots.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded max-h-48 overflow-y-auto bg-white shadow-lg">
                            {filteredSourcePots.map((pot) => (
                                <button
                                    key={pot.id}
                                    type="button"
                                    onClick={() => handleSourcePotSelect(pot.qr_code_id)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                >
                                    <div className="font-medium">📦 QR: {pot.qr_code_id}</div>
                                    <div className="text-sm text-gray-600">
                                        {pot.room} - {pot.size}
                                        {pot.current_plants && pot.current_plants.length > 0 && (
                                            <span className="text-blue-600 font-semibold">
                                                {' '}• {pot.current_plants.length} plant{pot.current_plants.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {sourcePot && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-green-900">✓ Source Pot Selected</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSourcePot(null);
                                        setSourcePotQR('');
                                        setSelectedPlantId(null);
                                    }}
                                    className="text-sm text-green-700 hover:text-green-900 underline"
                                >
                                    Change
                                </button>
                            </div>
                            <p className="text-sm text-green-800">
                                <span className="font-medium">QR Code:</span> {sourcePot.qr_code_id}
                            </p>
                            <p className="text-sm text-green-800">
                                <span className="font-medium">Location:</span> {sourcePot.room} - {sourcePot.size}
                            </p>

                            {/* Show plant count */}
                            {sourcePot.current_plants && sourcePot.current_plants.length > 0 ? (
                                <p className="text-sm text-green-800 mt-2">
                                    <span className="font-medium">Plants in pot:</span> {sourcePot.current_plants.length}
                                </p>
                            ) : (
                                <p className="text-sm text-red-600 font-semibold mt-2">
                                    ⚠️ This pot is empty - cannot move
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Plant Selection - shown when source pot has plants */}
                {sourcePot && sourcePot.current_plants && sourcePot.current_plants.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Plant to Move *
                        </label>
                        <div className="space-y-2">
                            {sourcePot.current_plants.map((plant) => (
                                <label
                                    key={plant.id}
                                    className={`flex items-start p-3 border-2 rounded cursor-pointer transition-colors ${selectedPlantId === plant.id
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-green-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="selectedPlant"
                                        checked={selectedPlantId === plant.id}
                                        onChange={() => setSelectedPlantId(plant.id)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">
                                            🌱 {plant.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {plant.genus} {plant.species}
                                            {plant.species2 && ` × ${plant.species2}`}
                                            {plant.variation && ` '${plant.variation}'`}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Size: {plant.size}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Selection: Move or Archive */}
                {sourcePot && selectedPlantId && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What would you like to do?
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="action"
                                    checked={!isArchiving}
                                    onChange={() => setIsArchiving(false)}
                                    className="mr-2"
                                />
                                <span className="text-sm">🔄 Move to another pot</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="action"
                                    checked={isArchiving}
                                    onChange={() => setIsArchiving(true)}
                                    className="mr-2"
                                />
                                <span className="text-sm">🗑️ Archive/Remove plant</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Archive Reason - shown only when archiving */}
                {isArchiving && sourcePot && selectedPlantId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Removal *
                        </label>
                        <select
                            value={removeReason}
                            onChange={(e) => setRemoveReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            required={isArchiving}
                        >
                            <option value="">Select a reason...</option>
                            <option value="Died">Died</option>
                            <option value="Given away">Given away</option>
                            <option value="Sold">Sold</option>
                            <option value="Looked bad">Looked bad / unhealthy</option>
                            <option value="Too big">Too big to manage</option>
                            <option value="Other">Other</option>
                        </select>
                        {removeReason === 'Other' && (
                            <input
                                type="text"
                                placeholder="Please specify the reason..."
                                onChange={(e) => setRemoveReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                            />
                        )}
                    </div>
                )}

                {/* Destination Pot Selection - only shown when NOT archiving */}
                {!isArchiving && (
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Pot (QR Code) *
                        </label>
                        <input
                            type="text"
                            placeholder="Enter or scan QR code of destination pot..."
                            value={destPotQR}
                            onChange={(e) => setDestPotQR(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={!!destPot}
                        />

                        {filteredDestPots.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded max-h-48 overflow-y-auto bg-white shadow-lg">
                                {filteredDestPots.map((pot) => (
                                    <button
                                        key={pot.id}
                                        type="button"
                                        onClick={() => handleDestPotSelect(pot.qr_code_id)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                                    >
                                        <div className="font-medium">📦 QR: {pot.qr_code_id}</div>
                                        <div className="text-sm text-gray-600">
                                            {pot.room} - {pot.size}
                                            {pot.current_plants && pot.current_plants.length > 0 ? (
                                                <span className="text-blue-600 font-semibold">
                                                    {' '}• {pot.current_plants.length} plant{pot.current_plants.length !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500"> • Empty</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {destPot && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-blue-900">✓ Destination Pot Selected</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDestPot(null);
                                            setDestPotQR('');
                                        }}
                                        className="text-sm text-blue-700 hover:text-blue-900 underline"
                                    >
                                        Change
                                    </button>
                                </div>
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">QR Code:</span> {destPot.qr_code_id}
                                </p>
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Location:</span> {destPot.room} - {destPot.size}
                                </p>
                                {destPot.current_plants && destPot.current_plants.length > 0 && (
                                    <p className="text-sm text-blue-600 font-medium mt-2">
                                        ℹ️ This pot currently has {destPot.current_plants.length} plant{destPot.current_plants.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Soil Mix Selection - only shown when NOT archiving */}
                {!isArchiving && (
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
                )}

                {/* Start Date - only shown when NOT archiving */}
                {!isArchiving && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Move Date *
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
                )}

                {/* Notes - only shown when NOT archiving */}
                {!isArchiving && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Add any notes about this move..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading || !sourcePot || (isArchiving ? !removeReason : !destPot)}
                        className={`flex-1 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed ${isArchiving
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {loading
                            ? (isArchiving ? 'Archiving...' : 'Moving Plant...')
                            : (isArchiving ? 'Archive Plant' : 'Move Plant')
                        }
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MovePlantForm;
