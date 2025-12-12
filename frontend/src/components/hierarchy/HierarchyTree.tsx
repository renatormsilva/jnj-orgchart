import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { HierarchyNodePremium } from './HierarchyNodePremium';
import { HierarchyStats } from './HierarchyStats';
import { useHierarchy } from '../../hooks/usePeople';
import { HierarchyNodeSkeleton } from '../common/Skeleton';
import {
  RotateCcw,
  Search,
  Minus,
  Plus
} from 'lucide-react';

interface HierarchyTreeProps {
  onPersonClick: (personId: string) => void;
  focusPersonId?: string;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({ onPersonClick, focusPersonId }) => {
  const { data, isLoading, error } = useHierarchy();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-gradient-to-br from-jnj-gray-100 to-white rounded-2xl shadow-xl p-8">
        <HierarchyNodeSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-gradient-to-br from-jnj-gray-100 to-white rounded-2xl shadow-xl">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">We hit a bump loading the organization</p>
          <p className="text-jnj-gray-700 mt-2">Let's give it another try in a moment</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-gradient-to-br from-jnj-gray-100 to-white rounded-2xl shadow-xl">
        <div className="text-center">
          <p className="text-jnj-gray-700 text-lg">Our organizational structure is being built</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <HierarchyStats root={data} />

      {/* Top Toolbar - Minimalist */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search with clean styling */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find a team member by name, title, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-jnj-red focus:border-jnj-red transition-all"
            />
          </div>

          {/* Legend - Minimalist */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-2 h-2 bg-jnj-red rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">CEO</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <TransformWrapper
          initialScale={0.6}
          minScale={0.2}
          maxScale={2}
          centerOnInit={true}
          limitToBounds={false}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.1 }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2.5 rounded-lg shadow-md border border-gray-200 transition-all hover:scale-105"
                  title="Aumentar Zoom"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2.5 rounded-lg shadow-md border border-gray-200 transition-all hover:scale-105"
                  title="Diminuir Zoom"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="bg-jnj-red hover:bg-red-700 text-white p-2.5 rounded-lg shadow-md transition-all hover:scale-105"
                  title="Centralizar no CEO"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: 'calc(100vh - 16rem)',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="py-16 px-8">
                  <HierarchyNodePremium
                    node={data}
                    isCEO={true}
                    onPersonClick={onPersonClick}
                    searchTerm={searchTerm}
                    focusPersonId={focusPersonId}
                  />
                </div>
              </TransformComponent>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-600">
                    Explore our team: Drag to navigate • Scroll to zoom • Click reset to center
                  </p>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
};
