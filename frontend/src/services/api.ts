import axios from 'axios';
import { Plant, Pot, Soil, PlantPotHistory, MoveRequest } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Plant API
export const plantAPI = {
    getAll: () => api.get<Plant[]>('/plants'),
    getById: (id: number) => api.get<Plant>(`/plants/${id}`),
    create: (plant: Partial<Plant>) => api.post<Plant>('/plants', plant),
    update: (id: number, plant: Partial<Plant>) => api.put<Plant>(`/plants/${id}`, plant),
    remove: (id: number, reason: string) => api.delete<Plant>(`/plants/${id}`, { data: { removed_reason: reason } }),
};

// Pot API
export const potAPI = {
    getAll: () => api.get<Pot[]>('/pots'),
    getByQRCode: (qrCodeId: string) => api.get<Pot>(`/pots/${qrCodeId}`),
    create: (pot: Partial<Pot>) => api.post<Pot>('/pots', pot),
    update: (id: number, pot: Partial<Pot>) => api.put<Pot>(`/pots/${id}`, pot),
};

// Soil API
export const soilAPI = {
    getAll: () => api.get<Soil[]>('/soils'),
    create: (soil: Partial<Soil>) => api.post<Soil>('/soils', soil),
    update: (id: number, soil: Partial<Soil>) => api.put<Soil>(`/soils/${id}`, soil),
};

// History / Movement API
export const historyAPI = {
    getPlantHistory: (plantId: number) => api.get<PlantPotHistory[]>(`/history/${plantId}`),
    movePlant: (moveRequest: MoveRequest) => api.post<Plant>('/move', moveRequest),
};
