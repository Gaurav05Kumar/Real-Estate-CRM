import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { ArrowLeft, Phone, Mail, Calendar, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

function LeadDetail() {
  const { id } = useParams();
  const { API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchLead();
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchAgents();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`${API_URL}/leads/${id}`);
      setLead(res.data);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/agents`);
      setAgents(res.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`${API_URL}/leads/${id}/status`, { status: newStatus });
      fetchLead();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssign = async (agentId) => {
    try {
      await axios.patch(`${API_URL}/leads/${id}/assign`, { assignedTo: agentId });
      fetchLead();
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leads/${id}/notes`, { text: noteText });
      setShowNoteModal(false);
      setNoteText('');
      fetchLead();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: 'badge-new',
      contacted: 'badge-contacted',
      qualified: 'badge-qualified',
      negotiation: 'badge-negotiation',
      closed: 'badge-closed',
      lost: 'badge-lost'
    };
    return badges[status] || 'badge-new';
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!lead) return <div className="loading">Lead not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/leads" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <ArrowLeft size={18} /> Back to Leads
        </Link>
      </div>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">{lead.name}</h1>
          <p className="detail-meta">
            Created {format(new Date(lead.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className={`badge ${getStatusBadge(lead.status)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {lead.status}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 className="card-title">Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={18} color="#64748b" />
              <span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#64748b" />
                <span>{lead.email}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={18} color="#64748b" />
              <span style={{ textTransform: 'capitalize' }}>{lead.source}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Assignment</h3>
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>Assigned To</p>
            <p style={{ fontWeight: 500 }}>{lead.assignedTo?.name || 'Unassigned'}</p>
            {lead.assignedTo?.email && (
              <p style={{ fontSize: '13px', color: '#64748b' }}>{lead.assignedTo.email}</p>
            )}
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div style={{ marginTop: '16px' }}>
              <label className="form-label">Re-assign</label>
              <select 
                className="form-select"
                value={lead.assignedTo?._id || ''}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Select Agent</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Budget & Preferences</h3>
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>Budget Range</p>
            <p style={{ fontWeight: 500 }}>
              ${lead.budget?.min?.toLocaleString() || 0} - ${lead.budget?.max?.toLocaleString() || 0}
            </p>
          </div>
          {lead.preferences?.propertyType && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#64748b', marginBottom: '8px' }}>Property Type</p>
              <p style={{ fontWeight: 500, textTransform: 'capitalize' }}>{lead.preferences.propertyType}</p>
            </div>
          )}
          {lead.preferences?.location && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#64748b', marginBottom: '8px' }}>Preferred Location</p>
              <p style={{ fontWeight: 500 }}>{lead.preferences.location}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setShowNoteModal(true)}>
            <MessageSquare size={18} /> Add Note
          </button>
        </div>
      </div>

      {lead.notes?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title">Notes</h3>
          <div className="timeline" style={{ marginTop: '16px' }}>
            {lead.notes.map((note, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                  {note.addedBy?.name && ` by ${note.addedBy.name}`}
                </div>
                <div className="timeline-content">{note.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Note</h2>
              <button className="modal-close" onClick={() => setShowNoteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Enter your note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadDetail;