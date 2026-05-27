import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Heart, Shield, Award, Fuel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                <Car className="w-5.5 h-5.5" />
              </div>
              <span className="font-outfit font-extrabold text-xl tracking-tight text-white">
                RideShare<span className="text-brand-500">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              India's premier intercity carpooling network. Connecting commuters, building trust, and driving sustainable transit solutions across states.
            </p>
            <div className="flex items-center space-x-3.5 pt-2">
              <span className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Shield className="w-4 h-4" />
              </span>
              <span className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Award className="w-4 h-4" />
              </span>
              <span className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                <Fuel className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Discover</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">Find a Ride</Link>
              </li>
              <li>
                <Link to="/publish" className="hover:text-white transition-colors">Offer a Ride</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/subscription" className="hover:text-white transition-colors">Plus Memberships</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Support & Trust</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">Women Safety</Link>
              </li>
              <li>
                <Link to="/verification" className="hover:text-white transition-colors">ID Verification</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Location Focus */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Popular Hubs</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <span className="hover:text-white cursor-pointer transition-colors">Hyderabad</span>
              <span className="hover:text-white cursor-pointer transition-colors">Bengaluru</span>
              <span className="hover:text-white cursor-pointer transition-colors">Guntur</span>
              <span className="hover:text-white cursor-pointer transition-colors">Vijayawada</span>
              <span className="hover:text-white cursor-pointer transition-colors">Chennai</span>
              <span className="hover:text-white cursor-pointer transition-colors">Visakhapatnam</span>
              <span className="hover:text-white cursor-pointer transition-colors">Tirupati</span>
              <span className="hover:text-white cursor-pointer transition-colors">Nellore</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} RideShareX India. All rights reserved.</p>
          <p className="flex items-center mt-2 md:mt-0">
            Made with <Heart className="w-3.5 h-3.5 mx-1 text-rose-500 fill-current" /> for Indian Intercity Commuting.
          </p>
        </div>
      </div>
    </footer>
  );
}
