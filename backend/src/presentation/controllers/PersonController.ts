import { FastifyRequest, FastifyReply } from 'fastify';
import { PersonService, GetPeopleQuery } from '../../application/services/PersonService';
import { personRepository } from '../../infrastructure/repositories/PrismaPersonRepository';
import { PersonType, PersonStatus } from '../../domain/valueObjects';
import { CreatePersonProps, UpdatePersonProps } from '../../domain/entities/Person';

const personService = new PersonService(personRepository);

interface ListQuerystring {
  page?: string;
  limit?: string;
  search?: string;
  department?: string;
  managerId?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface IdParams {
  id: string;
}

interface HierarchyQuerystring {
  rootId?: string;
}

export class PersonController {
  async getAll(
    request: FastifyRequest<{ Querystring: ListQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const query: GetPeopleQuery = {
      page: Math.max(1, parseInt(request.query.page ?? '1', 10)),
      limit: Math.min(100, Math.max(1, parseInt(request.query.limit ?? '10', 10))),
      search: request.query.search,
      department: request.query.department,
      managerId: this.parseManagerId(request.query.managerId),
      type: request.query.type as PersonType | undefined,
      status: request.query.status as PersonStatus | undefined,
      sortBy: request.query.sortBy,
      sortOrder: (request.query.sortOrder as 'asc' | 'desc') ?? 'asc',
    };

    const result = await personService.getAll(query);

    reply.status(200).send({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  }

  async getById(request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply): Promise<void> {
    const id = parseInt(request.params.id, 10);
    const person = await personService.getById(id);

    reply.status(200).send({
      success: true,
      data: person,
      timestamp: new Date().toISOString(),
    });
  }

  async getManagementChain(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const id = parseInt(request.params.id, 10);
    const chain = await personService.getManagementChain(id);

    reply.status(200).send({
      success: true,
      data: chain,
      timestamp: new Date().toISOString(),
    });
  }

  async getHierarchy(
    request: FastifyRequest<{ Querystring: HierarchyQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const rootId = request.query.rootId ? parseInt(request.query.rootId, 10) : undefined;
    const hierarchy = await personService.getHierarchy(rootId);

    reply.status(200).send({
      success: true,
      data: hierarchy,
      timestamp: new Date().toISOString(),
    });
  }

  async getDepartments(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const departments = await personService.getDepartments();

    reply.status(200).send({
      success: true,
      data: departments,
      timestamp: new Date().toISOString(),
    });
  }

  async getManagers(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const managers = await personService.getManagers();

    reply.status(200).send({
      success: true,
      data: managers,
      timestamp: new Date().toISOString(),
    });
  }

  async getStatistics(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const stats = await personService.getStatistics();

    reply.status(200).send({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  }

  async create(
    request: FastifyRequest<{ Body: CreatePersonProps }>,
    reply: FastifyReply
  ): Promise<void> {
    const person = await personService.create(request.body);

    reply.status(201).send({
      success: true,
      data: person,
      timestamp: new Date().toISOString(),
    });
  }

  async update(
    request: FastifyRequest<{ Params: IdParams; Body: UpdatePersonProps }>,
    reply: FastifyReply
  ): Promise<void> {
    const id = parseInt(request.params.id, 10);
    const person = await personService.update(id, request.body);

    reply.status(200).send({
      success: true,
      data: person,
      timestamp: new Date().toISOString(),
    });
  }

  async delete(request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply): Promise<void> {
    const id = parseInt(request.params.id, 10);
    await personService.delete(id);

    reply.status(204).send();
  }

  private parseManagerId(value?: string): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === 'null') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
}

export const personController = new PersonController();
