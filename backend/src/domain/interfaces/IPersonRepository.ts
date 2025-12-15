import {
  PersonProps,
  PersonWithRelations,
  CreatePersonProps,
  UpdatePersonProps,
} from '../entities/Person';
import { PersonStatus, PersonType } from '../valueObjects';
import { PaginationParams, PaginatedResponse, SortParams } from '../../shared/types';

export interface PersonFilter {
  search?: string;
  department?: string;
  managerId?: number | null;
  type?: PersonType;
  status?: PersonStatus;
}

export type PersonSortField = 'name' | 'jobTitle' | 'department' | 'createdAt' | 'updatedAt';

export interface FindAllOptions {
  pagination?: PaginationParams;
  filter?: PersonFilter;
  sort?: SortParams<PersonSortField>;
}

export interface DepartmentCount {
  name: string;
  count: number;
}

export interface IPersonRepository {
  findAll(options?: FindAllOptions): Promise<PaginatedResponse<PersonProps>>;
  findById(id: number): Promise<PersonProps | null>;
  findByIdWithRelations(id: number): Promise<PersonWithRelations | null>;
  findDirectReports(managerId: number): Promise<PersonProps[]>;
  findManagementChain(personId: number): Promise<PersonProps[]>;
  findRootPerson(): Promise<PersonProps | null>;
  getHierarchyTree(rootId?: number): Promise<HierarchyNode>;
  getDepartments(): Promise<string[]>;
  getDepartmentsWithCount(): Promise<DepartmentCount[]>;
  getManagers(): Promise<(PersonProps & { directReportsCount: number })[]>;
  create(data: CreatePersonProps): Promise<PersonProps>;
  update(id: number, data: UpdatePersonProps): Promise<PersonProps>;
  delete(id: number): Promise<PersonProps>;
  exists(id: number): Promise<boolean>;
  count(filter?: PersonFilter): Promise<number>;
}

export interface HierarchyNode {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  photoPath: string | null;
  type: PersonType;
  status: PersonStatus;
  children: HierarchyNode[];
}
