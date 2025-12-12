import { act } from '@testing-library/react';
import { useFiltersStore } from './filtersStore';
import { PersonType, PersonStatus } from '../types/person';

describe('filtersStore', () => {
  beforeEach(() => {
    useFiltersStore.setState({
      filters: {
        search: '',
        department: undefined,
        managerId: undefined,
        type: undefined,
        status: undefined,
      },
      page: 1,
      limit: 25,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useFiltersStore.getState();

      expect(state.filters.search).toBe('');
      expect(state.filters.department).toBeUndefined();
      expect(state.filters.managerId).toBeUndefined();
      expect(state.filters.type).toBeUndefined();
      expect(state.filters.status).toBeUndefined();
      expect(state.page).toBe(1);
      expect(state.limit).toBe(25);
    });
  });

  describe('setFilters', () => {
    it('should update search filter', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ search: 'John' });
      });

      expect(useFiltersStore.getState().filters.search).toBe('John');
    });

    it('should update department filter', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ department: 'Engineering' });
      });

      expect(useFiltersStore.getState().filters.department).toBe('Engineering');
    });

    it('should update type filter', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ type: PersonType.EMPLOYEE });
      });

      expect(useFiltersStore.getState().filters.type).toBe(PersonType.EMPLOYEE);
    });

    it('should update status filter', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ status: PersonStatus.ACTIVE });
      });

      expect(useFiltersStore.getState().filters.status).toBe(PersonStatus.ACTIVE);
    });

    it('should update managerId filter', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ managerId: '123' });
      });

      expect(useFiltersStore.getState().filters.managerId).toBe('123');
    });

    it('should merge filters without overwriting others', () => {
      act(() => {
        useFiltersStore.getState().setFilters({ search: 'John' });
        useFiltersStore.getState().setFilters({ department: 'HR' });
      });

      const state = useFiltersStore.getState();
      expect(state.filters.search).toBe('John');
      expect(state.filters.department).toBe('HR');
    });

    it('should reset page to 1 when filters change', () => {
      act(() => {
        useFiltersStore.getState().setPage(5);
      });

      expect(useFiltersStore.getState().page).toBe(5);

      act(() => {
        useFiltersStore.getState().setFilters({ search: 'test' });
      });

      expect(useFiltersStore.getState().page).toBe(1);
    });
  });

  describe('setPage', () => {
    it('should update page number', () => {
      act(() => {
        useFiltersStore.getState().setPage(3);
      });

      expect(useFiltersStore.getState().page).toBe(3);
    });

    it('should allow setting page to 1', () => {
      act(() => {
        useFiltersStore.getState().setPage(5);
        useFiltersStore.getState().setPage(1);
      });

      expect(useFiltersStore.getState().page).toBe(1);
    });
  });

  describe('setLimit', () => {
    it('should update limit', () => {
      act(() => {
        useFiltersStore.getState().setLimit(50);
      });

      expect(useFiltersStore.getState().limit).toBe(50);
    });

    it('should reset page to 1 when limit changes', () => {
      act(() => {
        useFiltersStore.getState().setPage(5);
        useFiltersStore.getState().setLimit(10);
      });

      expect(useFiltersStore.getState().page).toBe(1);
      expect(useFiltersStore.getState().limit).toBe(10);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to initial state', () => {
      act(() => {
        useFiltersStore.getState().setFilters({
          search: 'test',
          department: 'HR',
          type: PersonType.PARTNER,
          status: PersonStatus.INACTIVE,
          managerId: '456',
        });
        useFiltersStore.getState().setPage(10);
      });

      act(() => {
        useFiltersStore.getState().resetFilters();
      });

      const state = useFiltersStore.getState();
      expect(state.filters.search).toBe('');
      expect(state.filters.department).toBeUndefined();
      expect(state.filters.type).toBeUndefined();
      expect(state.filters.status).toBeUndefined();
      expect(state.filters.managerId).toBeUndefined();
      expect(state.page).toBe(1);
    });

    it('should not reset limit', () => {
      act(() => {
        useFiltersStore.getState().setLimit(50);
        useFiltersStore.getState().resetFilters();
      });

      expect(useFiltersStore.getState().limit).toBe(50);
    });
  });
});
