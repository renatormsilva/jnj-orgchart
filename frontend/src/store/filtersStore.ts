import { create } from 'zustand';
import { PersonFilters } from '../types/person';

interface FiltersState {
  filters: PersonFilters;
  page: number;
  limit: number;
  setFilters: (filters: Partial<PersonFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialFilters: PersonFilters = {
  search: '',
  department: undefined,
  managerId: undefined,
  type: undefined,
  status: undefined,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initialFilters,
  page: 1,
  limit: 25,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset to page 1 when filters change
    })),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  resetFilters: () => set({ filters: initialFilters, page: 1 }),
}));
