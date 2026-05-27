import React from 'react';
import { Link } from 'react-router-dom';
import HeroSearchForm from '../components/ride/HeroSearchForm';
import { ShieldCheck, Users, Zap, CheckCircle2, Navigation, Award, Fuel } from 'lucide-react';

export default function Home() {
  const popularRoutes = [
    { source: 'Guntur', destination: 'Hyderabad', duration: '5h 15m', fare: '₹450', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=250' },
    { source: 'Hyderabad', destination: 'Bengaluru', duration: '9h 30m', fare: '₹1200', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=250' },
    { source: 'Vijayawada', destination: 'Chennai', duration: '7h 45m', fare: '₹850', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=250' },
    { source: 'Tirupati', destination: 'Bengaluru', duration: '4h 30m', fare: '₹550', img: 'https://images.unsplash.com/photo-1600100397608-f010e4219717?auto=format&fit=crop&q=80&w=250' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white pt-24 pb-32 px-4 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs font-semibold text-brand-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Smart Carpooling for Intercity Commutes in India</span>
          </div>
          
          <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-4xl mx-auto leading-[1.1] text-glow">
            Your Ride. Your Choice. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 to-accent-300 bg-clip-text text-transparent">Travel Together, Save Smarter.</span>
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Connect with verified drivers heading your way. Share seats, split fuel costs, reduce carbon footprint, and travel with trust.
          </p>

          {/* Search Form overlay */}
          <div className="pt-8">
            <HeroSearchForm />
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center md:text-left">
          <h2 className="font-outfit font-bold text-3xl text-slate-800">Popular Commutes</h2>
          <p className="text-sm text-slate-500 mt-1">Book highly rated daily trips at split fares</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((route, i) => (
            <Link 
              key={i}
              to={`/search?source=${route.source}&destination=${route.destination}&date=${new Date().toISOString().split('T')[0]}&seats=1`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={route.img} 
                  alt={route.source} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-brand-650">
                  From {route.fare}
                </span>
              </div>
              <div className="p-5 space-y-1">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>{route.source}</span>
                  <Navigation className="w-3.5 h-3.5 text-brand-400 rotate-90" />
                  <span>{route.destination}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Duration: {route.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Safety & Trust Pillars */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-outfit font-bold text-3xl text-slate-800">Why RideShareX?</h2>
            <p className="text-sm text-slate-500">Security, affordability, and convenience built directly into the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-slate-100/80 shadow-premium space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-800">Verified Profiles</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Every member is checked with phone and email verification. Driver license registrations are vetted for maximum passenger safety.
              </p>
            </div>
            
            <div className="bg-white p-7 rounded-3xl border border-slate-100/80 shadow-premium space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand-500">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-800">Women-Only Rides</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Enable peace-of-mind travel. Female drivers can publish women-only trips, ensuring exclusive seating for female travelers.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-100/80 shadow-premium space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <Fuel className="w-6 h-6" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-800">Eco-Friendly Savings</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                By pooling seats together, commuters save up to 75% on fuel costs compared to private cabs while lowering greenhouse gas emissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Promo banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-500 to-indigo-650 rounded-[36px] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          
          <div className="space-y-3.5 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/20 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              PLUS MEMBER CLUB
            </span>
            <h2 className="font-outfit font-extrabold text-2xl md:text-3xl leading-tight">
              Enjoy 100% Waived Platform Booking Commission
            </h2>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
              Subscribe to our RideShareX Plus/Premium plan from ₹199/month and escape platform booking fees, get ad-free dashboard experience, and receive priority listings.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link 
              to="/subscription" 
              className="px-6.5 py-3.5 bg-white hover:bg-slate-50 text-brand-650 font-bold text-sm rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Explore Plus Plans
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
