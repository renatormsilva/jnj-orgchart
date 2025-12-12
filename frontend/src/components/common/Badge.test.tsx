import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { PersonType, PersonStatus } from '../../types/person';

describe('Badge', () => {
  describe('status badges', () => {
    it('should render Active status badge', () => {
      render(<Badge type="status" value={PersonStatus.ACTIVE} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render Inactive status badge', () => {
      render(<Badge type="status" value={PersonStatus.INACTIVE} />);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should apply green styles for Active status', () => {
      render(<Badge type="status" value={PersonStatus.ACTIVE} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-jnj-accent-green-light');
      expect(badge).toHaveClass('text-jnj-accent-green-dark');
    });

    it('should apply gray styles for Inactive status', () => {
      render(<Badge type="status" value={PersonStatus.INACTIVE} />);

      const badge = screen.getByText('Inactive');
      expect(badge).toHaveClass('bg-jnj-gray-100');
      expect(badge).toHaveClass('text-jnj-gray-700');
    });
  });

  describe('type badges', () => {
    it('should render Employee type badge', () => {
      render(<Badge type="type" value={PersonType.EMPLOYEE} />);

      expect(screen.getByText('Employee')).toBeInTheDocument();
    });

    it('should render Partner type badge', () => {
      render(<Badge type="type" value={PersonType.PARTNER} />);

      expect(screen.getByText('Partner')).toBeInTheDocument();
    });

    it('should apply blue styles for Employee type', () => {
      render(<Badge type="type" value={PersonType.EMPLOYEE} />);

      const badge = screen.getByText('Employee');
      expect(badge).toHaveClass('bg-jnj-accent-blue-light');
      expect(badge).toHaveClass('text-jnj-accent-blue-dark');
    });

    it('should apply purple styles for Partner type', () => {
      render(<Badge type="type" value={PersonType.PARTNER} />);

      const badge = screen.getByText('Partner');
      expect(badge).toHaveClass('bg-jnj-accent-purple-light');
      expect(badge).toHaveClass('text-jnj-accent-purple-dark');
    });
  });

  describe('common styles', () => {
    it('should have rounded-full class', () => {
      render(<Badge type="status" value={PersonStatus.ACTIVE} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have text-xs class', () => {
      render(<Badge type="type" value={PersonType.EMPLOYEE} />);

      const badge = screen.getByText('Employee');
      expect(badge).toHaveClass('text-xs');
    });

    it('should have font-medium class', () => {
      render(<Badge type="status" value={PersonStatus.INACTIVE} />);

      const badge = screen.getByText('Inactive');
      expect(badge).toHaveClass('font-medium');
    });

    it('should have inline-flex class', () => {
      render(<Badge type="type" value={PersonType.PARTNER} />);

      const badge = screen.getByText('Partner');
      expect(badge).toHaveClass('inline-flex');
    });

    it('should have border class', () => {
      render(<Badge type="status" value={PersonStatus.ACTIVE} />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('border');
    });
  });
});
