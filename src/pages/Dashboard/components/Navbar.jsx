import React from 'react';
import { Menu, Bell, Calendar, Download, Building2, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white h-16 border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Lado Izquierdo */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-800 lg:hidden">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-cixoil-red tracking-tight">Dashboard</h1>
          <span className="text-gray-300">|</span>
          <p className="text-xs font-medium text-gray-500 hidden sm:block">Resumen general de la gestión de CIXOIL</p>
        </div>
      </div>

      {/* Lado Derecho */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cixoil-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Dropdown Empresa */}
        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
          <Building2 size={16} className="text-cixoil-red" />
          <span>CIXOIL S.A.S.</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}