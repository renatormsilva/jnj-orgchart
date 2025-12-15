import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import {
  IPersonRepository,
  PersonFilter,
  FindAllOptions,
  HierarchyNode,
} from '../../domain/interfaces/IPersonRepository';
import {
  PersonProps,
  PersonWithRelations,
  CreatePersonProps,
  UpdatePersonProps,
} from '../../domain/entities/Person';
import { PersonStatus, PersonType } from '../../domain/valueObjects';
import { PaginatedResponse } from '../../shared/types';
import { createPaginatedResponse, getOffset } from '../../shared/utils/helpers';
import { NotFoundError, DatabaseError } from '../../shared/errors/AppError';
import { logger } from '../../config/logger';

// Infer Person type from Prisma client
type PrismaPerson = NonNullable<Awaited<ReturnType<typeof prisma.person.findFirst>>>;

export class PrismaPersonRepository implements IPersonRepository {
  private buildWhereClause(filter?: PersonFilter): Prisma.PersonWhereInput {
    const where: Prisma.PersonWhereInput = {};

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { jobTitle: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.department) {
      where.department = filter.department;
    }

    if (filter?.managerId !== undefined) {
      where.managerId = filter.managerId;
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    return where;
  }

  private mapToPersonProps(person: PrismaPerson): PersonProps {
    return {
      id: person.id,
      name: person.name,
      jobTitle: person.jobTitle,
      department: person.department,
      managerId: person.managerId,
      photoPath: person.photoPath,
      type: person.type as PersonType,
      status: person.status as PersonStatus,
      email: person.email,
      phone: person.phone,
      location: person.location,
      hireDate: person.hireDate,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<PersonProps>> {
    try {
      const pagination = options?.pagination ?? { page: 1, limit: 10 };
      const where = this.buildWhereClause(options?.filter);

      const orderBy: Prisma.PersonOrderByWithRelationInput = options?.sort
        ? { [options.sort.field]: options.sort.direction }
        : { name: 'asc' };

      const [people, total] = await Promise.all([
        prisma.person.findMany({
          where,
          orderBy,
          skip: getOffset(pagination),
          take: pagination.limit,
        }),
        prisma.person.count({ where }),
      ]);

      return createPaginatedResponse(
        people.map(p => this.mapToPersonProps(p)),
        total,
        pagination
      );
    } catch (error) {
      logger.error({ error }, 'Failed to fetch people');
      throw new DatabaseError('Failed to fetch people');
    }
  }

  async findById(id: number): Promise<PersonProps | null> {
    try {
      const person = await prisma.person.findUnique({
        where: { id },
      });

      return person ? this.mapToPersonProps(person) : null;
    } catch (error) {
      logger.error({ id, error }, 'Failed to fetch person by ID');
      throw new DatabaseError(`Failed to fetch person with ID ${id}`);
    }
  }

  async findByIdWithRelations(id: number): Promise<PersonWithRelations | null> {
    try {
      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          manager: true,
          directReports: {
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!person) return null;

      return {
        ...this.mapToPersonProps(person),
        manager: person.manager ? this.mapToPersonProps(person.manager) : null,
        directReports: person.directReports.map(p => this.mapToPersonProps(p)),
      };
    } catch (error) {
      logger.error({ id, error }, 'Failed to fetch person with relations');
      throw new DatabaseError(`Failed to fetch person with ID ${id}`);
    }
  }

  async findDirectReports(managerId: number): Promise<PersonProps[]> {
    try {
      const reports = await prisma.person.findMany({
        where: { managerId },
        orderBy: { name: 'asc' },
      });

      return reports.map(p => this.mapToPersonProps(p));
    } catch (error) {
      logger.error({ managerId, error }, 'Failed to fetch direct reports');
      throw new DatabaseError('Failed to fetch direct reports');
    }
  }

  async findManagementChain(personId: number): Promise<PersonProps[]> {
    try {
      const chain: PersonProps[] = [];
      let currentId: number | null = personId;

      while (currentId !== null) {
        // eslint-disable-next-line no-await-in-loop
        const result = await this.findById(currentId);

        if (!result) break;

        if (result.id !== personId) {
          chain.push(result);
        }

        currentId = result.managerId;
      }

      return chain;
    } catch (error) {
      logger.error({ personId, error }, 'Failed to fetch management chain');
      throw new DatabaseError('Failed to fetch management chain');
    }
  }

  async findRootPerson(): Promise<PersonProps | null> {
    try {
      const root = await prisma.person.findFirst({
        where: { managerId: null },
      });

      return root ? this.mapToPersonProps(root) : null;
    } catch (error) {
      logger.error({ error }, 'Failed to fetch root person');
      throw new DatabaseError('Failed to fetch root person');
    }
  }

  async getHierarchyTree(rootId?: number): Promise<HierarchyNode> {
    try {
      // If no rootId provided, find the root person
      let startId = rootId;
      if (!startId) {
        const root = await this.findRootPerson();
        if (!root) {
          throw new NotFoundError('Root person');
        }
        startId = root.id;
      }

      // Recursive function to build the tree
      const buildTree = async (personId: number): Promise<HierarchyNode> => {
        const person = await prisma.person.findUnique({
          where: { id: personId },
          include: {
            directReports: {
              orderBy: { name: 'asc' },
            },
          },
        });

        if (!person) {
          throw new NotFoundError('Person', personId);
        }

        const children = await Promise.all(
          person.directReports.map(report => buildTree(report.id))
        );

        return {
          id: person.id,
          name: person.name,
          jobTitle: person.jobTitle,
          department: person.department,
          photoPath: person.photoPath,
          type: person.type as PersonType,
          status: person.status as PersonStatus,
          children,
        };
      };

      return buildTree(startId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error({ rootId, error }, 'Failed to build hierarchy tree');
      throw new DatabaseError('Failed to build hierarchy tree');
    }
  }

  async getDepartments(): Promise<string[]> {
    try {
      const departments = await prisma.person.findMany({
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' },
      });

      return departments.map(d => d.department);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch departments');
      throw new DatabaseError('Failed to fetch departments');
    }
  }

  async getDepartmentsWithCount(): Promise<{ name: string; count: number }[]> {
    try {
      const departments = await prisma.person.groupBy({
        by: ['department'],
        _count: { department: true },
        orderBy: { department: 'asc' },
      });

      return departments.map(d => ({
        name: d.department,
        count: d._count.department,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch departments with count');
      throw new DatabaseError('Failed to fetch departments with count');
    }
  }

  async getManagers(): Promise<(PersonProps & { directReportsCount: number })[]> {
    try {
      const managers = await prisma.person.findMany({
        where: {
          directReports: {
            some: {},
          },
        },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { directReports: true },
          },
        },
      });

      return managers.map(p => ({
        ...this.mapToPersonProps(p),
        directReportsCount: p._count.directReports,
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch managers');
      throw new DatabaseError('Failed to fetch managers');
    }
  }

  async create(data: CreatePersonProps): Promise<PersonProps> {
    try {
      const person = await prisma.person.create({
        data: {
          name: data.name,
          jobTitle: data.jobTitle,
          department: data.department,
          managerId: data.managerId ?? null,
          photoPath: data.photoPath ?? null,
          type: data.type ?? PersonType.Employee,
          status: data.status ?? PersonStatus.Active,
          email: data.email ?? null,
          phone: data.phone ?? null,
          location: data.location ?? null,
          hireDate: data.hireDate ?? null,
        },
      });

      logger.info({ personId: person.id, name: person.name }, 'Person created');

      return this.mapToPersonProps(person);
    } catch (error) {
      logger.error({ data, error }, 'Failed to create person');
      throw new DatabaseError('Failed to create person');
    }
  }

  async update(id: number, data: UpdatePersonProps): Promise<PersonProps> {
    try {
      const person = await prisma.person.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
          ...(data.department !== undefined && { department: data.department }),
          ...(data.managerId !== undefined && { managerId: data.managerId }),
          ...(data.photoPath !== undefined && { photoPath: data.photoPath }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.hireDate !== undefined && { hireDate: data.hireDate }),
        },
      });

      logger.info({ personId: person.id }, 'Person updated');

      return this.mapToPersonProps(person);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundError('Person', id);
      }
      logger.error({ id, data, error }, 'Failed to update person');
      throw new DatabaseError(`Failed to update person with ID ${id}`);
    }
  }

  async delete(id: number): Promise<PersonProps> {
    try {
      // First, update all direct reports to have no manager
      await prisma.person.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      });

      // Then delete the person
      const person = await prisma.person.delete({
        where: { id },
      });

      logger.info({ personId: person.id, name: person.name }, 'Person deleted');

      return this.mapToPersonProps(person);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundError('Person', id);
      }
      logger.error({ id, error }, 'Failed to delete person');
      throw new DatabaseError(`Failed to delete person with ID ${id}`);
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const count = await prisma.person.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error({ id, error }, 'Failed to check person existence');
      throw new DatabaseError('Failed to check person existence');
    }
  }

  async count(filter?: PersonFilter): Promise<number> {
    try {
      const where = this.buildWhereClause(filter);
      return await prisma.person.count({ where });
    } catch (error) {
      logger.error({ filter, error }, 'Failed to count people');
      throw new DatabaseError('Failed to count people');
    }
  }
}

// Singleton instance
export const personRepository = new PrismaPersonRepository();
