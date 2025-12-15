export const DEPARTMENT_COLORS = {
  Executive: {
    primary: '#EB1700',
    light: '#FEF2F2',
    border: '#DC2626',
    gradient: 'from-white via-gray-50 to-white',
  },
  default: {
    primary: '#374151',
    light: '#FFFFFF',
    border: '#D1D5DB',
    gradient: 'from-white via-gray-50 to-white',
  },
};

export const getDepartmentColor = (department: string) => {
  const key = Object.keys(DEPARTMENT_COLORS).find(
    (dept) => department.toLowerCase().includes(dept.toLowerCase())
  );
  return DEPARTMENT_COLORS[key as keyof typeof DEPARTMENT_COLORS] || DEPARTMENT_COLORS.default;
};
