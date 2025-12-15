import { useQuery } from '@tanstack/react-query';
import { peopleApi } from '../api/endpoints';
import { PersonFilters } from '../types/person';
import { QUERY_KEYS } from '../utils/constants';

export function usePeople(filters: PersonFilters = {}, page: number = 1, limit: number = 25) {
  return useQuery({
    queryKey: [QUERY_KEYS.PEOPLE, filters, page, limit],
    queryFn: () => peopleApi.getPeople(filters, page, limit),
    staleTime: 5 * 60 * 1000, 
  });
}

export function usePerson(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.PERSON, id],
    queryFn: () => peopleApi.getPerson(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManagementChain(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.MANAGEMENT_CHAIN, id],
    queryFn: () => peopleApi.getManagementChain(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHierarchy() {
  return useQuery({
    queryKey: [QUERY_KEYS.HIERARCHY],
    queryFn: () => peopleApi.getHierarchy(),
    staleTime: 10 * 60 * 1000, 
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => peopleApi.getDepartments(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useManagers() {
  return useQuery({
    queryKey: [QUERY_KEYS.MANAGERS],
    queryFn: () => peopleApi.getManagers(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: [QUERY_KEYS.STATISTICS],
    queryFn: () => peopleApi.getStatistics(),
    staleTime: 5 * 60 * 1000,
  });
}
