import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HierarchyTree } from '../components/hierarchy/HierarchyTree';
import { PersonDetails } from '../components/people/PersonDetails';

export const HierarchyView: React.FC = () => {
  const location = useLocation();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const focusPersonId = location.state?.focusPersonId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-jnj-gray-900">
          Our Organization
        </h1>
        <p className="text-jnj-gray-700 mt-2">
          Discover how our teams connect and collaborate across the organization
        </p>
      </div>

      <HierarchyTree
        onPersonClick={(personId) => setSelectedPersonId(personId)}
        focusPersonId={focusPersonId}
      />

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
