import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Standardized hook for async operations with toast notifications and loading states.
 * Eliminates repetitive try/catch/loading/toast patterns across components.
 */
export function useAsyncOperation<T = void>(
  options: AsyncOperationOptions<T> = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const result = await operation();
        setState({ data: result, loading: false, error: null });

        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });

        toast.error(options.errorMessage || error.message || 'An error occurred');
        options.onError?.(error);
        return undefined;
      }
    },
    [options.successMessage, options.errorMessage, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
