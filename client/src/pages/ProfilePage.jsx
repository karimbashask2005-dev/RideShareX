import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, FileText, ShieldCheck, CheckCircle2, AlertCircle, KeySquare } from 'lucide-react';

export default function ProfilePage() {
  const { user, completeProfile, verifyPhone, verifyEmail } = useAuth();
  
  // Profile Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Other');
  const [bio, setBio] = useState(user?.bio || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [city, setCity] = useState(user?.city || '');

  // OTP Verification Simulator states
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await completeProfile({
        name,
        phone,
        gender,
        bio,
        emergencyContact,
        preferredLanguage,
        city
      });
      alert('Profile updated successfully.');
    } catch (err) {
      alert(err.message || 'Error updating profile');
    }
  };

  const triggerOtpSend = () => {
    setOtpSent(true);
    setOtpOpen(true);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setTimeout(async () => {
      try {
        await verifyPhone();
        await verifyEmail();
        setOtpLoading(false);
        setOtpOpen(false);
        alert('Phone & Email identities verified! Verification badge added to your profile.');
      } catch (err) {
        setOtpLoading(false);
        alert('OTP Verification failed.');
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Verification / Trust Badge summary card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4.5">
          <div className="relative">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt={user?.name} 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50"
            />
            {user?.isPhoneVerified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white" title="Identity Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h2 className="font-outfit font-extrabold text-slate-800 text-xl flex items-center">
              <span>{user?.name}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">{user?.role} account</p>
          </div>
        </div>

        <div>
          {user?.isPhoneVerified ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 rounded-2xl py-2 px-4 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Identity Fully Verified</span>
            </div>
          ) : (
            <button 
              onClick={triggerOtpSend}
              className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl py-2.5 px-5 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <KeySquare className="w-4.5 h-4.5 animate-pulse" />
              <span>Verify Mobile & Email (OTP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Settings Edit Form */}
      <form onSubmit={handleUpdate} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
        <div className="space-y-1">
          <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Personal Account Information</h3>
          <p className="text-xs text-slate-400">Update your details shown publicly to ride sharers and system admins.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none"
                required
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-150 rounded-2xl pl-10 pr-4 py-3 cursor-not-allowed"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none"
                required
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4.5 py-3.5 focus:outline-none cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Languages Spoken</label>
            <input 
              type="text" 
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              placeholder="e.g. Hindi, English, Telugu"
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home City</label>
            <input 
              type="text" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Guntur"
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5 md:col-span-2 border-t border-slate-50 pt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency SOS Contact (For Safety Modules)</label>
            <div className="relative">
              <input 
                type="tel" 
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. +91 99999 11111 (Parent/Guardian phone)"
                className="w-full text-xs font-semibold text-slate-750 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-450"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">🚨</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">This number will receive auto SMS triggers or call links when SOS is launched in-trip.</p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5 md:col-span-2 border-t border-slate-50 pt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio (Introductions)</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short introduction for co-travelers..."
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none min-h-[90px]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <button 
            type="submit"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center scale-100 active:scale-95"
          >
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* OTP verification simulated overlay modal popup */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleOtpVerify}
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="text-center space-y-2">
              <span className="text-3xl">📱</span>
              <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Enter OTP Code</h3>
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                Simulated 4-digit code dispatched to <span className="font-bold text-slate-700">{user?.phone}</span>.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">SMS Verification OTP Code</label>
              <input 
                type="text" 
                placeholder="4 3 2 1"
                maxLength="4"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-extrabold text-slate-800 bg-slate-50 border border-slate-100 rounded-2xl py-2.5 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => setOtpOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-500 hover:bg-slate-50 py-3 rounded-xl transition-all"
              >
                Close
              </button>
              <button 
                type="submit"
                disabled={otpLoading}
                className="w-full text-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-850 disabled:bg-slate-400 py-3 rounded-xl transition-all flex items-center justify-center"
              >
                {otpLoading ? (
                  <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Submit OTP'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
