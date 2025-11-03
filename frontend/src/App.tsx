import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PlantDetail from './pages/PlantDetail';
import PotDetail from './pages/PotDetail';
import PotList from './pages/PotList';
import AddPlantForm from './pages/AddPlantForm';
import AddPotForm from './pages/AddPotForm';
import EditPlantForm from './pages/EditPlantForm';
import MovePlantForm from './pages/MovePlantForm';
import SoilList from './pages/SoilList';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/plants" element={<Dashboard />} />
                        <Route path="/plants/:id" element={<PlantDetail />} />
                        <Route path="/plants/:id/edit" element={<EditPlantForm />} />
                        <Route path="/pot/:qrCodeId" element={<PotDetail />} />
                        <Route path="/pots" element={<PotList />} />
                        <Route path="/add-plant" element={<AddPlantForm />} />
                        <Route path="/add-pot" element={<AddPotForm />} />
                        <Route path="/move" element={<MovePlantForm />} />
                        <Route path="/soils" element={<SoilList />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
