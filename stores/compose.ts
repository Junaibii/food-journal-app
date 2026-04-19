import { create } from "zustand";
import type { Place } from "@/types";

export interface LocalPhoto {
  uri: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/heic";
  width: number;
  height: number;
  caption?: string;
}

interface ComposeState {
  place: Place | null;
  rating: number | null;
  body: string;
  visitDate: string | null; // YYYY-MM-DD
  photos: LocalPhoto[];

  setPlace: (place: Place | null) => void;
  setRating: (rating: number | null) => void;
  setBody: (body: string) => void;
  setVisitDate: (date: string | null) => void;
  addPhoto: (photo: LocalPhoto) => void;
  removePhoto: (uri: string) => void;
  updatePhotoCaption: (uri: string, caption: string) => void;
  reset: () => void;
}

const initialState = {
  place: null,
  rating: null,
  body: "",
  visitDate: null,
  photos: [],
};

export const useComposeStore = create<ComposeState>((set) => ({
  ...initialState,

  setPlace: (place) => set({ place }),
  setRating: (rating) => set({ rating }),
  setBody: (body) => set({ body }),
  setVisitDate: (visitDate) => set({ visitDate }),

  addPhoto: (photo) =>
    set((s) => ({
      photos: s.photos.length < 3 ? [...s.photos, photo] : s.photos,
    })),

  removePhoto: (uri) =>
    set((s) => ({ photos: s.photos.filter((p) => p.uri !== uri) })),

  updatePhotoCaption: (uri, caption) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.uri === uri ? { ...p, caption } : p)),
    })),

  reset: () => set(initialState),
}));
