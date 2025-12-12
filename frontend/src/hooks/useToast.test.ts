import { act } from '@testing-library/react';
import { useToastStore } from './useToast';

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  describe('addToast', () => {
    it('should add a toast to the list', () => {
      act(() => {
        useToastStore.getState().addToast('Test message', 'success');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.message).toBe('Test message');
      expect(state.toasts[0]?.type).toBe('success');
    });

    it('should generate unique IDs for toasts', () => {
      act(() => {
        useToastStore.getState().addToast('Toast 1', 'info');
        useToastStore.getState().addToast('Toast 2', 'info');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0]?.id).not.toBe(state.toasts[1]?.id);
    });

    it('should use default duration of 5000ms', () => {
      act(() => {
        useToastStore.getState().addToast('Test', 'info');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(5000);
    });

    it('should accept custom duration', () => {
      act(() => {
        useToastStore.getState().addToast('Test', 'warning', 3000);
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(3000);
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by id', () => {
      act(() => {
        useToastStore.getState().addToast('Test', 'info');
      });

      const toastId = useToastStore.getState().toasts[0]?.id;

      act(() => {
        useToastStore.getState().removeToast(toastId!);
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should only remove the specified toast', () => {
      act(() => {
        useToastStore.getState().addToast('Toast 1', 'info');
        useToastStore.getState().addToast('Toast 2', 'success');
        useToastStore.getState().addToast('Toast 3', 'error');
      });

      const toastId = useToastStore.getState().toasts[1]?.id;

      act(() => {
        useToastStore.getState().removeToast(toastId!);
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts.find(t => t.message === 'Toast 2')).toBeUndefined();
    });
  });

  describe('convenience methods', () => {
    it('should add success toast', () => {
      act(() => {
        useToastStore.getState().success('Success!');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe('success');
      expect(state.toasts[0]?.message).toBe('Success!');
    });

    it('should add error toast', () => {
      act(() => {
        useToastStore.getState().error('Error occurred');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe('error');
      expect(state.toasts[0]?.message).toBe('Error occurred');
    });

    it('should add info toast', () => {
      act(() => {
        useToastStore.getState().info('Information');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe('info');
    });

    it('should add warning toast', () => {
      act(() => {
        useToastStore.getState().warning('Warning!');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe('warning');
    });

    it('should accept custom duration in convenience methods', () => {
      act(() => {
        useToastStore.getState().success('Quick toast', 1000);
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(1000);
    });
  });
});

describe('useToast hook', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('should expose store methods directly', () => {
    const { success, error, info, warning } = useToastStore.getState();

    expect(typeof success).toBe('function');
    expect(typeof error).toBe('function');
    expect(typeof info).toBe('function');
    expect(typeof warning).toBe('function');
  });

  it('should add toasts through store methods', () => {
    act(() => {
      useToastStore.getState().success('Test success');
    });

    expect(useToastStore.getState().toasts[0]?.message).toBe('Test success');
  });
});
