import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Crown, Users as UsersIcon } from 'lucide-react';
import { HierarchyNode as HierarchyNodeType } from '../../types/person';
import { getPersonPhotoUrl } from '../../utils/avatar';
import { isNodeMatch } from '../../utils/search';
import { NodeTooltip } from './NodeTooltip';

interface HierarchyNodeProps {
  node: HierarchyNodeType;
  isCEO?: boolean;
  onPersonClick: (personId: string) => void;
  searchTerm?: string;
  focusPersonId?: string;
  level?: number;
}

export const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  node,
  isCEO = false,
  onPersonClick,
  searchTerm,
  focusPersonId,
  level = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const isMatchingSearch = searchTerm && isNodeMatch(searchTerm, node.name, node.jobTitle, node.department);

  const isFocused = focusPersonId === node.id;

  const hasFocusedDescendant = (currentNode: HierarchyNodeType, targetId: string): boolean => {
    if (currentNode.id === targetId) return true;
    if (!currentNode.children) return false;
    return currentNode.children.some(child => hasFocusedDescendant(child, targetId));
  };

  useEffect(() => {
    if (focusPersonId && hasChildren) {
      const shouldExpand = hasFocusedDescendant(node, focusPersonId);
      if (shouldExpand) {
        setIsExpanded(true);
      }
    }
  }, [focusPersonId, hasChildren, node]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className="flex flex-col items-center relative">
      <NodeTooltip node={node} isVisible={isHovered} />

      <motion.div
        data-person-id={node.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isFocused ? {
          opacity: 1,
          scale: [1.05, 1.08, 1.05],
        } : { opacity: 1, scale: 1 }}
        transition={isFocused ? {
          scale: { duration: 1.5, repeat: 2, ease: "easeInOut" },
          opacity: { duration: 0.3 }
        } : {
          duration: 0.3,
          ease: 'easeOut'
        }}
        whileHover={!isFocused ? {
          y: -4,
          scale: 1.02,
          transition: { duration: 0.2, ease: 'easeOut' }
        } : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onPersonClick(node.id)}
        className={`
          group relative bg-white rounded-xl cursor-pointer transition-all duration-200
          ${isCEO ? 'min-w-[380px] shadow-lg' : 'min-w-[340px] shadow-md'}
          ${isFocused ? 'ring-4 ring-jnj-red shadow-2xl bg-red-50' : 'hover:shadow-xl'}
          ${isMatchingSearch ? 'ring-2 ring-yellow-400' : ''}
          border border-gray-200 hover:border-gray-300
        `}
      >
        {isCEO && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-jnj-red rounded-full p-2 shadow-lg ring-2 ring-white">
              <Crown className="w-5 h-5 text-white" fill="currentColor" />
            </div>
          </motion.div>
        )}

        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <div className={`
                ${isCEO ? 'w-20 h-20' : 'w-16 h-16'}
                rounded-lg overflow-hidden
                ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all
              `}>
                <img
                  src={getPersonPhotoUrl(node.photoPath, node.id, node.name)}
                  alt={node.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(node.id)}&backgroundColor=f0f0f0`;
                  }}
                />
              </div>

              <div className={`
                absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm
                ${node.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}
              `} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={`
                  font-semibold truncate
                  ${isCEO ? 'text-lg text-jnj-red' : 'text-base text-gray-900'}
                `}>
                  {node.name}
                </h3>
                {isCEO && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-jnj-red text-white rounded-md shadow-sm">
                    CEO
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 truncate mb-2">
                {node.jobTitle}
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700 border border-gray-200 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-jnj-red" />
                  {node.department}
                </div>

                {hasChildren && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md text-xs font-semibold text-blue-700 border border-blue-200 w-fit">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>{node.children.length} {node.children.length === 1 ? 'Report' : 'Reports'}</span>
                  </div>
                )}
              </div>
            </div>

            {hasChildren && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-jnj-red hover:text-white transition-all flex-shrink-0 text-gray-500 bg-gray-50 border border-gray-200 hover:border-jnj-red"
                aria-label={isExpanded ? 'Collapse team' : 'Expand team'}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <div className="w-1 h-16 bg-gray-500" style={{ marginTop: '20px', marginBottom: '0' }} />

            <div className="relative flex items-start justify-center gap-20">
              {node.children.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === node.children.length - 1;
                const isOnly = node.children.length === 1;

                return (
                  <div key={child.id} className="relative flex flex-col items-center">
                    <div className="w-1 h-16 bg-gray-500" style={{ marginBottom: '20px' }} />

                    {!isOnly && (
                      <>
                        {!isFirst && (
                          <div
                            className="absolute h-1 bg-gray-500"
                            style={{
                              top: '0',
                              right: '50%',
                              width: 'calc(50% + 2.5rem)',
                            }}
                          />
                        )}
                        {!isLast && (
                          <div
                            className="absolute h-1 bg-gray-500"
                            style={{
                              top: '0',
                              left: '50%',
                              width: 'calc(50% + 2.5rem)',
                            }}
                          />
                        )}
                      </>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
                    >
                      <HierarchyNode
                        node={child}
                        onPersonClick={onPersonClick}
                        searchTerm={searchTerm}
                        focusPersonId={focusPersonId}
                        level={level + 1}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
