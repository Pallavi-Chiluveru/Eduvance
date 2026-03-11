import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for data fetching with loading/error states
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: true, params: {} }
 */
export function useFetch(url, options = {}) {
    const { immediate = true, params = {} } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (overrideParams) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(url, { params: overrideParams || params });
            setData(res.data.data);
            return res.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Something went wrong';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData]);

    return { data, loading, error, refetch: fetchData };
}
