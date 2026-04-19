import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  Briefcase, 
  UserCog, 
  LogOut,
  Home
} from 'lucide-react';

function Layout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <Home size={28} />
          <span>RealEstate CRM</span>
        </div>
        
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Leads</span>
          </NavLink>
          
          <NavLink to="/properties" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 />
            <span>Properties</span>
          </NavLink>
          
          <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserCheck />
            <span>Clients</span>
          </NavLink>
          
          <NavLink to="/deals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Briefcase />
            <span>Deals</span>
          </NavLink>
          
          {user?.role === 'admin' && (
            <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCog />
              <span>Users</span>
            </NavLink>
          )}
        </nav>

        <div className="user-menu">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;