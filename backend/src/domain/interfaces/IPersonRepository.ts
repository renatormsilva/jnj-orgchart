// ============================================
// Person Repository Interface - Domain Layer
// ============================================

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

export interface IPersonRepository {
  /**
   * Find all people with optional filtering, pagination, and sorting
   */
  findAll(options?: FindAllOptions): Promise<PaginatedResponse<PersonProps>>;

  /**
   * Find a person by ID
   */
  findById(id: number): Promise<PersonProps | null>;

  /**
   * Find a person by ID with manager and direct reports
   */
  findByIdWithRelations(id: number): Promise<PersonWithRelations | null>;

  /**
   * Find all direct reports of a person
   */
  findDirectReports(managerId: number): Promise<PersonProps[]>;

  /**
   * Find the management chain (path to top)
   */
  findManagementChain(personId: number): Promise<PersonProps[]>;

  /**
   * Find the root person (top of hierarchy)
   */
  findRootPerson(): Promise<PersonProps | null>;

  /**
   * Get full hierarchy tree starting from a person
   */
  getHierarchyTree(rootId?: number): Promise<HierarchyNode>;

  /**
   * Get all unique departments
   */
  getDepartments(): Promise<string[]>;

  /**
   * Get all managers (people who have direct reports)
   */
  getManagers(): Promise<PersonProps[]>;

  /**
   * Create a new person
   */
  create(data: CreatePersonProps): Promise<PersonProps>;

  /**
   * Update a person
   */
  update(id: number, data: UpdatePersonProps): Promise<PersonProps>;

  /**
   * Delete a person
   */
  delete(id: number): Promise<PersonProps>;

  /**
   * Check if a person exists
   */
  exists(id: number): Promise<boolean>;

  /**
   * Count total people with optional filter
   */
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
