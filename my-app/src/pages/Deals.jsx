import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, DollarSign, User, Building } from 'lucide-react';
import { format } from 'date-fns';

function Deals() {
  const { API_URL } = useContext(AuthContext);
  const formatIndianNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString('en-IN');
  };

  const getDigitsOnly = (value) => value.replace(/\D/g, '');

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: '', property: '', client: '', stage: 'inquiry',
    dealValue: '', commission: { percentage: 2 }
  });

  useEffect(() => {
    fetchDeals();
    fetchProperties();
    fetchClients();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${API_URL}/deals`);
      setDeals(res.data.deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_URL}/properties?status=available`);
      setProperties(res.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/clients`);
      setClients(res.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        dealValue: formData.dealValue ? Number(formData.dealValue) : 0,
        commission: {
          ...formData.commission,
          percentage: formData.commission?.percentage ? Number(formData.commission.percentage) : 0
        }
      };

      await axios.post(`${API_URL}/deals`, payload);
      setShowModal(false);
      setFormData({
        title: '', property: '', client: '', stage: 'inquiry',
        dealValue: '', commission: { percentage: 2 }
      });
      fetchDeals();
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const stages = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost'];
  const stageColors = {
    inquiry: '#3b82f6',
    negotiation: '#8b5cf6',
    agreement: '#f59e0b',
    closed: '#10b981',
    lost: '#ef4444'
  };

  const getDealsByStage = (stage) => deals.filter(deal => deal.stage === stage);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Deals</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Deal
        </button>
      </div>

      <div className="card">
        <div className="kanban-board">
          {stages.map(stage => (
            <div key={stage} className="kanban-column">
              <div className="kanban-header" style={{ borderColor: stageColors[stage] }}>
                <span style={{ textTransform: 'capitalize' }}>{stage}</span>
                <span style={{ background: stageColors[stage], color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                  {getDealsByStage(stage).length}
                </span>
              </div>
              {getDealsByStage(stage).map(deal => (
                <Link key={deal._id} to={`/deals/${deal._id}`} style={{ textDecoration: 'none' }}>
                  <div className="kanban-card">
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>{deal.title}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                      {deal.client?.name}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>
                      ₹{deal.dealValue?.toLocaleString('en-IN')}
                    </p>
                    {deal.assignedTo && (
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                        {deal.assignedTo.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Deal</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Deal Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Property *</label>
                <select
                  className="form-select"
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(prop => (
                    <option key={prop._id} value={prop._id}>{prop.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Client *</label>
                <select
                  className="form-select"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select
                  className="form-select"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  <option value="inquiry">Inquiry</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="agreement">Agreement</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Deal Value *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-input"
                    value={formatIndianNumber(formData.dealValue)}
                    onChange={(e) => setFormData({ ...formData, dealValue: getDigitsOnly(e.target.value) })}
                    placeholder="e.g. 25,00,000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission %</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.commission.percentage}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      commission: { ...formData.commission, percentage: e.target.value } 
                    })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Deal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;