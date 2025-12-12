import React from 'react';
import { PersonType, PersonStatus } from '../../types/person';

interface BadgeProps {
  type: 'status' | 'type';
  value: PersonStatus | PersonType;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const getStatusStyles = (status: PersonStatus) => {
    switch (status) {
      case PersonStatus.ACTIVE:
        return 'bg-jnj-accent-green-light text-jnj-accent-green-dark border border-jnj-accent-green';
      case PersonStatus.INACTIVE:
        return 'bg-jnj-gray-100 text-jnj-gray-700 border border-jnj-gray-400';
      default:
        return 'bg-jnj-gray-100 text-jnj-gray-700 border border-jnj-gray-400';
    }
  };

  const getTypeStyles = (personType: PersonType) => {
    switch (personType) {
      case PersonType.EMPLOYEE:
        return 'bg-jnj-accent-blue-light text-jnj-accent-blue-dark border border-jnj-accent-blue';
      case PersonType.PARTNER:
        return 'bg-jnj-accent-purple-light text-jnj-accent-purple-dark border border-jnj-accent-purple';
      default:
        return 'bg-jnj-gray-100 text-jnj-gray-700 border border-jnj-gray-400';
    }
  };

  const styles = type === 'status'
    ? getStatusStyles(value as PersonStatus)
    : getTypeStyles(value as PersonType);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {value}
    </span>
  );
};
