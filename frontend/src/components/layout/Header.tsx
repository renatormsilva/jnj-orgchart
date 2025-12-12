import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Network } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b-4 border-jnj-red shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center">
              <div className="text-jnj-red font-display text-xl sm:text-2xl font-bold">
                J&J
              </div>
              <span className="ml-2 sm:ml-3 text-jnj-gray-900 font-display text-lg sm:text-xl">
                OrgChart
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2 sm:space-x-4">
            <Link
              to={ROUTES.PEOPLE}
              className={`flex items-center px-2 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                isActive(ROUTES.PEOPLE)
                  ? 'bg-jnj-red text-white'
                  : 'text-jnj-gray-700 hover:bg-jnj-gray-100'
              }`}
              aria-label="Meet Our Team"
            >
              <Users className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Our Team</span>
            </Link>
            <Link
              to={ROUTES.HIERARCHY}
              className={`flex items-center px-2 sm:px-4 py-2 rounded-md font-medium transition-colors ${
                isActive(ROUTES.HIERARCHY)
                  ? 'bg-jnj-red text-white'
                  : 'text-jnj-gray-700 hover:bg-jnj-gray-100'
              }`}
              aria-label="View Our Organization"
            >
              <Network className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Organization</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
