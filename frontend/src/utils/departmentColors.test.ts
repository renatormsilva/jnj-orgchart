import { DEPARTMENT_COLORS, getDepartmentColor } from './departmentColors';

describe('departmentColors', () => {
  describe('DEPARTMENT_COLORS', () => {
    it('should have Executive department colors', () => {
      expect(DEPARTMENT_COLORS.Executive).toBeDefined();
      expect(DEPARTMENT_COLORS.Executive.primary).toBe('#EB1700');
      expect(DEPARTMENT_COLORS.Executive.light).toBe('#FEF2F2');
      expect(DEPARTMENT_COLORS.Executive.border).toBe('#DC2626');
    });

    it('should have default department colors', () => {
      expect(DEPARTMENT_COLORS.default).toBeDefined();
      expect(DEPARTMENT_COLORS.default.primary).toBe('#374151');
      expect(DEPARTMENT_COLORS.default.light).toBe('#FFFFFF');
      expect(DEPARTMENT_COLORS.default.border).toBe('#D1D5DB');
    });

    it('should have gradient property for all departments', () => {
      expect(DEPARTMENT_COLORS.Executive.gradient).toBeDefined();
      expect(DEPARTMENT_COLORS.default.gradient).toBeDefined();
    });
  });

  describe('getDepartmentColor', () => {
    it('should return Executive colors for Executive department', () => {
      const colors = getDepartmentColor('Executive');

      expect(colors).toEqual(DEPARTMENT_COLORS.Executive);
    });

    it('should be case-insensitive', () => {
      const lower = getDepartmentColor('executive');
      const upper = getDepartmentColor('EXECUTIVE');
      const mixed = getDepartmentColor('ExEcUtIvE');

      expect(lower).toEqual(DEPARTMENT_COLORS.Executive);
      expect(upper).toEqual(DEPARTMENT_COLORS.Executive);
      expect(mixed).toEqual(DEPARTMENT_COLORS.Executive);
    });

    it('should match partial department names', () => {
      const colors = getDepartmentColor('Executive Team');

      expect(colors).toEqual(DEPARTMENT_COLORS.Executive);
    });

    it('should return default colors for unknown departments', () => {
      const engineering = getDepartmentColor('Engineering');
      const sales = getDepartmentColor('Sales');
      const hr = getDepartmentColor('HR');
      const random = getDepartmentColor('Random Department');

      expect(engineering).toEqual(DEPARTMENT_COLORS.default);
      expect(sales).toEqual(DEPARTMENT_COLORS.default);
      expect(hr).toEqual(DEPARTMENT_COLORS.default);
      expect(random).toEqual(DEPARTMENT_COLORS.default);
    });

    it('should return default colors for empty string', () => {
      const colors = getDepartmentColor('');

      expect(colors).toEqual(DEPARTMENT_COLORS.default);
    });
  });
});
