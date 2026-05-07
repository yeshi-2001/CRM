import { useState, useEffect, useCallback } from 'react';
import { noteService } from '../services/noteService';

export function useNotes(leadId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await noteService.getNotesByLead(leadId);
      setNotes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addNote = async (content, createdBy) => {
    const newNote = await noteService.addNote(leadId, { content, created_by: createdBy });
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = async (noteId) => {
    await noteService.remove(leadId, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return { notes, loading, error, addNote, deleteNote, refetch };
}
