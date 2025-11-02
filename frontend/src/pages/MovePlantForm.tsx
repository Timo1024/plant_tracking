import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, potAPI, soilAPI, historyAPI } from '../services/api';
import { Plant, Pot, Soil } from '../types';

const MovePlantForm: React.FC = () => {
    const navigate = useNavigate();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [pots, setPots] = useState<Pot[]>([]);
    const [soils, setSoils] = useState<Soil[]>([]);
    const [formData, setFormData] = useState({
        plant_id: '',
        pot_id: '',
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
            const [plantsRes, potsRes, soilsRes] = await Promise.all([
                plantAPI.getAll(),
                potAPI.getAll(),
                soilAPI.getAll(),
            ]);
            setPlants(plantsRes.data.filter((p) => p.status === 'active'));
            setPots(potsRes.data.filter((p) => p.active));
            setSoils(soilsRes.data);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await historyAPI.movePlant({
                plant_id: parseInt(formData.plant_id),
                pot_id: parseInt(formData.pot_id),
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

    const selectedPlant = plants.find((p) => p.id === parseInt(formData.plant_id));

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Move / Repot Plant</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Plant *
                    </label>
                    <select
                        name="plant_id"
                        required
                        value={formData.plant_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- Choose a plant --</option>
                        {plants.map((plant) => (
                            <option key={plant.id} value={plant.id}>
                                {plant.name} ({plant.genus} {plant.species})
                                {plant.current_pot && ` - Currently in ${plant.current_pot.room}`}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPlant && selectedPlant.current_pot && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Currently in: <strong>{selectedPlant.current_pot.room}</strong> (
                            {selectedPlant.current_pot.size})
                        </p>
                        {selectedPlant.current_soil && (
                            <p className="text-sm text-yellow-800">
                                Soil: <strong>{selectedPlant.current_soil.name}</strong>
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select New Pot *
                    </label>
                    <select
                        name="pot_id"
                        required
                        value={formData.pot_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- Choose a pot --</option>
                        {pots.map((pot) => (
                            <option key={pot.id} value={pot.id}>
                                {pot.room} - {pot.size}
                                {pot.current_plant && ` (currently has ${pot.current_plant.name})`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Soil Mix *
                    </label>
                    <select
                        name="soil_id"
                        required
                        value={formData.soil_id}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- Choose a soil mix --</option>
                        {soils.map((soil) => (
                            <option key={soil.id} value={soil.id}>
                                {soil.name} ({soil.composition})
                            </option>
                        ))}
                    </select>
                </div>

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
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Root-bound, repotted with new fertilizer..."
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                        ℹ️ Moving this plant will automatically close its previous pot record and create
                        a new entry in its history.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Moving...' : 'Move Plant'}
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

export default MovePlantForm;
