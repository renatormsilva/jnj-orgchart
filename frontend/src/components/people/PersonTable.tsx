import React, { useState } from 'react';
import { Person } from '../../types/person';
import { Badge } from '../common/Badge';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getPersonPhotoUrl } from '../../utils/avatar';

interface PersonTableProps {
  people: Person[];
  onPersonClick: (person: Person) => void;
}

type SortField = 'name' | 'jobTitle' | 'department';
type SortDirection = 'asc' | 'desc';

export const PersonTable: React.FC<PersonTableProps> = ({ people, onPersonClick }) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPeople = [...people].sort((a, b) => {
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="sm:hidden bg-jnj-gray-100 px-4 py-2 text-xs text-jnj-gray-700 text-center border-b border-jnj-gray-400">
        Swipe left to see more →
      </div>

      <table className="min-w-full divide-y divide-jnj-gray-400">
        <thead className="bg-jnj-gray-100">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider">
              Photo
            </th>
            <th
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider cursor-pointer hover:bg-jnj-gray-400"
              onClick={() => handleSort('name')}
              aria-label="Sort by name"
            >
              <div className="flex items-center">
                Name
                <SortIcon field="name" />
              </div>
            </th>
            <th
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider cursor-pointer hover:bg-jnj-gray-400"
              onClick={() => handleSort('jobTitle')}
              aria-label="Sort by job title"
            >
              <div className="flex items-center">
                Job Title
                <SortIcon field="jobTitle" />
              </div>
            </th>
            <th
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider cursor-pointer hover:bg-jnj-gray-400"
              onClick={() => handleSort('department')}
              aria-label="Sort by department"
            >
              <div className="flex items-center">
                Department
                <SortIcon field="department" />
              </div>
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider">
              Type
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-jnj-gray-400">
          {sortedPeople.map((person) => (
            <tr
              key={person.id}
              onClick={() => onPersonClick(person)}
              className="hover:bg-jnj-gray-100 cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPersonClick(person);
                }
              }}
              aria-label={`View details for ${person.name}`}
            >
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <img
                  src={getPersonPhotoUrl(person.photoPath, person.id, person.name)}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(person.id)}&backgroundColor=f0f0f0`;
                  }}
                />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-jnj-gray-900">{person.name}</div>
                {person.email && (
                  <div className="text-xs sm:text-sm text-jnj-gray-700 truncate max-w-[150px] sm:max-w-none">{person.email}</div>
                )}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-jnj-gray-900">{person.jobTitle}</div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-jnj-gray-900">{person.department}</div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Badge type="type" value={person.type} />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Badge type="status" value={person.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
