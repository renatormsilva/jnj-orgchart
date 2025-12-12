import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Users, Calendar, Briefcase } from 'lucide-react';
import { HierarchyNode } from '../../types/person';
import { Badge } from '../common/Badge';

interface NodeTooltipProps {
  node: HierarchyNode;
  isVisible: boolean;
}

export const NodeTooltip: React.FC<NodeTooltipProps> = ({ node, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 pointer-events-none left-1/2 -translate-x-1/2 bottom-full mb-2"
        >
          <div className="relative">
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-r border-b border-gray-200" />

            <div className="relative bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-md border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {node.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {node.jobTitle}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Badge type="type" value={node.type} />
                  <Badge type="status" value={node.status} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">{node.department}</span>
                </div>

                {node.children && node.children.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">
                      {node.children.length} Direct Report{node.children.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {node.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{node.email}</span>
                  </div>
                )}

                {node.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{node.phone}</span>
                  </div>
                )}

                {node.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">{node.location}</span>
                  </div>
                )}

                {node.hireDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">
                      Joined {new Date(node.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Click to view full details
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
