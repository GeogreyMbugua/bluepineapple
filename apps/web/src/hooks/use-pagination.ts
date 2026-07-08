'use client';

import { useCallback, useState } from 'react';
import { PAGINATION } from '@/config/constants';

interface PaginationState {
  readonly page: number;
  readonly pageSize: number;
}

interface UsePaginationReturn {
  readonly page: number;
  readonly pageSize: number;
  readonly setPage: (page: number) => void;
  readonly setPageSize: (size: number) => void;
  readonly nextPage: () => void;
  readonly prevPage: () => void;
  readonly reset: () => void;
}

/**
 * Manage pagination state.
 *
 * Provides page/pageSize state along with navigation helpers.
 */
export function usePagination(
  initialPage: number = PAGINATION.DEFAULT_PAGE,
  initialPageSize: number = PAGINATION.DEFAULT_PAGE_SIZE,
): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
  });

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setPageSize = useCallback(
    (pageSize: number) => {
      setState({ page: 1, pageSize: Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE) });
    },
    [],
  );

  const nextPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const reset = useCallback(() => {
    setState({ page: initialPage, pageSize: initialPageSize });
  }, [initialPage, initialPageSize]);

  return {
    page: state.page,
    pageSize: state.pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
  };
}
