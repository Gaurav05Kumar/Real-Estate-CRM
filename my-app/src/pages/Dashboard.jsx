import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { 
  Users, Building2, UserCheck, Briefcase, 
  TrendingUp, DollarSign, Activity 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

function Dashboard() {
  const { API_URL } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, monthlyRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/overview`),
        axios.get(`${API_URL}/dashboard/monthly`)
      ]);
      setOverview(overviewRes.data);
      setMonthly(monthlyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const stats = overview?.counts || {};
  const leadsData = overview?.leadsByStatus?.map(item => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1),
    value: item.count
  })) || [];

  const dealsData = overview?.dealsByStage?.map(item => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1),
    value: item.count
  })) || [];

  const monthlyLeads = monthly?.leadsByMonth?.map(item => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][item._id - 1],
    leads: item.count
  })) || [];

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalLeads || 0}</h3>
            <p>Total Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProperties || 0}</h3>
            <p>Properties</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalClients || 0}</h3>
            <p>Clients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDeals || 0}</h3>
            <p>Deals</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Leads</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyLeads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Leads by Status</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leadsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Overview</h3>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                ${(overview?.revenue?.totalValue || 0).toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Total Closed Value</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                ${(overview?.revenue?.totalCommission || 0).toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Total Commission</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Deals by Stage</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dealsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dealsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;