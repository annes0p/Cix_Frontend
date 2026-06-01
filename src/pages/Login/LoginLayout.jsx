import React from 'react';
import { User, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import logocixoil from '../../assets/logocixoil.jpeg';
import bglogin from '../../assets/bglogin.png';

import { ShieldCheck, Settings, BarChart3 } from 'lucide-react';

export default function LoginLayout() {
    return (
        <div className="hidden lg:flex w-1/2 bg-cixoil-darkBg relative flex-col justify-between p-12 overflow-hidden text-white">

            <img
                src={bglogin}
                alt="Fondo Planta Cixoil"
                className="absolute inset-0 w-full h-full object-cover opacity-65 z-0 select-none pointer-events-none"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-zinc-950/70 to-[#3a0000]/60 z-0 mix-blend-multiply opacity-60"></div>

            {/* Header Izquierdo - Logo */}
            <div className="z-10 flex flex-col items-start">
                <div className="w-32 h-32 flex items-center justify-center mb-8 overflow-hidden">
                    <img
                        src={logocixoil}
                        alt="Cixoil Logo"
                        className="w-full h-full object-contain brightness-110"
                    />
                </div>

                {/* Copys Principales */}
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-lg text-white">
                    Potencia y protección <br />
                    <span className="text-cixoil-green font-black">para cada motor</span>
                </h1>
                <p className="text-gray-300 text-base max-w-md mt-4 leading-relaxed font-medium drop-shadow-sm">
                    Gestiona tus inventarios, ventas y clientes de forma eficiente con{' '}
                    <span className="text-white font-semibold">CIXOIL S.A.C.</span>.
                </p>
            </div>

            {/* Tarjetas de Beneficios Inferiores */}
            <div className="z-10 grid grid-cols-3 gap-4 bg-black/60 p-5 rounded-xl border border-white/10 backdrop-blur-md">
                {/* Item 1 */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="text-cixoil-green w-5 h-5" /> Calidad garantizada
                    </div>
                    <p className="text-xs text-gray-400">Productos certificados para máximo rendimiento</p>
                </div>
                {/* Item 2 */}
                <div className="space-y-1 border-l border-white/10 pl-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Settings className="text-cixoil-green w-5 h-5 animate-spin-slow" /> Gestión eficiente
                    </div>
                    <p className="text-xs text-gray-400">Control total de tu negocio en un solo lugar</p>
                </div>
                {/* Item 3 */}
                <div className="space-y-1 border-l border-white/10 pl-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <BarChart3 className="text-cixoil-green w-5 h-5" /> Información en tiempo real
                    </div>
                    <p className="text-xs text-gray-400">Toma decisiones basadas en datos actualizados</p>
                </div>
            </div>
        </div>
    );
}