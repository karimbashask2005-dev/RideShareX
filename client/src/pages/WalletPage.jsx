import React, { useState, useEffect } from 'react';
import { walletService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/admin/StatsCard';
import PaymentCard from '../components/ride/PaymentCard';
import { Wallet, IndianRupee, ArrowDownCircle, ArrowUpCircle, Plus, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  
  // Deposit modal
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(500);

  const fetchWalletDetails = async () => {
    setLoading(true);
    try {
      const data = await walletService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error('[WalletPage] Error fetching wallet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleDepositSuccess = async (paymentDetails) => {
    try {
      await walletService.addMoney(depositAmount);
      setDepositOpen(false);
      alert(`₹${depositAmount} successfully credited to wallet via Razorpay checkout.`);
      refreshUser();
      fetchWalletDetails();
    } catch (err) {
      alert('Error recording transaction');
    }
  };

  const handleSubscribe = async (plan, price) => {
    if (user.walletBalance < price) {
      alert(`Insufficient funds. Please add ₹${price - user.walletBalance} to your wallet first.`);
      return;
    }
    try {
      await walletService.subscribe(plan, price);
      alert(`Successfully subscribed to ${plan.toUpperCase()} Plan! Platform fee discount active.`);
      refreshUser();
      fetchWalletDetails();
    } catch (err) {
      alert(err.message || 'Error subscribing');
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard 
          title="Current Balance" 
          value={`₹${user?.walletBalance || 0}`} 
          icon={Wallet} 
          description="Available for booking and splits"
        />
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium flex items-center justify-between hover:shadow-premium-hover transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Add Money</span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">Top-up instantly using Razorpay credit card/UPI</p>
            
            {/* Quick deposit input */}
            <div className="flex items-center space-x-2 mt-3">
              <input 
                type="number" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-24 bg-slate-50 border border-slate-100 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-800 focus:outline-none"
              />
              <button 
                onClick={() => setDepositOpen(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-1.5 px-3.5 text-xs font-bold transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Recharge</span>
              </button>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand-500">
            <Plus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Subscription Pricing plans card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
        <div className="space-y-1">
          <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Platform Premium Plans</h3>
          <p className="text-xs text-slate-400">Unlock zero platform commission fees, priority support, and premium profile badges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Free Plan */}
          <div className="border border-slate-100 rounded-2xl p-5 space-y-4 relative bg-slate-50/20">
            <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Free Club</h4>
            <div className="font-outfit font-extrabold text-2xl text-slate-900">₹0 <span className="text-xs text-slate-400 font-medium">/ month</span></div>
            <ul className="text-xs text-slate-500 space-y-2.5">
              <li>• Standard 12% booking commission</li>
              <li>• Standard search visibility</li>
              <li>• Ad banners visible</li>
            </ul>
            <div className="pt-2">
              <span className="block text-center text-xs font-bold text-slate-400 bg-slate-100 py-2 rounded-xl">
                {user?.subscription?.plan === 'free' ? 'Currently Active' : 'Basic Tier'}
              </span>
            </div>
          </div>

          {/* Plus Plan */}
          <div className="border border-brand-200 rounded-2xl p-5 space-y-4 relative bg-white shadow-premium">
            <span className="absolute -top-3.5 right-4 bg-brand-500 text-white font-bold text-[8px] uppercase px-2.5 py-1 rounded-full tracking-widest">Recommended</span>
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Plus Club</h4>
            <div className="font-outfit font-extrabold text-2xl text-brand-600">₹199 <span className="text-xs text-slate-400 font-medium">/ month</span></div>
            <ul className="text-xs text-slate-500 space-y-2.5">
              <li>• <strong>50% discount</strong> on booking commission</li>
              <li>• Priority ride search visibility</li>
              <li>• Completely Ad-free experience</li>
              <li>• Plus Verification Badge</li>
            </ul>
            <div className="pt-2">
              <button 
                onClick={() => handleSubscribe('plus', 199)}
                disabled={user?.subscription?.plan === 'plus'}
                className="w-full text-center text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-slate-100 disabled:text-slate-400 py-2 rounded-xl transition-colors"
              >
                {user?.subscription?.plan === 'plus' ? 'Active Membership' : 'Subscribe for ₹199'}
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border border-amber-200 rounded-2xl p-5 space-y-4 relative bg-amber-50/10">
            <h4 className="font-bold text-sm text-slate-850 uppercase tracking-wider">Premium Club</h4>
            <div className="font-outfit font-extrabold text-2xl text-amber-600">₹499 <span className="text-xs text-slate-400 font-medium">/ month</span></div>
            <ul className="text-xs text-slate-500 space-y-2.5">
              <li>• <strong>0% booking commission</strong> (Fully waived)</li>
              <li>• Top priority search visibility</li>
              <li>• Ad-free & VIP priority support</li>
              <li>• Premium Golden Badge</li>
            </ul>
            <div className="pt-2">
              <button 
                onClick={() => handleSubscribe('premium', 499)}
                disabled={user?.subscription?.plan === 'premium'}
                className="w-full text-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 py-2 rounded-xl transition-colors"
              >
                {user?.subscription?.plan === 'premium' ? 'Active VIP Membership' : 'Subscribe for ₹499'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
        <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Transaction Ledger History</h3>
        
        {loading ? (
          <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ) : wallet.transactions.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No transaction records found.</div>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="p-3.5 border border-slate-50 hover:bg-slate-50/30 rounded-2xl flex items-center justify-between transition-colors duration-150 text-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {tx.type === 'credit' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{tx.description}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-outfit font-extrabold text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-0.5">Ref: {tx.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Razorpay Topup Modal popup */}
      {depositOpen && (
        <PaymentCard 
          amount={depositAmount} 
          onPaymentSuccess={handleDepositSuccess}
          onClose={() => setDepositOpen(false)}
        />
      )}
    </div>
  );
}
