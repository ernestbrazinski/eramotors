import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Place } from "@/src/types/places";

type TravelState = {
  selectedCarId: string | null;
  route: Place[];
  setCarId: (id: string | null) => void;
  togglePlace: (place: Place) => void;
  moveUp: (idx: number) => void;
  moveDown: (idx: number) => void;
  removeFromRoute: (idx: number) => void;
  setRoute: (route: Place[]) => void;
  clearAll: () => void;
};

export const useTravelStore = create<TravelState>((set) => ({
  selectedCarId: null,
  route: [],
  setCarId: (id) =>
    set((s) => ({ selectedCarId: s.selectedCarId === id ? null : id })),
  togglePlace: (place) =>
    set((s) => {
      const exists = s.route.some((p) => p.id === place.id);
      return {
        route: exists ? s.route.filter((p) => p.id !== place.id) : [...s.route, place],
      };
    }),
  moveUp: (idx) =>
    set((s) => {
      if (idx === 0) return s;
      const next = [...s.route];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { route: next };
    }),
  moveDown: (idx) =>
    set((s) => {
      if (idx === s.route.length - 1) return s;
      const next = [...s.route];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { route: next };
    }),
  removeFromRoute: (idx) =>
    set((s) => ({ route: s.route.filter((_, i) => i !== idx) })),
  setRoute: (route) => set({ route }),
  clearAll: () => set({ selectedCarId: null, route: [] }),
}));

export function useTravel() {
  return useTravelStore(
    useShallow((s) => ({
      selectedCarId: s.selectedCarId,
      route: s.route,
      hasSelection: s.selectedCarId !== null || s.route.length > 0,
      setCarId: s.setCarId,
      togglePlace: s.togglePlace,
      moveUp: s.moveUp,
      moveDown: s.moveDown,
      removeFromRoute: s.removeFromRoute,
      setRoute: s.setRoute,
      clearAll: s.clearAll,
    }))
  );
}
