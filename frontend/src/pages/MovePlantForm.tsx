import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { potAPI, soilAPI, historyAPI } from '../services/api';
import { Pot, Soil } from '../types';

const MovePlantForm: React.FC = () => {
    const navigate = useNavigate();
    const [pots, setPots] = useState<Pot[]>([]);
    const [soils, setSoils] = useState<Soil[]>([]);
    const [sourcePotQR, setSourcePotQR] = useState('');
    const [destPotQR, setDestPotQR] = useState('');
    const [sourcePot, setSourcePot] = useState<Pot | null>(null);
    const [destPot, setDestPot] = useState<Pot | null>(null);
    const [filteredSourcePots, setFilteredSourcePots] = useState<Pot[]>([]);
    const [filteredDestPots, setFilteredDestPots] = useState<Pot[]>([]);
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
        if (sourcePotQR) {
            const filtered = pots.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(sourcePotQR.toLowerCase())
            );
            setFilteredSourcePots(filtered.slice(0, 10));
        } else {
            setFilteredSourcePots([]);
        }
    }, [sourcePotQR, pots]);

    useEffect(() => {
        if (destPotQR) {
            const filtered = pots.filter(pot =>
                pot.qr_code_id.toLowerCase().includes(destPotQR.toLowerCase())
            );
            setFilteredDestPots(filtered.slice(0, 10));
        } else {
            setFilteredDestPots([]);
        }
    }, [destPotQR, pots]);

    const handleSourcePotSelect = async (qrCode: string) => {
        try {
            const response = await potAPI.getByQRCode(qrCode);
            setSourcePot(response.data);
            setSourcePotQR(qrCode);
            setFilteredSourcePots([]);
        } catch (err) {
            setError('Failed to fetch source pot details');
            console.error(err);
        }
    };

    const handleDestPotSelect = async (qrCode: string) => {
        try {
            const response = await potAPI.getByQRCode(qrCode);
            setDestPot(response.data);
            setDestPotQR(qrCode);
            setFilteredDestPots([]);
        } catch (err) {
            setError('Failed to fetch destination pot details');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!sourcePot || !sourcePot.current_plant) {
            setError('Source pot must have a plant in it');
            setLoading(false);
            return;
        }

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
                plant_id: sourcePot.current_plant.id,
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
                <div>
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
                        <div className="mt-2 border border-gray-300 rounded max-h-48 overflow-y-auto bg-white shadow-lg">
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
                                        {pot.current_plant && (
                                            <span className="text-green-600 font-semibold"> • {pot.current_plant.name}</span>
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
                            {sourcePot.current_plant ? (
                                <div className="mt-2 pt-2 border-t border-green-300">
                                    <p className="text-sm text-green-800 font-semibold">
                                        🌱 Plant: {sourcePot.current_plant.name}
                                    </p>
                                    <p className="text-xs text-green-700">
                                        {sourcePot.current_plant.genus} {sourcePot.current_plant.species}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 font-semibold mt-2">
                                    ⚠️ This pot is empty - cannot move
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Destination Pot Selection */}
                <div>
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
                        <div className="mt-2 border border-gray-300 rounded max-h-48 overflow-y-auto bg-white shadow-lg">
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
                                        {pot.current_plant ? (
                                            <span className="text-orange-600 font-semibold"> • Occupied: {pot.current_plant.name}</span>
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
                            {destPot.current_plant && (
                                <p className="text-sm text-orange-600 font-semibold mt-2">
                                    ⚠️ Warning: Currently occupied by {destPot.current_plant.name}
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

                {/* Notes */}
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

                {/* Buttons */}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading || !sourcePot || !destPot}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Moving Plant...' : 'Move Plant'}
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
