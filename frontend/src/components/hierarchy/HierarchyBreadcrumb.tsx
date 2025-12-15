import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { HierarchyNode } from '../../types/person';

interface HierarchyBreadcrumbProps {
  path: HierarchyNode[];
  onNodeClick: (personId: string) => void;
}

export const HierarchyBreadcrumb: React.FC<HierarchyBreadcrumbProps> = ({ path, onNodeClick }) => {
  if (path.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="flex-shrink-0">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Home className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {path.map((node, index) => {
          const isLast = index === path.length - 1;

          return (
            <React.Fragment key={node.id}>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNodeClick(node.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium flex-shrink-0
                  ${isLast
                    ? 'bg-jnj-red text-white shadow-sm'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                  }
                `}
              >
                <span className="truncate max-w-[150px]">{node.name}</span>
                {isLast && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">
                    Current
                  </span>
                )}
              </motion.button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
