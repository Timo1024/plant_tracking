import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { plantAPI } from '../services/api';
import { Plant } from '../types';
import CustomSelect from '../components/CustomSelect';
import AutocompleteInput from '../components/AutocompleteInput';

const EditPlantForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        family: '',
        genus: '',
        species: '',
        species2: '',
        variation: '',
        size: 'small' as 'seedling' | 'small' | 'medium' | 'large' | 'giant',
        notes: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get unique values for autocomplete suggestions
    const getUniqueSuggestions = (field: keyof Plant): string[] => {
        const values = plants
            .map(plant => plant[field])
            .filter((value): value is string => typeof value === 'string' && value.trim() !== '');
        return [...new Set(values)].sort();
    };

    useEffect(() => {
        if (id) {
            fetchPlant(parseInt(id));
        }
        fetchAllPlants();
    }, [id]);

    const fetchAllPlants = async () => {
        try {
            const response = await plantAPI.getAll();
            setPlants(response.data);
        } catch (err) {
            console.error('Failed to fetch plants for suggestions:', err);
        }
    };

    const fetchPlant = async (plantId: number) => {
        try {
            setLoading(true);
            const response = await plantAPI.getById(plantId);
            const plant = response.data;

            setFormData({
                name: plant.name,
                family: plant.family,
                genus: plant.genus,
                species: plant.species,
                species2: plant.species2 || '',
                variation: plant.variation || '',
                size: plant.size,
                notes: plant.notes || '',
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch plant details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const dataToSubmit = {
                ...formData,
                species2: formData.species2 || undefined,
                variation: formData.variation || undefined,
                notes: formData.notes || undefined,
            };

            await plantAPI.update(parseInt(id!), dataToSubmit);
            navigate(`/plants/${id}`);
        } catch (err) {
            setError('Failed to update plant. Please check all fields.');
            console.error(err);
        } finally {
            setSaving(false);
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

    if (loading) {
        return <div className="text-center py-12">Loading plant details...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Plant</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-4 sm:px-8 pt-6 pb-8" autoComplete="off">
                {/* Plant Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Plant Name *
                    </label>
                    <AutocompleteInput
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(value) => setFormData({ ...formData, name: value })}
                        suggestions={getUniqueSuggestions('name')}
                    />
                </div>

                {/* Family */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="family">
                        Family *
                    </label>
                    <AutocompleteInput
                        id="family"
                        name="family"
                        value={formData.family}
                        onChange={(value) => setFormData({ ...formData, family: value })}
                        suggestions={getUniqueSuggestions('family')}
                    />
                </div>

                {/* Genus */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="genus">
                        Genus *
                    </label>
                    <AutocompleteInput
                        id="genus"
                        name="genus"
                        value={formData.genus}
                        onChange={(value) => setFormData({ ...formData, genus: value })}
                        suggestions={getUniqueSuggestions('genus')}
                        placeholder="e.g., Monstera"
                    />
                </div>

                {/* Species */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="species">
                        Species *
                    </label>
                    <AutocompleteInput
                        id="species"
                        name="species"
                        value={formData.species}
                        onChange={(value) => setFormData({ ...formData, species: value })}
                        suggestions={getUniqueSuggestions('species')}
                        placeholder="e.g., deliciosa"
                    />
                </div>

                {/* Species 2 (Optional) */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="species2">
                        Species 2 (Optional)
                    </label>
                    <AutocompleteInput
                        id="species2"
                        name="species2"
                        value={formData.species2}
                        onChange={(value) => setFormData({ ...formData, species2: value })}
                        suggestions={getUniqueSuggestions('species2')}
                        placeholder="Second species name if hybrid"
                    />
                </div>

                {/* Variation (Optional) */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="variation">
                        Variation (Optional)
                    </label>
                    <AutocompleteInput
                        id="variation"
                        name="variation"
                        value={formData.variation}
                        onChange={(value) => setFormData({ ...formData, variation: value })}
                        suggestions={getUniqueSuggestions('variation')}
                        placeholder="e.g., variegata, albo"
                    />
                </div>

                {/* Size */}
                <div className="mb-4">
                    <CustomSelect
                        label="Size"
                        icon="📏"
                        required
                        value={formData.size}
                        onChange={(value) => setFormData({ ...formData, size: value as 'seedling' | 'small' | 'medium' | 'large' | 'giant' })}
                        placeholder="Select plant size"
                        options={[
                            { value: 'seedling', label: 'Seedling', icon: '🌱' },
                            { value: 'small', label: 'Small', icon: '🪴' },
                            { value: 'medium', label: 'Medium', icon: '🌿' },
                            { value: 'large', label: 'Large', icon: '🌳' },
                            { value: 'giant', label: 'Giant', icon: '🏔️' }
                        ]}
                    />
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                        Notes (Optional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                        placeholder="Additional notes about the plant..."
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/plants/${id}`)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPlantForm;
