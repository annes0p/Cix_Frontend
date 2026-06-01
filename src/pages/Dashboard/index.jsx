
import React, { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import MatricsGrid from './components/MatricsGrid';
import ChartsSection from './components/ChartsSection';
import TopProducts from './components/TopProducts';
import StockCritico from './components/StockCritico';
import UltimasVentas from './components/UltimasVentas';
import { Calendar, Download, RefreshCw, Loader2 } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';


export default function Dashboard() {
  const [fecha, setFecha] = useState('2026-06-01'); 
  const [empresa, setEmpresa] = useState('CIXOIL S.A.C.');
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummaryData(fecha, empresa);
      setDashboardData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fecha, empresa]);

  return (
    <div className="min-h-screen w-full flex bg-slate-50/50 font-sans antialiased">
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar currentCompany={empresa} onChangeCompany={setEmpresa} />
        <main className="p-6 space-y-6 overflow-y-auto w-full max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 font-semibold text-gray-700 shadow-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>Rango de fechas:</span>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bg-transparent border-none font-bold text-gray-900 focus:outline-none cursor-pointer text-xs"
                />
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm shrink-0">
              <Download size={16} />
              <span>Exportar reporte</span>
            </button>
          </div>


          {error && (
            <div className="p-3.5 bg-red-50 border-l-4 border-cixoil-red text-cixoil-red rounded-r-xl text-xs font-semibold transition-all">
              ⚠️ Modo offline: {error}. Desplegando maquetación y datos optimizados del sistema.
            </div>
          )}


          {loading ? (
            <div className="h-96 w-full flex flex-col items-center justify-center gap-3 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-cixoil-red" />
              <p className="text-sm animate-pulse">Sincronizando con base de datos de CIXOIL...</p>
            </div>
          ) : (
            <>
              <MatricsGrid data={dashboardData?.metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartsSection chartData={dashboardData?.chartData} />
                </div>
                <div>
                  <TopProducts productsData={dashboardData?.topProducts} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <StockCritico tableData={dashboardData?.criticalStock} />
                </div>
                <div>
                  <UltimasVentas salesData={dashboardData?.latestSales} />
                </div>
              </div>
            </>
          )}

          <footer className="flex items-center justify-between text-[11px] font-medium text-gray-400 pt-2 border-t border-gray-200/60">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{loading ? 'Consultando...' : 'Sincronización automática activada'}</span>
              <span className="text-gray-300">|</span>
              <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            </div>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-1 hover:text-cixoil-red transition-colors font-bold disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Actualizar datos
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}




