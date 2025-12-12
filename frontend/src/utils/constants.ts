export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const COLORS = {
  JNJ_RED: '#EB1700',
  JNJ_WHITE: '#FFFFFF',
  JNJ_GRAY_900: '#000000',
  JNJ_GRAY_700: '#666666',
  JNJ_GRAY_400: '#D9D9D9',
  JNJ_GRAY_100: '#F2F2F2',
};

export const PAGINATION_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

export const QUERY_KEYS = {
  PEOPLE: 'people',
  PERSON: 'person',
  HIERARCHY: 'hierarchy',
  DEPARTMENTS: 'departments',
  MANAGERS: 'managers',
  STATISTICS: 'statistics',
  MANAGEMENT_CHAIN: 'management-chain',
};

export const ROUTES = {
  HOME: '/',
  PEOPLE: '/people',
  HIERARCHY: '/hierarchy',
};
