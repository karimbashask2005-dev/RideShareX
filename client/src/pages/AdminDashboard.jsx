import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import StatsCard from '../components/admin/StatsCard';
import RevenueChart from '../components/admin/RevenueChart';
import { 
  Users, MapPin, Landmark, Settings, Percent, 
  ShieldAlert, Megaphone, ShieldCheck, Plus, Check, X,
  FileText, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications'
  const [dashboardData, setDashboardData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [adList, setAdList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification Documents lists
  const [pendingDocs, setPendingDocs] = useState({ idDocuments: [], driverDocuments: [], vehicleDocuments: [] });
  const [rejectionDocId, setRejectionDocId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState({});

  // Settings state
  const [commissionRate, setCommissionRate] = useState(12);
  const [referralReward, setReferralReward] = useState(100);

  // New Ad form state
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImage, setNewAdImage] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdPosition, setNewAdPosition] = useState('dashboard');

  const fetchDashboardDetails = async () => {
    setLoading(true);
    try {
      const dbStats = await adminService.getDashboard();
      setDashboardData(dbStats);
      setCommissionRate(dbStats.stats.commissionRate);

      const users = await adminService.getUsers();
      setUserList(users);

      const ads = await adminService.getAds();
      setAdList(ads);

      await fetchPendingVerifications();
    } catch (err) {
      console.error('[AdminDashboard] Error loading details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const verifs = await adminService.getPendingVerifications();
      setPendingDocs(verifs);
    } catch (err) {
      console.error('[AdminDashboard] Error loading verifications', err);
    }
  };

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      alert('User status toggled successfully.');
      fetchDashboardDetails();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSettings({
        commissionRate: Number(commissionRate),
        referralReward: Number(referralReward)
      });
      alert('System configuration updated successfully.');
      fetchDashboardDetails();
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    try {
      await adminService.createAd({
        title: newAdTitle,
        imageUrl: newAdImage,
        linkUrl: newAdLink,
        position: newAdPosition
      });
      alert('New sponsored ad placement created.');
      setNewAdTitle('');
      setNewAdImage('');
      setNewAdLink('');
      fetchDashboardDetails();
    } catch (err) {
      alert('Failed to place ad');
    }
  };

  const handleApproveDoc = async (id, docType) => {
    try {
      await adminService.approveVerification(id, docType);
      alert(`The ${docType} document was approved. User trust score updated.`);
      await fetchDashboardDetails();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleRejectDoc = async (id, docType) => {
    const reason = rejectionReason[id];
    if (!reason || !reason.trim()) {
      alert('Please fill out the reason for rejecting this document.');
      return;
    }
    try {
      await adminService.rejectVerification(id, docType, reason);
      alert(`The ${docType} document was rejected. User notified.`);
      setRejectionDocId(null);
      await fetchDashboardDetails();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto py-16 space-y-6">
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { stats, monthlyRevenue } = dashboardData;

  const totalPendingVerifications = 
    (pendingDocs.idDocuments?.length || 0) + 
    (pendingDocs.driverDocuments?.length || 0) + 
    (pendingDocs.vehicleDocuments?.length || 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800">System Administrator Control Panel</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage users, adjust commission structures, publish ads, and approve publisher identity documents.</p>
        </div>
      </div>

      {/* Tab controls */}
      <div className="border-b border-slate-100 flex space-x-6 text-sm font-bold tracking-wide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 border-b-2 transition-all ${activeTab === 'overview' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Overview & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('verifications')}
          className={`pb-4 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'verifications' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Pending Verifications
          {totalPendingVerifications > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {totalPendingVerifications}
            </span>
          )}
        </button>
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <>
          {/* Grid Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Users Registered" 
              value={stats.totalUsers} 
              icon={Users} 
              description="Drivers, passengers & moderators"
            />
            <StatsCard 
              title="Gross Booking GMV" 
              value={`₹${stats.totalGrossBookingAmount}`} 
              icon={Landmark} 
              description="Aggregated platform ride ledger"
            />
            <StatsCard 
              title="Commission Income (12%)" 
              value={`₹${stats.totalCommissionEarned}`} 
              icon={Percent} 
              description="Net platform fee earnings"
              trend="+34%"
              trendType="positive"
            />
            <StatsCard 
              title="Offered Trip Listings" 
              value={stats.totalRides} 
              icon={MapPin} 
              description="Intercity routes scheduled"
            />
          </div>

          {/* SVG Financial Performance Line Chart */}
          <RevenueChart data={monthlyRevenue} />

          {/* User Management Table */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="font-outfit font-extrabold text-slate-800 text-base">User Registration & Escalation Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Identity</th>
                    <th className="py-3 px-4">Driver Spec</th>
                    <th className="py-3 px-4">Wallet Bal.</th>
                    <th className="py-3 px-4">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {userList.map((userRow) => (
                    <tr key={userRow.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 flex items-center space-x-2.5">
                        <img src={userRow.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-800">{userRow.name}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">Trust Score: {userRow.trustScore || 20}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-normal">{userRow.email}<br />{userRow.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          userRow.role === 'admin' ? 'bg-rose-50 text-rose-600' : userRow.role === 'driver' ? 'bg-indigo-50 text-brand-650' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {userRow.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {userRow.isIdentityVerified ? (
                          <span className="text-emerald-500 font-bold">Verified ✅</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Unverified</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {userRow.isDriverVerified ? (
                          <span className="text-indigo-500 font-bold">Active Driver 🚗</span>
                        ) : (
                          <span className="text-slate-400 font-normal">No DL Specs</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">₹{userRow.walletBalance}</td>
                      <td className="py-3.5 px-4">
                        <button 
                          onClick={() => handleToggleUser(userRow.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                            userRow.status === 'active' 
                              ? 'bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-650' 
                              : 'bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-650'
                          }`}
                        >
                          {userRow.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings adjust form */}
            <form onSubmit={handleUpdateSettings} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-5">
              <div className="space-y-0.5">
                <h3 className="font-outfit font-extrabold text-slate-805 text-base">Platform Configurations</h3>
                <p className="text-[10px] text-slate-400">Configure global platform commission fee percentages and referral payouts.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-650">Default Booking Commission (%)</label>
                    <span className="text-sm font-extrabold text-brand-600">{commissionRate}%</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="25"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650">Referral Bonus Wallet Credits (₹)</label>
                  <input 
                    type="number"
                    value={referralReward}
                    onChange={(e) => setReferralReward(Number(e.target.value))}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3 px-5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Save System Settings</span>
                </button>
              </div>
            </form>

            {/* Sponsor Ads placers */}
            <form onSubmit={handleCreateAd} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4.5">
              <div className="space-y-0.5">
                <h3 className="font-outfit font-extrabold text-slate-855 text-base">Sponsored Ad Campaigns</h3>
                <p className="text-[10px] text-slate-400">Launch dynamic search-page ad banners targeting intercity commuters.</p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Save 20% on Zoomcar rentals this week!"
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Link VPA</label>
                    <input 
                      type="text"
                      placeholder="https://zoomcar.com"
                      value={newAdLink}
                      onChange={(e) => setNewAdLink(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placement Slot</label>
                    <select 
                      value={newAdPosition}
                      onChange={(e) => setNewAdPosition(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none cursor-pointer"
                    >
                      <option value="dashboard">Dashboard Banner</option>
                      <option value="search">Search Feed Card</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ad Cover Image URL</label>
                  <input 
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newAdImage}
                    onChange={(e) => setNewAdImage(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white rounded-2xl py-3 px-5 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch Ad Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* VERIFICATIONS TAB CONTENT (ADMIN APPROVAL PANEL) */}
      {activeTab === 'verifications' && (
        <div className="space-y-8">
          
          {/* 1. Government ID Requests */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <FileText className="h-5 w-5 text-brand-500" />
              <h3 className="font-outfit font-extrabold text-slate-800 text-base">Government ID Approvals</h3>
            </div>

            {(!pendingDocs.idDocuments || pendingDocs.idDocuments.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending Government ID verification requests.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingDocs.idDocuments.map((doc) => (
                  <div key={doc.id || doc._id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100 uppercase tracking-wider">{doc.docType}</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-2">Applicant: {doc.user?.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{doc.user?.email}</p>
                        <p className="text-xs font-mono text-slate-700 mt-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 inline-block">Doc ID: {doc.docNumber}</p>
                      </div>
                      
                      <div className="h-16 w-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0 cursor-zoom-in" onClick={() => window.open(doc.docImage, '_blank')}>
                        <img src={doc.docImage} alt="Identity Proof" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {rejectionDocId === (doc.id || doc._id) ? (
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provide rejection reason</label>
                        <textarea
                          rows="2"
                          placeholder="e.g. Document image is blurry / name mismatch."
                          value={rejectionReason[doc.id || doc._id] || ''}
                          onChange={(e) => setRejectionReason({ ...rejectionReason, [doc.id || doc._id]: e.target.value })}
                          className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectionDocId(null)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDoc(doc.id || doc._id, 'identity')}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => setRejectionDocId(doc.id || doc._id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 text-rose-650 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleApproveDoc(doc.id || doc._id, 'identity')}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-100 text-emerald-650 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Driving License & RC Requests */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <MapPin className="h-5 w-5 text-brand-500" />
              <h3 className="font-outfit font-extrabold text-slate-800 text-base">Driving License & Vehicle RC Approvals</h3>
            </div>

            {(!pendingDocs.driverDocuments || pendingDocs.driverDocuments.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending Driver verification requests.</p>
            ) : (
              <div className="space-y-6">
                {pendingDocs.driverDocuments.map((doc) => {
                  // Find corresponding vehicle document
                  const vehDoc = pendingDocs.vehicleDocuments?.find(v => v.driver?.id === doc.user?.id || v.driver === doc.user?.id || v.driver?._id === doc.user?.id);
                  
                  return (
                    <div key={doc.id || doc._id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 flex flex-col gap-5">
                      
                      {/* Driver & Veh details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Column 1: Applicant Details */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm">Applicant Driver</h4>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-xs">{doc.user?.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{doc.user?.email}</span>
                          
                          <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-650">
                            <div><span className="font-semibold text-slate-400">DL Number:</span> <span className="font-mono">{doc.licenseNumber}</span></div>
                            <div><span className="font-semibold text-slate-400">RC Number:</span> <span className="font-mono">{doc.rcNumber}</span></div>
                          </div>
                        </div>

                        {/* Column 2: Vehicle details */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm">Vehicle Profile Specs</h4>
                          {vehDoc ? (
                            <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-650">
                              <div><span className="font-semibold text-slate-400">Model:</span> {vehDoc.vehicleModel}</div>
                              <div><span className="font-semibold text-slate-400">Type:</span> {vehDoc.vehicleType}</div>
                              <div><span className="font-semibold text-slate-400">Car Number:</span> <span className="font-mono">{vehDoc.vehicleNumber}</span></div>
                              <div><span className="font-semibold text-slate-400">Seats:</span> {vehDoc.seatsAvailable} Passenger Seats</div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No matching vehicle configuration specs attached yet.</p>
                          )}
                        </div>

                        {/* Column 3: Document Attachments images */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-800 text-sm">Uploaded Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex flex-col items-center">
                              <div className="h-12 w-20 bg-slate-105 border border-slate-200 rounded-lg overflow-hidden shrink-0 cursor-zoom-in" onClick={() => window.open(doc.licenseImage, '_blank')}>
                                <img src={doc.licenseImage} alt="License" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">License</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-12 w-20 bg-slate-105 border border-slate-200 rounded-lg overflow-hidden shrink-0 cursor-zoom-in" onClick={() => window.open(doc.rcImage, '_blank')}>
                                <img src={doc.rcImage} alt="RC" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">RC Book</span>
                            </div>
                            {doc.insuranceImage && (
                              <div className="flex flex-col items-center">
                                <div className="h-12 w-20 bg-slate-105 border border-slate-200 rounded-lg overflow-hidden shrink-0 cursor-zoom-in" onClick={() => window.open(doc.insuranceImage, '_blank')}>
                                  <img src={doc.insuranceImage} alt="Insurance" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Insurance</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Reject Form / Approve Actions */}
                      {rejectionDocId === (doc.id || doc._id) ? (
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provide rejection reason</label>
                          <textarea
                            rows="2"
                            placeholder="e.g. License has expired / RC number doesn't match plate."
                            value={rejectionReason[doc.id || doc._id] || ''}
                            onChange={(e) => setRejectionReason({ ...rejectionReason, [doc.id || doc._id]: e.target.value })}
                            className="w-full text-xs font-medium text-slate-755 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRejectionDocId(null)}
                              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleRejectDoc(doc.id || doc._id, 'driver');
                                if (vehDoc) handleRejectDoc(vehDoc.id || vehDoc._id, 'vehicle');
                              }}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => setRejectionDocId(doc.id || doc._id)}
                            className="flex-1 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100 text-rose-650 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <X className="h-4 w-4" /> Reject Credentials
                          </button>
                          <button
                            onClick={async () => {
                              await handleApproveDoc(doc.id || doc._id, 'driver');
                              if (vehDoc) await handleApproveDoc(vehDoc.id || vehDoc._id, 'vehicle');
                            }}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-100 text-emerald-650 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check className="h-4 w-4" /> Approve & Enable Driver
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
