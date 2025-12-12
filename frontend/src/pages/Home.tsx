import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Loading } from '../components/common/Loading';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.PEOPLE);
  }, [navigate]);

  return <Loading text="Redirecting..." />;
};
