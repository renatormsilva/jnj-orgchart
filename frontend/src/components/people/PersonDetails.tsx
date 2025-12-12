import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Users, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePerson, useManagementChain } from '../../hooks/usePeople';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { getPersonPhotoUrl } from '../../utils/avatar';

interface PersonDetailsProps {
  personId: string;
  onClose: () => void;
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({ personId, onClose }) => {
  const navigate = useNavigate();
  const { data: personData, isLoading, error } = usePerson(personId);
  const { data: managementChain } = useManagementChain(personId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loading text="Connecting you with this team member..." />
        </div>
      </div>
    );
  }

  if (error || !personData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-red-600">We couldn't load this person's details right now</p>
          <Button onClick={onClose} variant="secondary" className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-jnj-gray-400 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-jnj-gray-900">
            Meet Our Team Member
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-jnj-gray-100 rounded-full transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={getPersonPhotoUrl(personData.photoPath, personData.id, personData.name)}
              alt={personData.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0 mx-auto sm:mx-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(personData.id)}&backgroundColor=f0f0f0`;
              }}
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-display font-bold text-jnj-gray-900">
                {personData.name}
              </h3>
              <p className="text-base sm:text-lg text-jnj-gray-700 mt-1">{personData.jobTitle}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                <Badge type="type" value={personData.type} />
                <Badge type="status" value={personData.status} />
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-jnj-gray-700 mt-0.5" />
              <div>
                <p className="text-sm text-jnj-gray-700">Department</p>
                <p className="font-medium text-jnj-gray-900">{personData.department}</p>
              </div>
            </div>

            {personData.email && (
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-jnj-gray-700 mt-0.5" />
                <div>
                  <p className="text-sm text-jnj-gray-700">Email</p>
                  <a
                    href={`mailto:${personData.email}`}
                    className="font-medium text-jnj-red hover:underline"
                  >
                    {personData.email}
                  </a>
                </div>
              </div>
            )}

            {personData.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-jnj-gray-700 mt-0.5" />
                <div>
                  <p className="text-sm text-jnj-gray-700">Phone</p>
                  <a
                    href={`tel:${personData.phone}`}
                    className="font-medium text-jnj-red hover:underline"
                  >
                    {personData.phone}
                  </a>
                </div>
              </div>
            )}

            {personData.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-jnj-gray-700 mt-0.5" />
                <div>
                  <p className="text-sm text-jnj-gray-700">Location</p>
                  <p className="font-medium text-jnj-gray-900">{personData.location}</p>
                </div>
              </div>
            )}

            {personData.hireDate && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-jnj-gray-700 mt-0.5" />
                <div>
                  <p className="text-sm text-jnj-gray-700">Hire Date</p>
                  <p className="font-medium text-jnj-gray-900">
                    {formatDate(personData.hireDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manager Section */}
          {personData.manager && (
            <div className="border-t border-jnj-gray-400 pt-6">
              <h4 className="font-display font-semibold text-jnj-gray-900 mb-3">
                Reports To
              </h4>
              <div className="bg-jnj-gray-100 rounded-lg p-4 flex items-center space-x-4">
                <img
                  src={getPersonPhotoUrl(personData.manager.photoPath, personData.manager.id, personData.manager.name)}
                  alt={personData.manager.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (personData.manager) {
                      target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(personData.manager.id)}&backgroundColor=f0f0f0`;
                    }
                  }}
                />
                <div>
                  <p className="font-medium text-jnj-gray-900">
                    {personData.manager.name}
                  </p>
                  <p className="text-sm text-jnj-gray-700">
                    {personData.manager.jobTitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Direct Reports Section */}
          {personData.directReports && personData.directReports.length > 0 && (
            <div className="border-t border-jnj-gray-400 pt-6">
              <h4 className="font-display font-semibold text-jnj-gray-900 mb-3">
                Direct Reports ({personData.directReports.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personData.directReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-jnj-gray-100 rounded-lg p-3 flex items-center space-x-3"
                  >
                    <img
                      src={getPersonPhotoUrl(report.photoPath, report.id, report.name)}
                      alt={report.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(report.id)}&backgroundColor=f0f0f0`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-jnj-gray-900 truncate">
                        {report.name}
                      </p>
                      <p className="text-sm text-jnj-gray-700 truncate">
                        {report.jobTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Management Chain */}
          {managementChain && managementChain.length > 0 && (
            <div className="border-t border-jnj-gray-400 pt-6">
              <h4 className="font-display font-semibold text-jnj-gray-900 mb-3">
                Management Chain
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {managementChain.map((manager, index) => (
                  <React.Fragment key={manager.id}>
                    <span className="text-sm font-medium text-jnj-gray-900">
                      {manager.name}
                    </span>
                    {index < managementChain.length - 1 && (
                      <span className="text-jnj-gray-700">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-jnj-gray-400 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                navigate(ROUTES.HIERARCHY, { state: { focusPersonId: personData.id } });
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              <Network className="w-4 h-4 mr-2" />
              View in Hierarchy
            </Button>
            <Button variant="primary" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
