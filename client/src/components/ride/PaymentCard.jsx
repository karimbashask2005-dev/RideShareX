import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle2, AlertTriangle, Landmark } from 'lucide-react';

export default function PaymentCard({ amount, onPaymentSuccess, onClose }) {
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'failed'
  
  // Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess({
          gateway: 'razorpay',
          paymentId: 'pay_rzp_' + Math.floor(100000 + Math.random() * 900000),
          signature: 'sig_rzp_' + Math.floor(100000 + Math.random() * 900000)
        });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 transform scale-100 transition-transform">
        
        {/* Razorpay Brand Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center font-extrabold text-[10px]">R</span>
            <div>
              <span className="font-bold text-xs tracking-wider text-slate-400 block uppercase leading-none">SECURE CHECKOUT</span>
              <span className="font-outfit font-extrabold text-sm mt-0.5 block leading-none">Razorpay <span className="text-brand-400">Gateway</span></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">Payable Amount</span>
            <span className="font-outfit font-extrabold text-lg text-white mt-1 block">₹{amount}</span>
          </div>
        </div>

        {status === 'success' ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-outfit font-extrabold text-xl text-slate-800">Transaction Successful</h3>
            <p className="text-xs text-slate-500">Signature verified. Funds processed into wallet ledger. Please wait...</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-3">
              <button 
                onClick={() => setMethod('card')}
                className={`py-2 px-3 rounded-xl flex flex-col items-center text-[10px] font-bold tracking-wide transition-all ${method === 'card' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                CARD
              </button>
              <button 
                onClick={() => setMethod('upi')}
                className={`py-2 px-3 rounded-xl flex flex-col items-center text-[10px] font-bold tracking-wide transition-all ${method === 'upi' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                <Smartphone className="w-4 h-4 mb-1" />
                UPI / GPAY
              </button>
              <button 
                onClick={() => setMethod('net')}
                className={`py-2 px-3 rounded-xl flex flex-col items-center text-[10px] font-bold tracking-wide transition-all ${method === 'net' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                <Landmark className="w-4 h-4 mb-1" />
                NETBANKING
              </button>
            </div>

            {/* Fields */}
            {method === 'card' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVV</label>
                    <input 
                      type="password" 
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Virtual Payment Address (VPA)</label>
                  <input 
                    type="text" 
                    placeholder="name@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                    <button 
                      key={app}
                      type="button" 
                      onClick={() => setUpiId(`demo@${app.toLowerCase().replace(' ', '')}`)}
                      className="py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'net' && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Banks</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                    <button 
                      key={bank}
                      type="button"
                      onClick={handlePay}
                      className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-left text-xs font-semibold text-slate-700 flex items-center space-x-2"
                    >
                      <Landmark className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{bank}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Shield & Controls */}
            <div className="pt-3 flex items-start space-x-2.5 text-[10px] text-slate-400 font-semibold leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>Razorpay features 256-bit bank-grade encryption to protect payments. Card data is never stored locally.</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-50">
              <button 
                type="button" 
                onClick={onClose}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={loading}
                onClick={handlePay}
                className="w-full text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Pay ₹${amount}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
