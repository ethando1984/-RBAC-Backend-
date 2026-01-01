import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export type ViewMode = 'table' | 'card';

export interface ViewParams {
    page: number;
    pageSize: number;
    viewMode: ViewMode;
    search: string;
}

export function useViewParams(defaultPageSize = 10) {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || defaultPageSize.toString());
    const viewMode = (searchParams.get('view') as ViewMode) || 'table';
    const search = searchParams.get('search') || '';

    const setPage = useCallback((newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    }, [setSearchParams]);

    const setPageSize = useCallback((newPageSize: number) => {
        setSearchParams(prev => {
            prev.set('pageSize', newPageSize.toString());
            prev.set('page', '1'); // Reset to first page
            return prev;
        });
    }, [setSearchParams]);

    const setViewMode = useCallback((newViewMode: ViewMode) => {
        setSearchParams(prev => {
            prev.set('view', newViewMode);
            return prev;
        });
    }, [setSearchParams]);

    const setSearch = useCallback((newSearch: string) => {
        setSearchParams(prev => {
            if (newSearch) {
                prev.set('search', newSearch);
            } else {
                prev.delete('search');
            }
            prev.set('page', '1'); // Reset to first page
            return prev;
        });
    }, [setSearchParams]);

    return {
        page,
        pageSize,
        viewMode,
        search,
        setPage,
        setPageSize,
        setViewMode,
        setSearch
    };
}
