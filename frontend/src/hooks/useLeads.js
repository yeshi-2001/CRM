import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../services/leadService';

export function useLeads(filters = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.getAll(filters);
      setLeads(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { leads, loading, error, refetch: fetchLeads };
}
