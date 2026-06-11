import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import bglogin from "../../assets/bglogin.png";
import logocixoil from "../../assets/logocixoil.jpeg";

export default function LoginLayout() {
    return (
        <div className="hidden lg:flex w-1/2 bg-cixoil-darkBg relative flex-col justify-between p-12 overflow-hidden text-white">
            <img
                src={bglogin}
                alt="Fondo CIXOIL"
                className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 select-none pointer-events-none"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-cixoil-darkBg/80 to-cixoil-red/30 z-0" />

            <div className="z-10 flex flex-col items-start">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-10 shadow-xl border border-white/10">
                    <img
                        src={logocixoil}
                        alt="CIXOIL Logo"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="mb-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-cixoil-green bg-cixoil-green/10 px-3 py-1 rounded-full border border-cixoil-green/20">
                        Sistema de Gestion Empresarial
                    </span>
                </div>

                <h1 className="text-5xl font-black tracking-tight mb-4 leading-tight">
                    Potencia y <br />
                    <span className="text-cixoil-green">proteccion</span> <br />
                    para cada motor
                </h1>

                <p className="text-gray-300 text-base max-w-sm leading-relaxed">
                    Gestiona inventarios, ventas y clientes de forma inteligente
                    con{" "}
                    <span className="text-white font-bold">
                        CIXOIL SmartFlow
                    </span>
                    .
                </p>
            </div>

            <div className="z-10 grid grid-cols-3 gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <ShieldCheck className="text-cixoil-green w-5 h-5 shrink-0" />
                        Calidad garantizada
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Productos certificados para maximo rendimiento
                    </p>
                </div>
                <div className="space-y-2 border-l border-white/10 pl-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <BarChart3 className="text-cixoil-green w-5 h-5 shrink-0" />
                        Datos en tiempo real
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Decisiones basadas en informacion actualizada
                    </p>
                </div>
                <div className="space-y-2 border-l border-white/10 pl-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Sparkles className="text-cixoil-green w-5 h-5 shrink-0" />
                        IA integrada
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Recomendaciones inteligentes para tu negocio
                    </p>
                </div>
            </div>
        </div>
    );
}
