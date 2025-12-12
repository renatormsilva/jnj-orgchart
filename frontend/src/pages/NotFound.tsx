import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotFoundState } from '../components/common/EmptyState';
import { ROUTES } from '../utils/constants';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <NotFoundState onGoHome={() => navigate(ROUTES.PEOPLE)} />
    </div>
  );
};
