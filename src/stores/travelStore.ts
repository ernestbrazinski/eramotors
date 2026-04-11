import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Place } from "@/src/types/places";

type TravelState = {
  selectedCarId: string | null;
  route: Place[];
  setCarId: (id: string | null) => void;
  /** Set selected car without toggle (e.g. Select onChange) */
  pickCarId: (id: string | null) => void;
  togglePlace: (place: Place) => void;
  removeFromRoute: (idx: number) => void;
  setRoute: (route: Place[]) => void;
  clearAll: () => void;
};

export const useTravelStore = create<TravelState>((set) => ({
  selectedCarId: null,
  route: [],
  setCarId: (id) =>
    set((s) => ({ selectedCarId: s.selectedCarId === id ? null : id })),
  pickCarId: (id) => set({ selectedCarId: id }),
  togglePlace: (place) =>
    set((s) => {
      const exists = s.route.some((p) => p.id === place.id);
      return {
        route: exists ? s.route.filter((p) => p.id !== place.id) : [...s.route, place],
      };
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
      pickCarId: s.pickCarId,
      togglePlace: s.togglePlace,
      removeFromRoute: s.removeFromRoute,
      setRoute: s.setRoute,
      clearAll: s.clearAll,
    }))
  );
}
