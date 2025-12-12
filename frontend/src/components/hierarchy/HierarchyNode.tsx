import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Crown } from 'lucide-react';
import { HierarchyNode as HierarchyNodeType } from '../../types/person';
import { getPersonPhotoUrl } from '../../utils/avatar';

interface HierarchyNodeProps {
  node: HierarchyNodeType;
  isCEO?: boolean;
  onPersonClick: (personId: string) => void;
  searchTerm?: string;
  focusPersonId?: string;
}

export const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  node,
  isCEO = false,
  onPersonClick,
  searchTerm,
  focusPersonId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isCEO || true);
  const hasChildren = node.children && node.children.length > 0;
  const cardRef = useRef<HTMLDivElement>(null);

  const isMatchingSearch =
    searchTerm &&
    (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.department.toLowerCase().includes(searchTerm.toLowerCase()));

  const isFocused = focusPersonId === node.id;

  // Verificar se a pessoa focada está nos descendentes
  const hasFocusedDescendant = (currentNode: HierarchyNodeType, targetId: string): boolean => {
    if (currentNode.id === targetId) return true;
    if (!currentNode.children) return false;
    return currentNode.children.some(child => hasFocusedDescendant(child, targetId));
  };

  // Auto-expandir se houver uma pessoa focada nos descendentes
  useEffect(() => {
    if (focusPersonId && hasChildren) {
      const shouldExpand = hasFocusedDescendant(node, focusPersonId);
      if (shouldExpand) {
        setIsExpanded(true);
      }
    }
  }, [focusPersonId, hasChildren, node]);

  // Scroll até a pessoa focada
  useEffect(() => {
    if (isFocused && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 500);
    }
  }, [isFocused]);

  return (
    <div className="flex flex-col items-center relative">
      {/* Person Card */}
      <div
        ref={cardRef}
        className={`
          group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 z-10
          ${isCEO
            ? 'bg-gradient-to-br from-jnj-red via-red-600 to-jnj-red text-white shadow-2xl border-4 border-red-700 min-w-[340px] hover:shadow-red-500/50'
            : isFocused
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-500 shadow-2xl min-w-[280px] animate-pulse'
            : isMatchingSearch
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-xl min-w-[280px] hover:shadow-yellow-400/50'
            : 'bg-white border-2 border-jnj-gray-400 shadow-lg min-w-[280px] hover:shadow-xl hover:border-jnj-red/50'
          }
          hover:-translate-y-1 hover:scale-105
        `}
        onClick={() => onPersonClick(node.id)}
      >
        {/* CEO Crown */}
        {isCEO && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-400 rounded-full p-2 shadow-lg border-2 border-yellow-500">
              <Crown className="w-5 h-5 text-yellow-900" />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`
                ${isCEO ? 'w-20 h-20' : 'w-16 h-16'}
                rounded-full overflow-hidden
                ${isCEO ? 'ring-4 ring-white/30' : 'ring-2 ring-jnj-gray-400'}
                shadow-lg
              `}
            >
              <img
                src={getPersonPhotoUrl(node.photoPath, node.id, node.name)}
                alt={node.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Se a foto falhar ao carregar, usa o avatar gerado
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(node.id)}&backgroundColor=f0f0f0`;
                }}
              />
            </div>
            {/* Status Indicator */}
            <div className={`
              absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2
              ${isCEO ? 'border-white' : 'border-white'}
              ${node.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}
            `} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`
                font-bold truncate
                ${isCEO ? 'text-xl text-white' : 'text-base text-jnj-gray-900'}
              `}>
                {node.name}
              </h3>
              {isCEO && (
                <span className="px-2 py-0.5 text-xs font-bold bg-white text-jnj-red rounded-full">
                  CEO
                </span>
              )}
            </div>

            <p className={`
              text-sm truncate
              ${isCEO ? 'text-white/90 font-medium' : 'text-jnj-gray-700'}
            `}>
              {node.jobTitle}
            </p>

            <p className={`
              text-xs truncate mt-1
              ${isCEO ? 'text-white/75' : 'text-jnj-gray-700'}
            `}>
              {node.department}
            </p>

            {/* Direct Reports Badge */}
            {hasChildren && (
              <div className={`
                mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                ${isCEO
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'bg-jnj-gray-100 text-jnj-gray-900'
                }
              `}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {node.children.length} Direct Report{node.children.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`
                p-2 rounded-xl transition-all
                ${isCEO
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-jnj-gray-100 text-jnj-gray-700'
                }
              `}
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Children with connector lines - FIXED APPROACH */}
      {hasChildren && isExpanded && (
        <div className="relative mt-16">
          {/* Vertical line from parent down to horizontal bar - stops at horizontal line */}
          <div className="absolute bottom-full left-1/2 w-0.5 h-20 -ml-px bg-jnj-gray-700" />

          {/* Children container */}
          <div className="flex items-start justify-center gap-12 relative">
            {node.children.map((child, index) => {
              const isFirstChild = index === 0;
              const isLastChild = index === node.children.length - 1;
              const hasMultipleChildren = node.children.length > 1;

              return (
                <div key={child.id} className="relative flex-shrink-0">
                  {/* Vertical line from horizontal bar to child */}
                  <div className="absolute -top-8 left-1/2 w-0.5 h-8 -ml-px bg-jnj-gray-700" />

                  {/* Horizontal line segments to create connected bar */}
                  {hasMultipleChildren && !isLastChild && (
                    <div
                      className="absolute -top-8 h-0.5 bg-jnj-gray-700"
                      style={{
                        left: '50%',
                        right: '-3rem', // Extends to the next child (gap-12 = 3rem)
                      }}
                    />
                  )}
                  {hasMultipleChildren && !isFirstChild && (
                    <div
                      className="absolute -top-8 h-0.5 bg-jnj-gray-700"
                      style={{
                        right: '50%',
                        left: '-3rem', // Extends to the previous child (gap-12 = 3rem)
                      }}
                    />
                  )}

                  {/* The child node */}
                  <HierarchyNode
                    node={child}
                    onPersonClick={onPersonClick}
                    searchTerm={searchTerm}
                    focusPersonId={focusPersonId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
