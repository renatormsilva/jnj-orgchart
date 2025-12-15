import React, { useState } from 'react';
import { PersonTable } from '../components/people/PersonTable';
import { PersonFilters } from '../components/people/PersonFilters';
import { PersonDetails } from '../components/people/PersonDetails';
import { TableSkeleton } from '../components/common/Skeleton';
import { NoSearchResults, ErrorState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { usePeople } from '../hooks/usePeople';
import { useFiltersStore } from '../store/filtersStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGINATION_OPTIONS } from '../utils/constants';

export const PeopleList: React.FC = () => {
  const { filters, page, limit, setPage, setLimit, resetFilters } = useFiltersStore();
  const { data, isLoading, error, refetch } = usePeople(filters, page, limit);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  if (error) {
    return (
      <div className="py-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-jnj-gray-900">
          Our Team
        </h1>
        {data?.data && (
          <p className="text-sm sm:text-base text-jnj-gray-700">
            {data.data.length} of {data.pagination.total} team members
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PersonFilters />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <TableSkeleton rows={10} />
          ) : data?.data && data.data.length > 0 ? (
            <>
              <PersonTable
                people={data.data}
                onPersonClick={(person) => setSelectedPersonId(person.id)}
              />

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-jnj-gray-700">Show</span>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="px-3 py-1 border border-jnj-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-jnj-red"
                    >
                      {PAGINATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-jnj-gray-700">per page</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-jnj-gray-700">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <NoSearchResults onClearFilters={resetFilters} />
            </div>
          )}
        </div>
      </div>

      {selectedPersonId && (
        <PersonDetails
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onPersonChange={(newPersonId) => setSelectedPersonId(newPersonId)}
        />
      )}
    </div>
  );
};
