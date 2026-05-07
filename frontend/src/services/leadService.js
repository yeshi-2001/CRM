import api from './api';

export const leadService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/api/leads', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/leads/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/api/leads', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/api/leads/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/api/leads/${id}`);
    return data;
  },
};
