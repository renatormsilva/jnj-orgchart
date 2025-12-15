import React from 'react';
import { Search, X } from 'lucide-react';
import { PersonType, PersonStatus } from '../../types/person';
import { useFiltersStore } from '../../store/filtersStore';
import { useDepartments, useManagers } from '../../hooks/usePeople';
import { Button } from '../common/Button';
import { useDebounce } from '../../hooks/useDebounce';

export const PersonFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFiltersStore();
  const { data: departments, isLoading: isLoadingDepartments } = useDepartments();
  const { data: managers, isLoading: isLoadingManagers } = useManagers();

  const [searchInput, setSearchInput] = React.useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  React.useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const hasActiveFilters =
    filters.search ||
    filters.department ||
    filters.managerId ||
    filters.type ||
    filters.status;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4" role="search" aria-label="Filter people">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-jnj-gray-900">
          Find Your Team
        </h2>
        {hasActiveFilters && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              resetFilters();
              setSearchInput('');
            }}
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">
            Search people
          </label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jnj-gray-700" aria-hidden="true" />
          <input
            id="search-input"
            type="text"
            placeholder="Find a colleague by name, role, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-jnj-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-jnj-red focus:border-transparent"
            aria-label="Search people by name, job title, or email"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department-filter" className="block text-sm font-medium text-jnj-gray-900 mb-1">
            Department
          </label>
          <select
            id="department-filter"
            value={filters.department || ''}
            onChange={(e) =>
              setFilters({ department: e.target.value || undefined })
            }
            disabled={isLoadingDepartments}
            className="w-full px-3 py-2 border border-jnj-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-jnj-red focus:border-transparent disabled:bg-jnj-gray-100 disabled:cursor-wait"
            aria-label="Filter by department"
          >
            <option value="">
              {isLoadingDepartments ? 'Loading departments...' : 'All Departments'}
            </option>
            {departments?.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name} ({dept.count})
              </option>
            ))}
          </select>
        </div>

        {/* Manager */}
        <div>
          <label htmlFor="manager-filter" className="block text-sm font-medium text-jnj-gray-900 mb-1">
            Manager
          </label>
          <select
            id="manager-filter"
            value={filters.managerId || ''}
            onChange={(e) =>
              setFilters({ managerId: e.target.value || undefined })
            }
            disabled={isLoadingManagers}
            className="w-full px-3 py-2 border border-jnj-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-jnj-red focus:border-transparent disabled:bg-jnj-gray-100 disabled:cursor-wait"
            aria-label="Filter by manager"
          >
            <option value="">
              {isLoadingManagers ? 'Loading managers...' : 'All Managers'}
            </option>
            {managers?.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} - {manager.jobTitle} ({manager.directReportsCount})
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <fieldset>
          <legend className="block text-sm font-medium text-jnj-gray-900 mb-2">
            Type
          </legend>
          <div className="space-y-2" role="radiogroup" aria-label="Filter by person type">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={!filters.type}
                onChange={() => setFilters({ type: undefined })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show all types"
              />
              <span>All</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filters.type === PersonType.EMPLOYEE}
                onChange={() => setFilters({ type: PersonType.EMPLOYEE })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show employees only"
              />
              <span>Employee</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filters.type === PersonType.PARTNER}
                onChange={() => setFilters({ type: PersonType.PARTNER })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show partners only"
              />
              <span>Partner</span>
            </label>
          </div>
        </fieldset>

        {/* Status */}
        <fieldset>
          <legend className="block text-sm font-medium text-jnj-gray-900 mb-2">
            Status
          </legend>
          <div className="space-y-2" role="radiogroup" aria-label="Filter by person status">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={!filters.status}
                onChange={() => setFilters({ status: undefined })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show all statuses"
              />
              <span>All</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filters.status === PersonStatus.ACTIVE}
                onChange={() => setFilters({ status: PersonStatus.ACTIVE })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show active people only"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={filters.status === PersonStatus.INACTIVE}
                onChange={() => setFilters({ status: PersonStatus.INACTIVE })}
                className="mr-2 text-jnj-red focus:ring-jnj-red focus:ring-2 focus:ring-offset-2"
                aria-label="Show inactive people only"
              />
              <span>Inactive</span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
};
