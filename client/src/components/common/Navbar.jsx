import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Car, Bell, Wallet, User, LogOut, Menu, X, 
  Settings, Award, ShieldAlert, Navigation, Briefcase 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { liveNotifications, setLiveNotifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const unreadNotificationsCount = liveNotifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setLiveNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-premium group-hover:scale-105 transition-transform duration-200">
              <Car className="w-6 h-6" />
            </div>
            <span className="font-outfit font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors duration-200">
              RideShare<span className="text-brand-500">X</span>
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/search" 
              className={`font-medium text-sm transition-colors duration-200 ${isActive('/search') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Find a Ride
            </Link>
            <Link 
              to="/publish" 
              className={`font-medium text-sm transition-colors duration-200 ${isActive('/publish') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Publish a Ride
            </Link>
            <Link 
              to="/about" 
              className={`font-medium text-sm transition-colors duration-200 ${isActive('/about') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              How It Works
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Wallet Info */}
                <Link 
                  to="/wallet" 
                  className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full transition-colors duration-200 group"
                >
                  <Wallet className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-semibold text-sm text-slate-700">₹{user.walletBalance || 0}</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                      if (!notifDropdownOpen) markAllRead();
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 relative transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden z-50 transform origin-top-right transition-all">
                      <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                        <span className="text-xs text-brand-500 cursor-pointer hover:underline" onClick={() => setLiveNotifications([])}>Clear all</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {liveNotifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          liveNotifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150 ${!n.read ? 'bg-indigo-50/20' : ''}`}
                            >
                              <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                            </div>
                          ))
                        )}
                      </div>
                      <Link 
                        to="/notifications" 
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block text-center text-xs text-brand-500 hover:text-brand-600 py-3 font-medium bg-slate-50/50 hover:bg-slate-50 transition-colors duration-200"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1.5 focus:outline-none"
                  >
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                      alt={user.name} 
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                    {user.subscription?.plan === 'premium' && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-400 text-[8px] font-bold text-white px-1 py-0.5 rounded-full uppercase tracking-widest scale-90">Pro</span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden z-50 transform origin-top-right">
                      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <p className="font-semibold text-sm text-slate-800 leading-none">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-none truncate">{user.email}</p>
                        <p className="inline-block mt-2 px-2 py-0.5 bg-brand-50 text-[10px] text-brand-600 rounded-full font-bold uppercase tracking-wider">{user.role}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {user.role === 'driver' ? (
                          <>
                            <Link 
                              to="/driver"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                            >
                              <Navigation className="w-4.5 h-4.5 text-slate-400" />
                              <span>Driver Dashboard</span>
                            </Link>
                            <Link 
                              to="/bookings"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                            >
                              <Briefcase className="w-4.5 h-4.5 text-slate-400" />
                              <span>Passenger Bookings</span>
                            </Link>
                          </>
                        ) : (
                          <Link 
                            to={user.role === 'admin' ? '/admin' : '/dashboard'}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                          >
                            <Navigation className="w-4.5 h-4.5 text-slate-400" />
                            <span>My Dashboard</span>
                          </Link>
                        )}
                        <Link 
                          to="/profile" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                        >
                          <User className="w-4.5 h-4.5 text-slate-400" />
                          <span>Edit Profile</span>
                        </Link>
                        <Link 
                          to="/subscription" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                        >
                          <Award className="w-4.5 h-4.5 text-amber-500" />
                          <span>Plus Benefits</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2.5 p-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50/50 transition-all duration-200"
                          >
                            <ShieldAlert className="w-4.5 h-4.5" />
                            <span>System Settings</span>
                          </Link>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-50 bg-slate-50/30">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-all duration-200 text-left"
                        >
                          <LogOut className="w-4.5 h-4.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3.5">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors duration-200">
                  Log In
                </Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 px-4.5 py-2 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggler (Mobile) */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <Link to="/wallet" className="flex items-center space-x-1 px-3 py-1 bg-slate-100 rounded-full scale-90">
                <Wallet className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-bold text-xs">₹{user.walletBalance || 0}</span>
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg absolute w-full left-0 z-50">
          <Link 
            to="/search" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Find a Ride
          </Link>
          <Link 
            to="/publish" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Publish a Ride
          </Link>
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            How It Works
          </Link>

          {user ? (
            <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2">
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              
              {user.role === 'driver' ? (
                <>
                  <Link 
                    to="/driver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium"
                  >
                    Driver Dashboard
                  </Link>
                  <Link 
                    to="/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium"
                  >
                    Passenger Bookings
                  </Link>
                </>
              ) : (
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Edit Profile
              </Link>
              <Link 
                to="/subscription" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-50 text-sm font-medium"
              >
                Plus Membership
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-medium text-left"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mt-4">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm font-semibold text-slate-700 bg-slate-100 py-2.5 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
