import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Role-based routing
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50/30">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 p-8 shadow-premium space-y-6">
        
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-550">Access your intercity rides and transactions</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-700 leading-normal">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="example@rideshare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-brand-500 font-bold hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-indigo-300 text-white rounded-2xl py-3.5 font-semibold text-sm transition-all duration-200 shadow-premium hover:shadow-premium-hover hover:scale-[1.01] active:scale-95 flex items-center justify-center"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 font-bold hover:underline">Sign up now</Link>
          </p>
        </div>

        {/* Demo Accounts box */}
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-slate-700">Quick Demo Accounts:</h4>
          <div className="space-y-1.5 text-[10px] text-slate-550 font-semibold leading-relaxed">
            <div>🔑 <span className="font-bold text-slate-700">Passenger:</span> priya@passenger.com (pass: password123)</div>
            <div>🔑 <span className="font-bold text-slate-700">Driver:</span> arjun@driver.com (pass: password123)</div>
            <div>🔑 <span className="font-bold text-slate-700">Admin:</span> admin@ridesharex.com (pass: adminpassword)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
