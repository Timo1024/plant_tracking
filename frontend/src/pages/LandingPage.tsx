import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, potAPI, soilAPI } from '../services/api';
import { Plant, Pot } from '../types';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPlants: 0,
        activePlants: 0,
        removedPlants: 0,
        totalPots: 0,
        occupiedPots: 0,
        emptyPots: 0,
        totalSoils: 0,
    });
    const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
    const [recentPots, setRecentPots] = useState<Pot[]>([]);
    const [loading, setLoading] = useState(true);

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

            const plants = plantsRes.data;
            const pots = potsRes.data;
            const soils = soilsRes.data;

            // Calculate statistics
            const activePlants = plants.filter(p => p.status === 'active');
            const occupiedPots = pots.filter(p => p.current_plant || (p.current_plants && p.current_plants.length > 0));

            setStats({
                totalPlants: plants.length,
                activePlants: activePlants.length,
                removedPlants: plants.filter(p => p.status === 'removed').length,
                totalPots: pots.length,
                occupiedPots: occupiedPots.length,
                emptyPots: pots.length - occupiedPots.length,
                totalSoils: soils.length,
            });

            // Get recent plants (last 6 active plants)
            setRecentPlants(activePlants.slice(0, 6));

            // Get recent pots (last 6 pots)
            setRecentPots(pots.slice(0, 6));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const StatCard: React.FC<{ title: string; value: number; subtitle?: string; color: string; icon: string }> = ({
        title,
        value,
        subtitle,
        color,
        icon,
    }) => (
        <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
                    {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className="text-3xl sm:text-4xl">{icon}</div>
            </div>
        </div>
    );

    const ActionCard: React.FC<{ title: string; description: string; icon: string; onClick: () => void; color: string }> = ({
        title,
        description,
        icon,
        onClick,
        color,
    }) => (
        <button
            onClick={onClick}
            // className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left w-full border-t-4 ${color} hover:scale-103 transform transition-transform`} // scale-105
            className={`bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg hover:scale-103 transform transition-all duration-300 ease-out text-left w-full border-t-4 ${color}`}
        >
            <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="text-3xl sm:text-4xl">{icon}</div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 sm:p-8 text-white">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">🌱 Plant Tracker</h1>
                <p className="text-base sm:text-lg opacity-90">
                    Manage your plant collection with ease. Track plants, pots, soils, and movements all in one place.
                </p>
            </div>

            {/* Statistics Grid */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Overview</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        title="Total Plants"
                        value={stats.totalPlants}
                        subtitle={`${stats.activePlants} active, ${stats.removedPlants} removed`}
                        color="border-green-500"
                        icon="🌿"
                    />
                    <StatCard
                        title="Active Plants"
                        value={stats.activePlants}
                        subtitle="Currently growing"
                        color="border-emerald-500"
                        icon="🌱"
                    />
                    <StatCard
                        title="Total Pots"
                        value={stats.totalPots}
                        subtitle={`${stats.occupiedPots} occupied, ${stats.emptyPots} empty`}
                        color="border-amber-500"
                        icon="🪴"
                    />
                    <StatCard
                        title="Soil Mixes"
                        value={stats.totalSoils}
                        subtitle="Available recipes"
                        color="border-brown-500"
                        icon="🌾"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <ActionCard
                        title="View All Plants"
                        description="Browse your complete plant collection"
                        icon="🌿"
                        onClick={() => navigate('/plants')}
                        color="border-green-500"
                    />
                    <ActionCard
                        title="Add New Plant"
                        description="Register a new plant in your collection"
                        icon="➕"
                        onClick={() => navigate('/add-plant')}
                        color="border-blue-500"
                    />
                    <ActionCard
                        title="Move Plant"
                        description="Transfer a plant to a different pot"
                        icon="↔️"
                        onClick={() => navigate('/move')}
                        color="border-purple-500"
                    />
                    <ActionCard
                        title="Manage Pots"
                        description="View and organize your pot inventory"
                        icon="🪴"
                        onClick={() => navigate('/pots')}
                        color="border-amber-500"
                    />
                    <ActionCard
                        title="Add New Pot"
                        description="Add a new pot with QR code"
                        icon="🏺"
                        onClick={() => navigate('/add-pot')}
                        color="border-orange-500"
                    />
                    <ActionCard
                        title="Soil Recipes"
                        description="Manage your soil mix compositions"
                        icon="🌾"
                        onClick={() => navigate('/soils')}
                        color="border-yellow-600"
                    />
                </div>
            </div>

            {/* Recent Plants Preview */}
            {recentPlants.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Recent Plants</h2>
                        <button
                            onClick={() => navigate('/plants')}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentPlants.map((plant) => (
                            <div
                                key={plant.id}
                                onClick={() => navigate(`/plants/${plant.id}`)}
                                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <h3 className="font-semibold text-lg text-gray-800">{plant.name}</h3>
                                <p className="text-sm text-gray-600 italic">
                                    {plant.genus} {plant.species}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                        {plant.size}
                                    </span>
                                    {plant.current_pot && (
                                        <span className="text-xs text-gray-500">
                                            📍 {plant.current_pot.room}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Pots Preview */}
            {recentPots.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Recent Pots</h2>
                        <button
                            onClick={() => navigate('/pots')}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentPots.map((pot) => {
                            const hasPlant = pot.current_plant || (pot.current_plants && pot.current_plants.length > 0);
                            const plantCount = pot.current_plants?.length || (pot.current_plant ? 1 : 0);

                            return (
                                <div
                                    key={pot.id}
                                    onClick={() => navigate(`/pot/${pot.qr_code_id}`)}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                QR: {pot.qr_code_id}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                📍 {pot.room} • {pot.size}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${hasPlant
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {hasPlant ? `${plantCount} plant${plantCount > 1 ? 's' : ''}` : 'Empty'}
                                        </span>
                                    </div>
                                    {hasPlant && pot.current_plant && (
                                        <p className="text-sm text-gray-700 mt-2">
                                            🌱 {pot.current_plant.name}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
