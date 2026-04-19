import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

function Leads() {
  const { API_URL, user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', source: 'website', status: 'new',
    budget: { min: '', max: '' }, preferences: {}
  });

  useEffect(() => {
    fetchLeads();
  }, [search, status]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const res = await axios.get(`${API_URL}/leads?${params}`);
      setLeads(res.data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leads`, formData);
      setShowModal(false);
      setFormData({
        name: '', phone: '', email: '', source: 'website', status: 'new',
        budget: { min: '', max: '' }, preferences: {}
      });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
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

  return (
    <div>
      <div className="header">
        <h1>Leads</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select 
          className="form-select" 
          style={{ width: 'auto' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <Link to={`/leads/${lead._id}`} style={{ color: '#4f46e5', fontWeight: 500 }}>
                      {lead.name}
                    </Link>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px' }}>{lead.phone}</span>
                      {lead.email && <span style={{ fontSize: '12px', color: '#64748b' }}>{lead.email}</span>}
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{lead.source}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.assignedTo?.name || '-'}</td>
                  <td>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Lead</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select
                  className="form-select"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="website">Website</option>
                  <option value="ads">Ads</option>
                  <option value="call">Call</option>
                  <option value="referral">Referral</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiation">Negotiation</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Min Budget</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.budget.min}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      budget: { ...formData.budget, min: e.target.value } 
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Budget</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.budget.max}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      budget: { ...formData.budget, max: e.target.value } 
                    })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;