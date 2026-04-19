import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Bed, Bath, Square } from 'lucide-react';
import { format } from 'date-fns';

function Properties() {
  const { API_URL } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', propertyType: 'residential', listingType: 'sale',
    price: '', location: { address: '', city: '', state: '', pincode: '' },
    area: { value: '', unit: 'sqft' }, bedrooms: '', bathrooms: '',
    amenities: [], status: 'available'
  });

  useEffect(() => {
    fetchProperties();
  }, [search, propertyType, listingType, status]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (propertyType) params.append('propertyType', propertyType);
      if (listingType) params.append('listingType', listingType);
      if (status) params.append('status', status);
      
      const res = await axios.get(`${API_URL}/properties?${params}`);
      setProperties(res.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/properties`, formData);
      setShowModal(false);
      setFormData({
        title: '', description: '', propertyType: 'residential', listingType: 'sale',
        price: '', location: { address: '', city: '', state: '', pincode: '' },
        area: { value: '', unit: 'sqft' }, bedrooms: '', bathrooms: '',
        amenities: [], status: 'available'
      });
      fetchProperties();
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-available',
      sold: 'badge-sold',
      rented: 'badge-rented',
      'under-offer': 'badge-negotiation'
    };
    return badges[status] || 'badge-available';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h1>Properties</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Property
        </button>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select 
          className="form-select" 
          style={{ width: 'auto' }}
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="plot">Plot</option>
          <option value="land">Land</option>
        </select>
        <select 
          className="form-select" 
          style={{ width: 'auto' }}
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
        >
          <option value="">All Listings</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
        <select 
          className="form-select" 
          style={{ width: 'auto' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
          <option value="under-offer">Under Offer</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {properties.map(property => (
          <Link key={property._id} to={`/properties/${property._id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '180px', background: '#e2e8f0', position: 'relative' }}>
                {property.images?.[0] ? (
                  <img 
                    src={`http://localhost:5000${property.images[0].url}`} 
                    alt={property.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    No Image
                  </div>
                )}
                <span className={`badge ${getStatusBadge(property.status)}`} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {property.status}
                </span>
                <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#4f46e5', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 600 }}>
                  {property.listingType === 'sale' ? '$' : '$'}{property.price?.toLocaleString()}{property.listingType === 'rent' ? '/mo' : ''}
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>{property.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>
                  <MapPin size={14} />
                  {property.location?.city}, {property.location?.state}
                </div>
                <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
                  {property.bedrooms && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bed size={14} /> {property.bedrooms} Beds</span>}
                  {property.bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bath size={14} /> {property.bathrooms} Baths</span>}
                  {property.area?.value && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Square size={14} /> {property.area.value} {property.area.unit}</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {properties.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <Building2 size={48} />
            <p>No properties found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Property</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select
                    className="form-select"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Listing Type</label>
                  <select
                    className="form-select"
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                  >
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Area (sqft)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.area.value}
                    onChange={(e) => setFormData({ ...formData, area: { ...formData.area, value: e.target.value } })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location.state}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Property
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Building2({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

export default Properties;