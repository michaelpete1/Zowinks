"use client";

import Navbar from "../../../components/NewNavbar";

export default function HPDesktop() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-emerald-800 bg-clip-text text-transparent drop-shadow-2xl">
            HP Desktops
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            EliteDesk workstations for enterprise.
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg text-slate-500">HP desktops coming soon...</p>
        </div>
      </div>
    </div>
  );
}
