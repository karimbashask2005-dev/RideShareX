import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
