// ============================================
// Value Objects - Domain Layer
// ============================================

/**
 * Type of person in the organization
 */
export enum PersonType {
  Employee = 'Employee',
  Partner = 'Partner',
}

/**
 * Current status of a person
 */
export enum PersonStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}
