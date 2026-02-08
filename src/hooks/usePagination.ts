import { useState, useCallback } from 'react';

interface UsePaginationOptions<T> {
  pageSize?: number;
  initialData?: T[];
}

interface PaginationState<T> {
  data: T[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePagination = <T extends { id: string }>(options: UsePaginationOptions<T> = {}) => {
  const { pageSize = 12, initialData = [] } = options;
  
  const [state, setState] = useState<PaginationState<T>>({
    data: initialData,
    page: 0,
    hasMore: true,
    isLoading: false,
    error: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const appendData = useCallback((newData: T[], hasMore: boolean) => {
    setState(prev => ({
      ...prev,
      data: [...prev.data, ...newData],
      page: prev.page + 1,
      hasMore,
      isLoading: false,
      error: null,
    }));
  }, []);

  const reset = useCallback((newData: T[] = [], hasMore = true) => {
    setState({
      data: newData,
      page: newData.length > 0 ? 1 : 0,
      hasMore,
      isLoading: false,
      error: null,
    });
  }, []);

  const getOffset = useCallback(() => {
    return state.page * pageSize;
  }, [state.page, pageSize]);

  return {
    ...state,
    pageSize,
    setLoading,
    setError,
    appendData,
    reset,
    getOffset,
  };
};
