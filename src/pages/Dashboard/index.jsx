import React from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MetricsGrid from './components/MetricsGrid';
import ChartsSection from './components/ChartsSection';
import TopProducts from './components/TopProducts';
import { Calendar, Download, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full flex bg-slate-50/50 font-sans antialiased">
      {/* Panel Izquierdo de Navegación */}
      <Sidebar />

      {/* Contenedor del Cuerpo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar Superior */}
        <Navbar />

        {/* Zona de Contenido Scrolleable */}
        <main className="p-6 space-y-6 overflow-y-auto w-full max-w-[1600px] mx-auto">
          
          {/* Fila de Filtros de Fecha */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-semibold text-gray-700 shadow-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>Rango de fechas:</span>
                <span className="text-gray-900 font-bold ml-1">16/05/2025 - 16/05/2025</span>
              </div>
              
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-500 font-medium">
                <span>Comparar con:</span>
                <span className="text-gray-700 font-semibold">09/05/2025 - 15/05/2025</span>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <Download size={16} />
              <span>Exportar reporte</span>
            </button>
          </div>

          {/* Fila de Contenedores KPI */}
          <MetricsGrid />

          {/* Fila Combinada: Gráficos de barra/área y Top de Productos (Calce milimétrico) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartsSection />
            </div>
            <div>
              <TopProducts />
            </div>
          </div>

          {/* FILA INFERIOR: TABLAS DE STOCK CRÍTICO Y ÚLTIMAS VENTAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[340px] flex items-center justify-center text-gray-400 font-medium">
              [Tabla Stock Crítico - Próximo paso]
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[340px] flex items-center justify-center text-gray-400 font-medium">
              [Tabla Últimas Ventas - Próximo paso]
            </div>
          </div>

          {/* Footer Informativo de Sincronización Automática */}
          <footer className="flex items-center justify-between text-[11px] font-medium text-gray-400 pt-2 border-t border-gray-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sincronización automática activada</span>
              <span className="text-gray-300">|</span>
              <span>Última actualización: 16/05/2025 10:23:45 a. m.</span>
            </div>
            <button className="flex items-center gap-1 hover:text-cixoil-red transition-colors font-bold">
              <RefreshCw size={12} /> Actualizar datos
            </button>
          </footer>

        </main>
      </div>
    </div>
  );
}