import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { potAPI } from '../services/api';
import { Pot } from '../types';

const PotDetail: React.FC = () => {
    const { qrCodeId } = useParams<{ qrCodeId: string }>();
    const [pot, setPot] = useState<Pot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (qrCodeId) {
            fetchPot(qrCodeId);
        }
    }, [qrCodeId]);

    const fetchPot = async (id: string) => {
        try {
            setLoading(true);
            const response = await potAPI.getByQRCode(id);
            setPot(response.data);
            setError(null);
        } catch (err) {
            setError('Pot not found');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading pot details...</div>;
    }

    if (error || !pot) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error || 'Pot not found'}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">
                    🪴 Pot Details
                </h1>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-600">QR Code ID</p>
                        <p className="text-2xl font-mono">{pot.qr_code_id}</p>
                    </div>

                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-2xl">{pot.room}</p>
                    </div>

                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-600">Pot Size</p>
                        <p className="text-2xl">{pot.size}</p>
                    </div>

                    {pot.notes && (
                        <div className="border-b pb-4">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-700">{pot.notes}</p>
                        </div>
                    )}

                    {pot.current_plant ? (
                        <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-500">
                            <h2 className="text-2xl font-bold text-green-800 mb-4">
                                🌱 Current Plant
                            </h2>
                            <div className="space-y-2">
                                <p className="text-xl font-semibold">{pot.current_plant.name}</p>
                                <p className="italic text-gray-700">
                                    {pot.current_plant.genus} {pot.current_plant.species}
                                    {pot.current_plant.species2 && ` × ${pot.current_plant.species2}`}
                                </p>
                                <p className="text-gray-600">
                                    Family: {pot.current_plant.family}
                                </p>
                                <p className="text-gray-600 capitalize">
                                    Size: {pot.current_plant.size}
                                </p>
                                {pot.current_soil && (
                                    <div className="mt-4 pt-4 border-t border-green-200">
                                        <p className="text-sm text-gray-600">Soil Mix</p>
                                        <p className="font-semibold">{pot.current_soil.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {pot.current_soil.composition}
                                        </p>
                                    </div>
                                )}
                                {pot.start_date && (
                                    <p className="text-sm text-gray-600 mt-4">
                                        Potted on: {new Date(pot.start_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-center">
                                This pot is currently empty
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PotDetail;
