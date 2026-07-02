import {
    AlertCircle,
    ArrowLeftRight,
    BarChart3,
    Bell,
    ChevronDown,
    LayoutDashboard,
    Map,
    Menu,
    Package,
    Settings,
    ShoppingCart,
    Sparkles,
    Truck,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logocixoil from "../assets/logocixoil.jpeg";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Inventarios", icon: Package, path: "/inventarios" },
    { label: "Movimientos", icon: ArrowLeftRight, path: "/movimientos" },
    { label: "Clientes", icon: Users, path: "/clientes" },
    { label: "CRM", icon: UserCheck, path: "/crm" },
    { label: "Ordenes de compra", icon: ShoppingCart, path: "/ordenes" },
    { label: "Proveedores", icon: Truck, path: "/proveedores" },
    { label: "Rutas", icon: Map, path: "/rutas" },
    { label: "Reportes", icon: BarChart3, path: "/reportes" },
    { label: "Alertas", icon: Bell, path: "/alertas" },
    { label: "Recomendador", icon: Sparkles, path: "/recomendador" },
    { label: "Incidencias", icon: AlertCircle, path: "/incidencias" },
    { label: "Configuracion", icon: Settings, path: "/configuracion" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleNavegar = (path) => {
        navigate(path);
        setOpen(false);
    };

    const contenido = (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-center py-6 px-4 border-b border-white/10 relative">
                <img
                    src={logocixoil}
                    alt="CIXOIL"
                    className="w-20 h-20 object-contain rounded-full"
                />
                <button
                    onClick={() => setOpen(false)}
                    className="lg:hidden absolute right-4 text-white/70 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavegar(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                active
                                    ? "bg-white/20 text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        JC
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-white text-xs font-semibold">
                            Jorge Cerna
                        </p>
                        <p className="text-white/50 text-xs">Administrador</p>
                    </div>
                    <ChevronDown size={14} className="text-white/50" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Boton hamburguesa - solo movil */}
            <button
                onClick={() => setOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-cixoil-red text-white p-2 rounded-lg shadow-lg"
            >
                <Menu size={20} />
            </button>

            {/* Overlay - solo movil */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar movil - drawer */}
            <div
                className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-cixoil-red text-white z-50 transform transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {contenido}
            </div>

            {/* Sidebar desktop - fijo */}
            <div className="hidden lg:flex flex-col h-screen w-56 bg-cixoil-red text-white flex-shrink-0">
                {contenido}
            </div>
        </>
    );
}
