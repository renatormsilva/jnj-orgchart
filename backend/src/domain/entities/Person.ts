// ============================================
// Person Types - Domain Layer
// ============================================

import { PersonStatus, PersonType } from '../valueObjects';

/**
 * Base person properties from database
 */
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

/**
 * Person with manager and direct reports included
 */
export interface PersonWithRelations extends PersonProps {
  manager: PersonProps | null;
  directReports: PersonProps[];
}

/**
 * Data required to create a new person
 */
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

/**
 * Data for updating an existing person (all fields optional)
 */
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
