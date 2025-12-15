import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { HierarchyNode } from './HierarchyNode';
import { HierarchyStats } from './HierarchyStats';
import { HierarchySearch } from './HierarchySearch';
import { useHierarchy } from '../../hooks/usePeople';
import { HierarchyNodeSkeleton } from '../common/Skeleton';
import { RotateCcw, Minus, Plus } from 'lucide-react';

interface HierarchyTreeProps {
  onPersonClick: (personId: string) => void;
  focusPersonId?: string;
  onFocusComplete?: () => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({ onPersonClick, focusPersonId: externalFocusId, onFocusComplete }) => {
  const { data, isLoading, error } = useHierarchy();
  const [searchTerm, setSearchTerm] = useState('');
  const [internalFocusId, setInternalFocusId] = useState<string | undefined>();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const focusPersonId = internalFocusId || externalFocusId;

  const handleSearchSelect = (personId: string) => {
    setInternalFocusId(personId);
    setTimeout(() => {
      setInternalFocusId(undefined);
    }, 5000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (focusPersonId && transformRef.current && data) {
      const delay = isInitialized ? 100 : 600;

      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-person-id="${focusPersonId}"]`);
        if (element && transformRef.current) {
          const isMobile = window.innerWidth < 640;
          const zoomScale = isMobile ? 0.8 : 1.2;
          transformRef.current.zoomToElement(element as HTMLElement, zoomScale, 300);
        }

        if (externalFocusId && onFocusComplete) {
          setTimeout(() => onFocusComplete(), 5000);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [focusPersonId, isInitialized, externalFocusId, onFocusComplete, data]);

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
      <HierarchyStats root={data} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <HierarchySearch
            hierarchyData={data}
            onSelectPerson={handleSearchSelect}
            onSearchChange={setSearchTerm}
          />

          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-jnj-red rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">CEO</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <TransformWrapper
          ref={transformRef}
          initialScale={0.6}
          minScale={0.2}
          maxScale={2}
          centerOnInit={true}
          limitToBounds={false}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.1 }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, centerView }) => (
            <>
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex flex-col gap-1.5 sm:gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2 sm:p-2.5 rounded-lg shadow-md border border-gray-200 transition-all hover:scale-105"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2 sm:p-2.5 rounded-lg shadow-md border border-gray-200 transition-all hover:scale-105"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => centerView(0.6, 300)}
                  className="bg-jnj-red hover:bg-red-700 text-white p-2 sm:p-2.5 rounded-lg shadow-md transition-all hover:scale-105"
                  title="Center on CEO"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: window.innerWidth < 640 ? 'calc(100vh - 20rem)' : 'calc(100vh - 16rem)',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="py-8 sm:py-16 px-4 sm:px-8">
                  <HierarchyNode
                    node={data}
                    isCEO={true}
                    onPersonClick={onPersonClick}
                    searchTerm={searchTerm}
                    focusPersonId={focusPersonId}
                  />
                </div>
              </TransformComponent>

              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-10 max-w-[90%] sm:max-w-none">
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="hidden sm:inline">Explore our team: Drag to navigate • Scroll to zoom • Click reset to center</span>
                    <span className="sm:hidden">Drag • Pinch to zoom • Tap reset</span>
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
