import { useState, useEffect } from 'react';

const SEED = [
  { id: '1',  name: 'Nuwan Perera',           company: 'Ceylon Tech Solutions',   email: 'nuwan@ceylontech.lk',     phone: '+94 77 123 4567', location: 'Colombo 03, Western Province',          category: 'Customer',  assignedTo: 'Kasun Fernando', createdAt: '2024-11-01T09:00:00Z', updatedAt: '2024-11-01T09:00:00Z' },
  { id: '2',  name: 'Dilani Jayasinghe',      company: 'Lanka Innovations',       email: 'dilani@lankainno.lk',     phone: '+94 71 234 5678', location: 'Kandy, Central Province',               category: 'Customer',  assignedTo: 'Nimali Silva',   createdAt: '2024-11-05T10:30:00Z', updatedAt: '2024-11-05T10:30:00Z' },
  { id: '3',  name: 'Kasun Fernando',         company: 'Serendib Enterprises',    email: 'kasun@serendib.lk',       phone: '+94 76 345 6789', location: 'Galle, Southern Province',              category: 'Employee',  assignedTo: 'Kasun Fernando', createdAt: '2024-11-08T08:15:00Z', updatedAt: '2024-11-08T08:15:00Z' },
  { id: '4',  name: 'Chamara Bandara',        company: 'Colombo Digital Hub',     email: 'chamara@colombodigi.lk',  phone: '+94 70 456 7890', location: 'Negombo, Western Province',             category: 'Partner',   assignedTo: 'Nimali Silva',   createdAt: '2024-11-12T14:00:00Z', updatedAt: '2024-11-12T14:00:00Z' },
  { id: '5',  name: 'Sachini Rodrigo',        company: 'SriTech Systems',         email: 'sachini@sritech.lk',      phone: '+94 75 567 8901', location: 'Jaffna, Northern Province',             category: 'Customer',  assignedTo: 'Kasun Fernando', createdAt: '2024-11-15T11:45:00Z', updatedAt: '2024-11-15T11:45:00Z' },
  { id: '6',  name: 'Nimali Silva',           company: 'Pearl Software Ltd',      email: 'nimali@pearlsoft.lk',     phone: '+94 72 678 9012', location: 'Colombo 07, Western Province',          category: 'Employee',  assignedTo: 'Nimali Silva',   createdAt: '2024-11-18T09:30:00Z', updatedAt: '2024-11-18T09:30:00Z' },
  { id: '7',  name: 'Tharaka Wijeratne',      company: 'Kandy Cloud Services',    email: 'tharaka@kandycloud.lk',   phone: '+94 78 789 0123', location: 'Matara, Southern Province',             category: 'Partner',   assignedTo: 'Kasun Fernando', createdAt: '2024-11-20T13:00:00Z', updatedAt: '2024-11-20T13:00:00Z' },
  { id: '8',  name: 'Malini Dissanayake',     company: 'Galle IT Park',           email: 'malini@galleit.lk',       phone: '+94 74 890 1234', location: 'Kurunegala, North Western Province',    category: 'Customer',  assignedTo: 'Nimali Silva',   createdAt: '2024-11-22T10:00:00Z', updatedAt: '2024-11-22T10:00:00Z' },
  { id: '9',  name: 'Ruwan Karunaratne',      company: 'Negombo Ventures',        email: 'ruwan@negombov.lk',       phone: '+94 77 901 2345', location: 'Trincomalee, Eastern Province',         category: 'Partner',   assignedTo: 'Kasun Fernando', createdAt: '2024-11-25T15:30:00Z', updatedAt: '2024-11-25T15:30:00Z' },
  { id: '10', name: 'Sanduni Wickramasinghe', company: 'Matara BizTech',          email: 'sanduni@matarabiz.lk',    phone: '+94 71 012 3456', location: 'Batticaloa, Eastern Province',          category: 'Customer',  assignedTo: 'Nimali Silva',   createdAt: '2024-11-28T08:00:00Z', updatedAt: '2024-11-28T08:00:00Z' },
];

function load() {
  try {
    const raw = localStorage.getItem('crm_contacts');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Force reset if data has old non-Sri Lankan names
      if (parsed[0]?.name === 'Sarah Chen' || parsed[0]?.name === 'James Whitfield') {
        localStorage.removeItem('crm_contacts');
        return null;
      }
      return parsed;
    }
  } catch {}
  return null;
}

function loadNotes() {
  try {
    const raw = localStorage.getItem('crm_contact_notes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function save(data)      { localStorage.setItem('crm_contacts',      JSON.stringify(data)); }
function saveNotes(data) { localStorage.setItem('crm_contact_notes', JSON.stringify(data)); }

export function useContacts() {
  const [contacts, setContacts] = useState(() => load() || SEED);
  const [notes,    setNotes]    = useState(() => loadNotes());

  useEffect(() => { save(contacts); },    [contacts]);
  useEffect(() => { saveNotes(notes); },  [notes]);

  const addContact = (data) => {
    const c = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setContacts(prev => [c, ...prev]);
    return c;
  };

  const updateContact = (id, data) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c));
  };

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const addNote = (contactId, content, createdBy) => {
    const note = { id: Date.now().toString(), content, createdBy, createdAt: new Date().toISOString() };
    setNotes(prev => ({ ...prev, [contactId]: [note, ...(prev[contactId] || [])] }));
  };

  const deleteNote = (contactId, noteId) => {
    setNotes(prev => ({ ...prev, [contactId]: (prev[contactId] || []).filter(n => n.id !== noteId) }));
  };

  const getNotesFor = (contactId) => notes[contactId] || [];

  return { contacts, addContact, updateContact, deleteContact, addNote, deleteNote, getNotesFor };
}
