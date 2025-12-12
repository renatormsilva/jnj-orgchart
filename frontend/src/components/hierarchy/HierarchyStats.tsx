import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, TrendingUp, Award } from 'lucide-react';
import { HierarchyNode } from '../../types/person';

interface HierarchyStatsProps {
  root: HierarchyNode | null;
}

const countNodes = (node: HierarchyNode): number => {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
};

const countDepartments = (node: HierarchyNode): Set<string> => {
  const depts = new Set<string>();
  depts.add(node.department);
  if (node.children) {
    node.children.forEach(child => {
      const childDepts = countDepartments(child);
      childDepts.forEach(d => depts.add(d));
    });
  }
  return depts;
};

const getMaxDepth = (node: HierarchyNode, depth = 0): number => {
  if (!node.children || node.children.length === 0) {
    return depth;
  }
  return Math.max(...node.children.map(child => getMaxDepth(child, depth + 1)));
};

export const HierarchyStats: React.FC<HierarchyStatsProps> = ({ root }) => {
  if (!root) return null;

  const totalPeople = countNodes(root);
  const departments = countDepartments(root);
  const maxLevels = getMaxDepth(root) + 1;

  const stats = [
    {
      icon: Users,
      label: 'Team Members',
      value: totalPeople,
    },
    {
      icon: Building2,
      label: 'Departments',
      value: departments.size,
    },
    {
      icon: TrendingUp,
      label: 'Organization Levels',
      value: maxLevels,
    },
    {
      icon: Award,
      label: 'Avg Team Size',
      value: Math.round(totalPeople / departments.size),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <stat.icon className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
