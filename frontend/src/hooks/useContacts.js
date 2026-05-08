import { useState, useEffect, useCallback } from 'react';
import { contactService } from '../services/contactService';
import api from '../services/api';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const addContact = async (data) => {
    const contact = await contactService.create({
      name:        data.name,
      company:     data.company,
      email:       data.email,
      phone:       data.phone,
      location:    data.location,
      category:    data.category || 'Customer',
      assigned_to: data.assignedTo || data.assigned_to || '',
    });
    setContacts(prev => [contact, ...prev]);
    return contact;
  };

  const updateContact = async (id, data) => {
    const updated = await contactService.update(id, {
      name:        data.name,
      company:     data.company,
      email:       data.email,
      phone:       data.phone,
      location:    data.location,
      category:    data.category || 'Customer',
      assigned_to: data.assignedTo || data.assigned_to || '',
    });
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    return updated;
  };

  const deleteContact = async (id) => {
    await contactService.remove(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Notes — stored in PostgreSQL
  const getNotesFor = async (contactId) => {
    const { data } = await api.get(`/api/contacts/${contactId}/notes`);
    return data;
  };

  const addNote = async (contactId, content, createdBy) => {
    const { data } = await api.post(`/api/contacts/${contactId}/notes`, {
      content,
      created_by: createdBy,
    });
    return data;
  };

  const deleteNote = async (contactId, noteId) => {
    await api.delete(`/api/contacts/notes/${noteId}`);
  };

  return {
    contacts, loading, error,
    addContact, updateContact, deleteContact,
    addNote, deleteNote, getNotesFor,
    refetch: fetchContacts,
  };
}
