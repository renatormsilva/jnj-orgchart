// Minimalist color system using J&J brand colors only
// Tier S+ design: clean, professional, not colorful
export const DEPARTMENT_COLORS = {
  Executive: {
    primary: '#EB1700', // J&J Red
    light: '#FEF2F2',   // Very subtle red tint
    border: '#DC2626',  // Slightly darker red
    gradient: 'from-white via-gray-50 to-white',
  },
  default: {
    primary: '#374151', // gray-700
    light: '#FFFFFF',   // Pure white
    border: '#D1D5DB',  // gray-300 - subtle border
    gradient: 'from-white via-gray-50 to-white',
  },
};

export const getDepartmentColor = (department: string) => {
  const key = Object.keys(DEPARTMENT_COLORS).find(
    (dept) => department.toLowerCase().includes(dept.toLowerCase())
  );
  return DEPARTMENT_COLORS[key as keyof typeof DEPARTMENT_COLORS] || DEPARTMENT_COLORS.default;
};
