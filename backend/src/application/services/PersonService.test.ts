import { PersonService, GetPeopleQuery } from './PersonService';
import { IPersonRepository, HierarchyNode } from '../../domain/interfaces/IPersonRepository';
import { PersonProps, PersonWithRelations, CreatePersonProps } from '../../domain/entities/Person';
import { PersonType, PersonStatus } from '../../domain/valueObjects';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { PaginatedResponse } from '../../shared/types';

// Mock EventService to avoid database calls during tests
jest.mock('./EventService', () => ({
  PersonEvents: {
    created: jest.fn().mockResolvedValue(undefined),
    updated: jest.fn().mockResolvedValue(undefined),
    deleted: jest.fn().mockResolvedValue(undefined),
    managerChanged: jest.fn().mockResolvedValue(undefined),
    statusChanged: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockPerson: PersonProps = {
  id: 1,
  name: 'John Doe',
  jobTitle: 'Developer',
  department: 'Engineering',
  managerId: null,
  photoPath: '/photos/1.jpg',
  type: PersonType.Employee,
  status: PersonStatus.Active,
  email: 'john@test.com',
  phone: '123456789',
  location: 'New York',
  hireDate: new Date('2023-01-15'),
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2023-01-15'),
};

const mockPersonWithRelations: PersonWithRelations = {
  ...mockPerson,
  manager: null,
  directReports: [],
};

const mockHierarchy: HierarchyNode = {
  id: 1,
  name: 'John Doe',
  jobTitle: 'CEO',
  department: 'Executive',
  photoPath: '/photos/1.jpg',
  type: PersonType.Employee,
  status: PersonStatus.Active,
  children: [],
};

const createMockRepository = (): jest.Mocked<IPersonRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIdWithRelations: jest.fn(),
  findDirectReports: jest.fn(),
  findManagementChain: jest.fn(),
  findRootPerson: jest.fn(),
  getHierarchyTree: jest.fn(),
  getDepartments: jest.fn(),
  getDepartmentsWithCount: jest.fn(),
  getManagers: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  count: jest.fn(),
});

describe('PersonService', () => {
  let service: PersonService;
  let mockRepository: jest.Mocked<IPersonRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new PersonService(mockRepository);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated list of people', async () => {
      const mockResponse: PaginatedResponse<PersonProps> = {
        data: [mockPerson],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
      mockRepository.findAll.mockResolvedValue(mockResponse);

      const query: GetPeopleQuery = { page: 1, limit: 10 };
      const result = await service.getAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('John Doe');
      expect(result.pagination.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should apply filters correctly', async () => {
      const mockResponse: PaginatedResponse<PersonProps> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
      mockRepository.findAll.mockResolvedValue(mockResponse);

      const query: GetPeopleQuery = {
        page: 1,
        limit: 10,
        department: 'Engineering',
        type: PersonType.Employee,
        status: PersonStatus.Active,
        search: 'John',
      };
      await service.getAll(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            department: 'Engineering',
            type: PersonType.Employee,
            status: PersonStatus.Active,
            search: 'John',
          }),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return person with relations', async () => {
      mockRepository.findByIdWithRelations.mockResolvedValue(mockPersonWithRelations);

      const result = await service.getById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.manager).toBeNull();
      expect(result.directReports).toEqual([]);
    });

    it('should throw NotFoundError when person does not exist', async () => {
      mockRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getManagementChain', () => {
    it('should return management chain', async () => {
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.findManagementChain.mockResolvedValue([mockPerson]);

      const result = await service.getManagementChain(1);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
    });

    it('should throw NotFoundError when person does not exist', async () => {
      mockRepository.exists.mockResolvedValue(false);

      await expect(service.getManagementChain(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getHierarchy', () => {
    it('should return hierarchy tree', async () => {
      mockRepository.getHierarchyTree.mockResolvedValue(mockHierarchy);

      const result = await service.getHierarchy();

      expect(result.id).toBe(1);
      expect(result.children).toEqual([]);
    });

    it('should accept optional rootId', async () => {
      mockRepository.getHierarchyTree.mockResolvedValue(mockHierarchy);

      await service.getHierarchy(5);

      expect(mockRepository.getHierarchyTree).toHaveBeenCalledWith(5);
    });
  });

  describe('getDepartments', () => {
    it('should return unique departments', async () => {
      mockRepository.getDepartments.mockResolvedValue(['Engineering', 'Sales', 'HR']);

      const result = await service.getDepartments();

      expect(result).toEqual(['Engineering', 'Sales', 'HR']);
    });
  });

  describe('getManagers', () => {
    it('should return list of managers with directReportsCount', async () => {
      mockRepository.getManagers.mockResolvedValue([{ ...mockPerson, directReportsCount: 5 }]);

      const result = await service.getManagers();

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('John Doe');
      expect(result[0]?.directReportsCount).toBe(5);
    });
  });

  describe('getStatistics', () => {
    it('should return organization statistics', async () => {
      mockRepository.count.mockResolvedValueOnce(100);
      mockRepository.count.mockResolvedValueOnce(80);
      mockRepository.count.mockResolvedValueOnce(20);
      mockRepository.count.mockResolvedValueOnce(90);
      mockRepository.count.mockResolvedValueOnce(10);
      mockRepository.getDepartmentsWithCount.mockResolvedValue([
        { name: 'Engineering', count: 50 },
        { name: 'Sales', count: 50 },
      ]);

      const result = await service.getStatistics();

      expect(result.totalPeople).toBe(100);
      expect(result.totalEmployees).toBe(80);
      expect(result.totalPartners).toBe(20);
      expect(result.totalActive).toBe(90);
      expect(result.totalInactive).toBe(10);
      expect(result.departments).toHaveLength(2);
      expect(result.departments[0]).toEqual({ name: 'Engineering', count: 50 });
    });
  });

  describe('create', () => {
    it('should create a new person', async () => {
      mockRepository.create.mockResolvedValue(mockPerson);

      const data: CreatePersonProps = {
        name: 'John Doe',
        jobTitle: 'Developer',
        department: 'Engineering',
      };
      const result = await service.create(data);

      expect(result.name).toBe('John Doe');
      expect(mockRepository.create).toHaveBeenCalledWith(data);
    });

    it('should validate manager exists when managerId is provided', async () => {
      mockRepository.exists.mockResolvedValue(false);

      const data: CreatePersonProps = {
        name: 'Jane Doe',
        jobTitle: 'Developer',
        department: 'Engineering',
        managerId: 999,
      };

      await expect(service.create(data)).rejects.toThrow(NotFoundError);
    });

    it('should create person with valid manager', async () => {
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue({ ...mockPerson, managerId: 2 });

      const data: CreatePersonProps = {
        name: 'Jane Doe',
        jobTitle: 'Developer',
        department: 'Engineering',
        managerId: 2,
      };
      const result = await service.create(data);

      expect(result.managerId).toBe(2);
    });
  });

  describe('update', () => {
    it('should update an existing person', async () => {
      mockRepository.findById.mockResolvedValue(mockPerson);
      mockRepository.update.mockResolvedValue({ ...mockPerson, name: 'Jane Doe' });

      const result = await service.update(1, { name: 'Jane Doe' });

      expect(result.name).toBe('Jane Doe');
    });

    it('should throw NotFoundError when person does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when setting self as manager', async () => {
      mockRepository.findById.mockResolvedValue(mockPerson);

      await expect(service.update(1, { managerId: 1 })).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when new manager does not exist', async () => {
      mockRepository.findById.mockResolvedValue(mockPerson);
      mockRepository.exists.mockResolvedValue(false);

      await expect(service.update(1, { managerId: 999 })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError on circular reference', async () => {
      mockRepository.findById.mockResolvedValue(mockPerson);
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.findManagementChain.mockResolvedValue([
        { ...mockPerson, id: 3 },
        { ...mockPerson, id: 1 },
      ]);

      await expect(service.update(1, { managerId: 3 })).rejects.toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should delete an existing person', async () => {
      mockRepository.findById.mockResolvedValue(mockPerson);
      mockRepository.delete.mockResolvedValue(mockPerson);

      await expect(service.delete(1)).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when person does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
    });
  });
});
