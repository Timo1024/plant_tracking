export interface Plant {
    id: number;
    name: string;
    family: string;
    genus: string;
    species: string;
    species2?: string;
    variation?: string;
    size: 'seedling' | 'small' | 'medium' | 'large' | 'giant';
    status: 'active' | 'removed';
    removed_reason?: string;
    date_added: string;
    notes?: string;
    current_pot?: Pot;
    current_soil?: Soil;
    history?: PlantPotHistory[];
}

export interface Pot {
    id: number;
    qr_code_id: string;
    room: string;
    size: string;
    notes?: string;
    active: boolean;
    current_plant?: Plant;  // First plant (for backwards compatibility)
    current_plants?: Plant[];  // All plants in this pot
    current_soil?: Soil;
    start_date?: string;
}

export interface Soil {
    id: number;
    name: string;
    composition: string;
}

export interface PlantPotHistory {
    id: number;
    plant_id: number;
    pot_id: number;
    soil_id: number;
    start_date: string;
    end_date?: string;
    notes?: string;
    plant?: Plant;
    pot?: Pot;
    soil?: Soil;
}

export interface MoveRequest {
    plant_id: number;
    pot_id: number;
    soil_id: number;
    start_date?: string;
    notes?: string;
}
