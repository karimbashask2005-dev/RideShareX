import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, MapPin, Briefcase, Wallet, 
  MessageSquare, UserCircle, Settings, Award, 
  Users, Eye, Landmark, Percent, Megaphone, HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState(() => {
    if (!user) return 'passenger';
    return localStorage.getItem('rx_sidebar_view_mode') || (user.role === 'driver' ? 'driver' : 'passenger');
  });

  const handleToggleViewMode = () => {
    const nextMode = viewMode === 'driver' ? 'passenger' : 'driver';
    setViewMode(nextMode);
    localStorage.setItem('rx_sidebar_view_mode', nextMode);
    if (nextMode === 'driver') {
      navigate('/driver');
    } else {
      navigate('/bookings');
    }
  };

  if (!user) return null;

  // Passenger Navigation Links
  const passengerLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/bookings', label: 'My Bookings', icon: Briefcase },
    { to: '/wallet', label: 'My Wallet', icon: Wallet },
    { to: '/chat', label: 'Conversations', icon: MessageSquare },
    { to: '/verification-center', label: 'Verification Center', icon: ShieldCheck },
    { to: '/profile', label: 'Profile Settings', icon: Settings },
    { to: '/subscription', label: 'Subscriptions', icon: Award },
  ];

  // Driver Navigation Links
  const driverLinks = [
    { to: '/driver', label: 'Driver Panel', icon: LayoutDashboard },
    { to: '/driver/rides', label: 'My Offered Rides', icon: MapPin },
    { to: '/driver/requests', label: 'Booking Requests', icon: HelpCircle },
    { to: '/wallet', label: 'Earnings & Wallet', icon: Wallet },
    { to: '/chat', label: 'Conversations', icon: MessageSquare },
    { to: '/verification-center', label: 'Verification Center', icon: ShieldCheck },
    { to: '/profile', label: 'Driver Profile', icon: UserCircle },
  ];

  // Admin Navigation Links
  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users Management', icon: Users },
    { to: '/admin/rides', label: 'Rides Moderation', icon: Eye },
    { to: '/admin/revenue', label: 'Revenue & Wallet', icon: Landmark },
    { to: '/admin/settings', label: 'Commissions & System', icon: Percent },
    { to: '/admin/ads', label: 'Ads Management', icon: Megaphone },
  ];

  const getLinks = () => {
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'driver') {
      return viewMode === 'driver' ? driverLinks : passengerLinks;
    }
    return passengerLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex-shrink-0 min-h-screen">
      <div className="p-5 border-b border-slate-50">
        <div className="flex items-center space-x-3">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
            alt={user.name} 
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-50"
          />
          <div>
            <h4 className="font-semibold text-sm text-slate-800 leading-tight truncate max-w-[140px]">{user.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              {user.role === 'driver' ? `${viewMode} Mode` : `${user.role} Account`}
            </p>
          </div>
        </div>
        {user.role === 'driver' && (
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <button
              onClick={handleToggleViewMode}
              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 hover:bg-brand-500 hover:text-white text-brand-600 text-xs font-bold rounded-xl transition-all duration-200"
            >
              <span className="capitalize">{viewMode === 'driver' ? 'Driver View' : 'Passenger View'}</span>
              <span className="text-[9px] bg-brand-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">Switch</span>
            </button>
          </div>
        )}
      </div>
      
      <nav className="p-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/driver' || link.to === '/admin'}
              className={({ isActive }) => 
                `flex items-center space-x-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 shadow-sm border-l-4 border-brand-500' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
