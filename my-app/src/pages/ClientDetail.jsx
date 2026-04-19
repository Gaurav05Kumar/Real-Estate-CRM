import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { ArrowLeft, Phone, Mail, Building, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

function ClientDetail() {
  const { id } = useParams();
  const { API_URL } = useContext(AuthContext);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionData, setInteractionData] = useState({ type: 'call', description: '' });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await axios.get(`${API_URL}/clients/${id}`);
      setClient(res.data);
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clients/${id}/interactions`, interactionData);
      setShowInteractionModal(false);
      setInteractionData({ type: 'call', description: '' });
      fetchClient();
    } catch (error) {
      console.error('Error adding interaction:', error);
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
  if (!client) return <div className="loading">Client not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/clients" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <ArrowLeft size={18} /> Back to Clients
        </Link>
      </div>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">{client.name}</h1>
          <p className="detail-meta">
            Created {format(new Date(client.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <span className={`badge ${getTypeBadge(client.type)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
          {client.type}
        </span>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 className="card-title">Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={18} color="#64748b" />
              <span>{client.phone}</span>
            </div>
            {client.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#64748b" />
                <span>{client.email}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building size={18} color="#64748b" />
              <span style={{ textTransform: 'capitalize' }}>{client.source}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Assignment</h3>
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>Assigned To</p>
            <p style={{ fontWeight: 500 }}>{client.assignedTo?.name || 'Unassigned'}</p>
            {client.assignedTo?.email && (
              <p style={{ fontSize: '13px', color: '#64748b' }}>{client.assignedTo.email}</p>
            )}
          </div>
        </div>

        {client.preferences && (
          <div className="card">
            <h3 className="card-title">Preferences</h3>
            <div style={{ marginTop: '16px' }}>
              {client.preferences.propertyType?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Property Types</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {client.preferences.propertyType.map((type, i) => (
                      <span key={i} className="badge badge-new">{type}</span>
                    ))}
                  </div>
                </div>
              )}
              {client.preferences.budget?.min || client.preferences.budget?.max ? (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Budget Range</p>
                  <p style={{ fontWeight: 500 }}>
                    ${client.preferences.budget.min || 0} - ${client.preferences.budget.max || 0}
                  </p>
                </div>
              ) : null}
              {client.preferences.location && (
                <div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Preferred Location</p>
                  <p style={{ fontWeight: 500 }}>{client.preferences.location}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Interactions</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInteractionModal(true)}>
            <MessageSquare size={16} /> Add Interaction
          </button>
        </div>
        {client.interactions?.length > 0 ? (
          <div className="timeline" style={{ marginTop: '16px' }}>
            {client.interactions.map((interaction, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  {format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}
                  {interaction.addedBy?.name && ` by ${interaction.addedBy.name}`}
                </div>
                <div className="timeline-content">
                  <span className={`badge badge-${interaction.type === 'call' ? 'new' : interaction.type === 'email' ? 'contacted' : 'qualified'}`} style={{ marginRight: '8px' }}>
                    {interaction.type}
                  </span>
                  {interaction.description}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', marginTop: '16px' }}>No interactions yet</p>
        )}
      </div>

      {client.visitedProperties?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title">Visited Properties</h3>
          <div style={{ marginTop: '16px' }}>
            {client.visitedProperties.map((vp, index) => (
              <div key={index} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <Link to={`/properties/${vp.property?._id}`} style={{ color: '#4f46e5', fontWeight: 500 }}>
                  {vp.property?.title}
                </Link>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  {format(new Date(vp.date), 'MMM d, yyyy')}
                  {vp.notes && ` - ${vp.notes}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInteractionModal && (
        <div className="modal-overlay" onClick={() => setShowInteractionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Interaction</h2>
              <button className="modal-close" onClick={() => setShowInteractionModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddInteraction}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={interactionData.type}
                  onChange={(e) => setInteractionData({ ...interactionData, type: e.target.value })}
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="meeting">Meeting</option>
                  <option value="visit">Property Visit</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter details..."
                  value={interactionData.description}
                  onChange={(e) => setInteractionData({ ...interactionData, description: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Interaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDetail;