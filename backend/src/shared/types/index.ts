export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export type SortDirection = 'asc' | 'desc';

export interface SortParams<T extends string = string> {
  field: T;
  direction: SortDirection;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
