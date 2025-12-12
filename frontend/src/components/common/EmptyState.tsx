import React from 'react';
import { Users, Search, AlertCircle, FileQuestion } from 'lucide-react';
import { Button } from './Button';

export type EmptyStateType = 'no-results' | 'no-data' | 'error' | 'not-found';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
}) => {
  const illustrations = {
    'no-results': (
      <Search className="w-24 h-24 text-jnj-gray-400" strokeWidth={1.5} />
    ),
    'no-data': (
      <Users className="w-24 h-24 text-jnj-gray-400" strokeWidth={1.5} />
    ),
    error: (
      <AlertCircle className="w-24 h-24 text-red-400" strokeWidth={1.5} />
    ),
    'not-found': (
      <FileQuestion className="w-24 h-24 text-jnj-gray-400" strokeWidth={1.5} />
    ),
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex items-center justify-center w-32 h-32 rounded-full bg-jnj-gray-100 mb-6">
        {illustrations[type]}
      </div>

      <h3 className="text-2xl font-display font-bold text-jnj-gray-900 mb-2 text-center">
        {title}
      </h3>

      <p className="text-jnj-gray-700 text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const NoSearchResults: React.FC<{ onClearFilters?: () => void }> = ({
  onClearFilters,
}) => (
  <EmptyState
    type="no-results"
    title="Let's Broaden the Search"
    description="We haven't found anyone matching your criteria yet. Try adjusting your filters or search term to connect with more of our team."
    action={
      onClearFilters
        ? {
            label: 'Clear Filters',
            onClick: onClearFilters,
          }
        : undefined
    }
  />
);

export const NoPeopleData: React.FC<{ onRefresh?: () => void }> = ({
  onRefresh,
}) => (
  <EmptyState
    type="no-data"
    title="Our Community Awaits"
    description="We're building our team directory. Check back soon to explore our growing community of talented people."
    action={
      onRefresh
        ? {
            label: 'Refresh',
            onClick: onRefresh,
          }
        : undefined
    }
  />
);

export const ErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    type="error"
    title="We Hit a Bump"
    description="Something unexpected happened while connecting to our services. Let's give it another try."
    action={
      onRetry
        ? {
            label: 'Try Again',
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export const NotFoundState: React.FC<{ onGoHome?: () => void }> = ({
  onGoHome,
}) => (
  <EmptyState
    type="not-found"
    title="Let's Find Your Way"
    description="The page you're looking for seems to have moved. Let us help you get back on track."
    action={
      onGoHome
        ? {
            label: 'Back to Home',
            onClick: onGoHome,
          }
        : undefined
    }
  />
);
