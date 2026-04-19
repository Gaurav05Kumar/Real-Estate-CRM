import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { ArrowLeft, MapPin, Bed, Bath, Square, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

function PropertyDetail() {
  const { id } = useParams();
  const { API_URL } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const res = await axios.get(`${API_URL}/properties/${id}`);
      setProperty(res.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
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
  if (!property) return <div className="loading">Property not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <ArrowLeft size={18} /> Back to Properties
        </Link>
      </div>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-meta">
            <MapPin size={14} style={{ marginRight: '4px' }} />
            {property.location?.address}, {property.location?.city}, {property.location?.state} {property.location?.pincode}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`badge ${getStatusBadge(property.status)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {property.status}
          </span>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5' }}>
            ${property.price?.toLocaleString()}{property.listingType === 'rent' ? '/mo' : ''}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <div className="card">
            <h3 className="card-title">Property Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {property.images?.length > 0 ? (
                property.images.map((img, index) => (
                  <div key={index} style={{ height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={`http://localhost:5000${img.url}`} 
                      alt={`Property ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No images available
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="card-title">Description</h3>
            <p style={{ marginTop: '12px', lineHeight: '1.6' }}>{property.description}</p>
          </div>

          {property.amenities?.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {property.amenities.map((amenity, index) => (
                  <span key={index} style={{ 
                    padding: '6px 12px', 
                    background: '#f1f5f9', 
                    borderRadius: '20px',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h3 className="card-title">Property Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Type</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{property.propertyType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Listing</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{property.listingType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Area</span>
                <span style={{ fontWeight: 500 }}>{property.area?.value} {property.area?.unit}</span>
              </div>
              {property.bedrooms && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Bedrooms</span>
                  <span style={{ fontWeight: 500 }}>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Bathrooms</span>
                  <span style={{ fontWeight: 500 }}>{property.bathrooms}</span>
                </div>
              )}
              {property.yearBuilt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Year Built</span>
                  <span style={{ fontWeight: 500 }}>{property.yearBuilt}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Views</span>
                <span style={{ fontWeight: 500 }}>{property.views}</span>
              </div>
            </div>
          </div>

          {property.assignedAgent && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">Assigned Agent</h3>
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontWeight: 500 }}>{property.assignedAgent.name}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{property.assignedAgent.phone}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{property.assignedAgent.email}</p>
              </div>
            </div>
          )}

          {property.owner && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 className="card-title">Property Owner</h3>
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontWeight: 500 }}>{property.owner.name}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{property.owner.phone}</p>
                {property.owner.email && <p style={{ fontSize: '13px', color: '#64748b' }}>{property.owner.email}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;