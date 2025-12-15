export enum PersonType {
  EMPLOYEE = 'Employee',
  PARTNER = 'Partner',
}

export enum PersonStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface Person {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  managerId: string | null;
  photoPath: string | null;
  type: PersonType;
  status: PersonStatus;
  email: string | null;
  phone: string | null;
  location: string | null;
  hireDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonWithRelations extends Person {
  manager: Person | null;
  directReports: Person[];
}

export interface HierarchyNode extends Omit<Person, 'managerId' | 'createdAt' | 'updatedAt'> {
  children: HierarchyNode[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PersonFilters {
  search?: string;
  department?: string;
  managerId?: string;
  type?: PersonType;
  status?: PersonStatus;
}

export interface Department {
  name: string;
  count: number;
}

export interface Manager {
  id: string;
  name: string;
  jobTitle: string;
  directReportsCount: number;
}

export interface Statistics {
  totalPeople: number;
  totalEmployees: number;
  totalPartners: number;
  totalActive: number;
  totalInactive: number;
  departments: Department[];
}
