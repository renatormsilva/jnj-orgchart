import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-jnj-gray-100 via-jnj-gray-400 to-jnj-gray-100 bg-[length:200%_100%]';

  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
            aria-label="Loading..."
          />
        ))}
      </>
    );
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      aria-label="Loading..."
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-jnj-gray-400">
        <thead className="bg-jnj-gray-100">
          <tr>
            {['Photo', 'Name', 'Job Title', 'Department', 'Type', 'Status'].map((header) => (
              <th
                key={header}
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-jnj-gray-900 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-jnj-gray-400">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton variant="circular" width={40} height={40} />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton width="80%" height={16} className="mb-2" />
                <Skeleton width="60%" height={12} />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton width="70%" />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton width="60%" />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={24} className="rounded-full" />
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <Skeleton width={80} height={24} className="rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-jnj-gray-400 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton width="60%" height={24} className="mb-2" />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton count={3} className="mb-2" />
      <div className="flex space-x-2 mt-4">
        <Skeleton width={100} height={36} />
        <Skeleton width={100} height={36} />
      </div>
    </div>
  );
};

export const HierarchyNodeSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Main CEO Card Skeleton - Minimalist */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 min-w-[280px]">
        <div className="flex items-start gap-3">
          <Skeleton variant="circular" width={64} height={64} />
          <div className="flex-1">
            <Skeleton width="80%" height={16} className="mb-2" />
            <Skeleton width="60%" height={12} className="mb-2" />
            <Skeleton width="50%" height={10} />
          </div>
        </div>
      </div>

      {/* Child Nodes Skeleton */}
      <div className="flex space-x-12">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 w-[220px]">
            <div className="flex items-start gap-2">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton width="100%" height={12} className="mb-1" />
                <Skeleton width="80%" height={10} className="mb-1" />
                <Skeleton width="60%" height={8} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
