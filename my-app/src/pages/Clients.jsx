import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, Mail, Building } from 'lucide-react';
import { format } from 'date-fns';

function Clients() {
  const { API_URL } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', type: 'buyer', source: 'lead',
    preferences: { propertyType: [], budget: { min: '', max: '' }, location: '' }
  });

  useEffect(() => {
    fetchClients();
  }, [search, type]);

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      
      const res = await axios.get(`${API_URL}/clients?${params}`);
      setClients(res.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clients`, formData);
      setShowModal(false);
      setFormData({
        name: '', phone: '', email: '', type: 'buyer', source: 'lead',
        preferences: { propertyType: [], budget: { min: '', max: '' }, location: '' }
      });
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      buyer: 'badge-qualified',
      seller: 'badge-negotiation',
      both: 'badge-info'
    };
    return badges[type] || 'badge-new';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Clients</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select 
          className="form-select" 
          style={{ width: 'auto' }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client._id}>
                  <td>
                    <Link to={`/clients/${client._id}`} style={{ color: '#4f46e5', fontWeight: 500 }}>
                      {client.name}
                    </Link>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px' }}>{client.phone}</span>
                      {client.email && <span style={{ fontSize: '12px', color: '#64748b' }}>{client.email}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getTypeBadge(client.type)}`}>
                      {client.type}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{client.source}</td>
                  <td>{client.assignedTo?.name || '-'}</td>
                  <td>{format(new Date(client.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No clients found
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
              <h2 className="modal-title">Add New Client</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select
                    className="form-select"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="lead">Lead</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;