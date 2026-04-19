import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { ArrowLeft, DollarSign, User, Building, FileText, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function DealDetail() {
  const { id } = useParams();
  const { API_URL } = useContext(AuthContext);
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      const res = await axios.get(`${API_URL}/deals/${id}`);
      setDeal(res.data);
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await axios.patch(`${API_URL}/deals/${id}/stage`, { stage: newStage });
      fetchDeal();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/deals/${id}/notes`, { text: noteText });
      setShowNoteModal(false);
      setNoteText('');
      fetchDeal();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getStageBadge = (stage) => {
    const badges = {
      inquiry: 'badge-new',
      negotiation: 'badge-negotiation',
      agreement: 'badge-contacted',
      closed: 'badge-closed',
      lost: 'badge-lost'
    };
    return badges[stage] || 'badge-new';
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!deal) return <div className="loading">Deal not found</div>;

  const commissionAmount = deal.dealValue * (deal.commission?.percentage || 0) / 100;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/deals" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <ArrowLeft size={18} /> Back to Deals
        </Link>
      </div>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">{deal.title}</h1>
          <p className="detail-meta">
            Created {format(new Date(deal.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`badge ${getStageBadge(deal.stage)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {deal.stage}
          </span>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5' }}>
            ${deal.dealValue?.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 className="card-title">Property</h3>
          <Link to={`/properties/${deal.property?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', textDecoration: 'none' }}>
            <Building size={18} color="#64748b" />
            <div>
              <p style={{ fontWeight: 500, color: '#0f172a' }}>{deal.property?.title}</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                ${deal.property?.price?.toLocaleString()}
              </p>
            </div>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Client</h3>
          <Link to={`/clients/${deal.client?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', textDecoration: 'none' }}>
            <User size={18} color="#64748b" />
            <div>
              <p style={{ fontWeight: 500, color: '#0f172a' }}>{deal.client?.name}</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{deal.client?.phone}</p>
            </div>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Financial Details</h3>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Deal Value</span>
              <span style={{ fontWeight: 500 }}>${deal.dealValue?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Commission %</span>
              <span style={{ fontWeight: 500 }}>{deal.commission?.percentage || 0}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Commission Amount</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>${commissionAmount?.toLocaleString()}</span>
            </div>
          </div>
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
            value={deal.stage}
            onChange={(e) => handleStageChange(e.target.value)}
          >
            <option value="inquiry">Inquiry</option>
            <option value="negotiation">Negotiation</option>
            <option value="agreement">Agreement</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setShowNoteModal(true)}>
            <MessageSquare size={18} /> Add Note
          </button>
        </div>
      </div>

      {deal.stageHistory?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title">Stage History</h3>
          <div className="timeline" style={{ marginTop: '16px' }}>
            {deal.stageHistory.map((history, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  {format(new Date(history.changedAt), 'MMM d, yyyy h:mm a')}
                  {history.changedBy?.name && ` by ${history.changedBy.name}`}
                </div>
                <div className="timeline-content">
                  <span className={`badge ${getStageBadge(history.stage)}`}>
                    {history.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deal.notes?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title">Notes</h3>
          <div className="timeline" style={{ marginTop: '16px' }}>
            {deal.notes.map((note, index) => (
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

      {deal.documents?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="card-title">Documents</h3>
          <div style={{ marginTop: '12px' }}>
            {deal.documents.map((doc, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <FileText size={18} color="#64748b" />
                <span style={{ flex: 1 }}>{doc.name}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </span>
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

export default DealDetail;