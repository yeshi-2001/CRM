import api from './api';

export const contactService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/api/contacts', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/contacts/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/api/contacts', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/api/contacts/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/api/contacts/${id}`);
    return data;
  },
};
