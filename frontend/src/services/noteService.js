import api from './api';

export const noteService = {
  getNotesByLead: async (leadId) => {
    const { data } = await api.get(`/api/leads/${leadId}/notes`);
    return data;
  },
  addNote: async (leadId, { content, created_by }) => {
    const { data } = await api.post(`/api/leads/${leadId}/notes`, { content, created_by });
    return data;
  },
  remove: async (leadId, noteId) => {
    const { data } = await api.delete(`/api/leads/${leadId}/notes/${noteId}`);
    return data;
  },
};
