import { IPersonRepository } from '../../domain/interfaces/IPersonRepository';
import { PersonProps, CreatePersonProps, UpdatePersonProps } from '../../domain/entities/Person';
import { PersonStatus, PersonType } from '../../domain/valueObjects';
import { PaginatedResponse } from '../../shared/types';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../config/logger';
import { PersonEvents, EventMetadata } from './EventService';

export interface GetPeopleQuery {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  managerId?: number | null;
  type?: PersonType;
  status?: PersonStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PersonResponse {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  managerId: number | null;
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

export interface PersonDetailResponse extends PersonResponse {
  manager: PersonResponse | null;
  directReports: PersonResponse[];
}

export interface ManagerResponse extends PersonResponse {
  directReportsCount: number;
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

export interface Statistics {
  totalPeople: number;
  totalEmployees: number;
  totalPartners: number;
  totalActive: number;
  totalInactive: number;
  departments: Array<{ name: string; count: number }>;
}

export class PersonService {
  constructor(private readonly repository: IPersonRepository) {}

  async getAll(query: GetPeopleQuery): Promise<PaginatedResponse<PersonResponse>> {
    const result = await this.repository.findAll({
      pagination: { page: query.page, limit: query.limit },
      filter: {
        search: query.search,
        department: query.department,
        managerId: query.managerId ?? undefined,
        type: query.type,
        status: query.status,
      },
      sort: query.sortBy
        ? {
            field: query.sortBy as 'name' | 'jobTitle' | 'department' | 'createdAt' | 'updatedAt',
            direction: query.sortOrder ?? 'asc',
          }
        : undefined,
    });

    return {
      ...result,
      data: result.data.map(p => this.toResponse(p)),
    };
  }

  async getById(id: number): Promise<PersonDetailResponse> {
    const person = await this.repository.findByIdWithRelations(id);

    if (!person) {
      throw new NotFoundError('Person', id);
    }

    return {
      ...this.toResponse(person),
      manager: person.manager ? this.toResponse(person.manager) : null,
      directReports: person.directReports.map(p => this.toResponse(p)),
    };
  }

  async getManagementChain(personId: number): Promise<PersonResponse[]> {
    const exists = await this.repository.exists(personId);
    if (!exists) {
      throw new NotFoundError('Person', personId);
    }

    const chain = await this.repository.findManagementChain(personId);
    return chain.map(p => this.toResponse(p));
  }

  async getHierarchy(rootId?: number): Promise<HierarchyNode> {
    return this.repository.getHierarchyTree(rootId);
  }

  async getDepartments(): Promise<string[]> {
    return this.repository.getDepartments();
  }

  async getManagers(): Promise<ManagerResponse[]> {
    const managers = await this.repository.getManagers();
    return managers.map(p => ({
      ...this.toResponse(p),
      directReportsCount: p.directReportsCount,
    }));
  }

  async getStatistics(): Promise<Statistics> {
    const [totalPeople, totalEmployees, totalPartners, totalActive, totalInactive, departments] =
      await Promise.all([
        this.repository.count(),
        this.repository.count({ type: PersonType.Employee }),
        this.repository.count({ type: PersonType.Partner }),
        this.repository.count({ status: PersonStatus.Active }),
        this.repository.count({ status: PersonStatus.Inactive }),
        this.repository.getDepartments(),
      ]);

    // Get count per department
    const departmentCounts = await Promise.all(
      departments.map(async dept => ({
        name: dept,
        count: await this.repository.count({ department: dept }),
      }))
    );

    return {
      totalPeople,
      totalEmployees,
      totalPartners,
      totalActive,
      totalInactive,
      departments: departmentCounts,
    };
  }

  async create(data: CreatePersonProps, metadata?: EventMetadata): Promise<PersonResponse> {
    // Validate manager exists if provided
    if (data.managerId) {
      const managerExists = await this.repository.exists(data.managerId);
      if (!managerExists) {
        throw new NotFoundError('Manager', data.managerId);
      }
    }

    const person = await this.repository.create(data);
    logger.info({ personId: person.id }, 'Person created');

    // Publish event
    await PersonEvents.created(person, metadata);

    return this.toResponse(person);
  }

  async update(
    id: number,
    data: UpdatePersonProps,
    metadata?: EventMetadata
  ): Promise<PersonResponse> {
    // Check person exists
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundError('Person', id);
    }

    // Validate manager if changing
    if (data.managerId !== undefined && data.managerId !== null) {
      if (data.managerId === id) {
        throw new ValidationError('A person cannot be their own manager');
      }

      const managerExists = await this.repository.exists(data.managerId);
      if (!managerExists) {
        throw new NotFoundError('Manager', data.managerId);
      }

      // Check circular reference
      const chain = await this.repository.findManagementChain(data.managerId);
      if (chain.some(p => p.id === id)) {
        throw new ValidationError('This manager assignment would create a circular reference');
      }
    }

    const person = await this.repository.update(id, data);
    logger.info({ personId: person.id }, 'Person updated');

    // Publish events
    await PersonEvents.updated(id, { before: { ...current }, after: { ...person } }, metadata);

    // Check for specific changes and publish specialized events
    if (data.managerId !== undefined && data.managerId !== current.managerId) {
      await PersonEvents.managerChanged(id, current.managerId, data.managerId, metadata);
    }

    if (data.status !== undefined && data.status !== current.status) {
      await PersonEvents.statusChanged(id, current.status, data.status, metadata);
    }

    return this.toResponse(person);
  }

  async delete(id: number, metadata?: EventMetadata): Promise<void> {
    // Get person data before deletion for event payload
    const person = await this.repository.findById(id);
    if (!person) {
      throw new NotFoundError('Person', id);
    }

    await this.repository.delete(id);
    logger.info({ personId: id }, 'Person deleted');

    // Publish event with deleted person data
    await PersonEvents.deleted(id, { ...person }, metadata);
  }

  private toResponse(person: PersonProps): PersonResponse {
    return {
      id: person.id,
      name: person.name,
      jobTitle: person.jobTitle,
      department: person.department,
      managerId: person.managerId,
      photoPath: person.photoPath,
      type: person.type,
      status: person.status,
      email: person.email,
      phone: person.phone,
      location: person.location,
      hireDate: person.hireDate?.toISOString() ?? null,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };
  }
}
