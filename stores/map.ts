import { create } from "zustand";
import type { City, Place, PlaceSearchParams } from "@/types";
import { MapDefaults } from "@/constants/theme";

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapState {
  city: City;
  region: MapRegion;
  selectedPlace: Place | null;
  filters: Omit<PlaceSearchParams, "lat" | "lng" | "page" | "limit">;
  isSheetOpen: boolean;

  setCity: (city: City) => void;
  setRegion: (region: MapRegion) => void;
  selectPlace: (place: Place | null) => void;
  setFilters: (filters: Partial<MapState["filters"]>) => void;
  clearFilters: () => void;
  setSheetOpen: (open: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  city: "dubai",
  region: MapDefaults.dubai,
  selectedPlace: null,
  filters: {},
  isSheetOpen: false,

  setCity: (city) =>
    set({
      city,
      region: MapDefaults[city],
      selectedPlace: null,
      isSheetOpen: false,
    }),

  setRegion: (region) => set({ region }),

  selectPlace: (place) =>
    set({ selectedPlace: place, isSheetOpen: place !== null }),

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setSheetOpen: (isSheetOpen) => set({ isSheetOpen }),
}));
