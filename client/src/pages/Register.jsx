import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User, Phone, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [referral, setReferral] = useState('');
  const [role, setRole] = useState('passenger');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, phone, referral, gender);
      if (role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-slate-50/30">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 p-8 shadow-premium space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-550">Share commutes across India and split expenses</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-700 leading-normal">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sign Up As</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setRole('passenger')}
                className={`py-2.5 rounded-2xl font-bold text-xs tracking-wide border transition-all ${role === 'passenger' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
              >
                Passenger
              </button>
              <button 
                type="button"
                onClick={() => setRole('driver')}
                className={`py-2.5 rounded-2xl font-bold text-xs tracking-wide border transition-all ${role === 'driver' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
              >
                Driver / Vehicle Owner
              </button>
            </div>
          </div>

          {/* Full Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Rohan Sen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="rohan@rideshare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Phone input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number (For OTP)</label>
            <div className="relative">
              <input 
                type="tel" 
                placeholder="+91 99999 88888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                required
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

           {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
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

          {/* Gender selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gender</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Referral Code input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Code (Optional)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="INVITE100"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Enter a friend's referral code to receive ₹100 credit on registration.</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-indigo-300 text-white rounded-2xl py-3.5 font-semibold text-sm transition-all duration-200 shadow-premium hover:shadow-premium-hover hover:scale-[1.01] active:scale-95 flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
