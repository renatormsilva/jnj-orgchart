import { PersonStatus, PersonType } from '../valueObjects';

export interface PersonProps {
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
  hireDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonWithRelations extends PersonProps {
  manager: PersonProps | null;
  directReports: PersonProps[];
}

export interface CreatePersonProps {
  name: string;
  jobTitle: string;
  department: string;
  managerId?: number | null;
  photoPath?: string | null;
  type?: PersonType;
  status?: PersonStatus;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  hireDate?: Date | null;
}

export interface UpdatePersonProps {
  name?: string;
  jobTitle?: string;
  department?: string;
  managerId?: number | null;
  photoPath?: string | null;
  type?: PersonType;
  status?: PersonStatus;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  hireDate?: Date | null;
}
