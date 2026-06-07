import {
    ArrowLeftRight,
    BarChart3,
    Bell,
    ChevronDown,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Truck,
    Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logocixoil from "../assets/logocixoil.jpeg";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Inventarios", icon: Package, path: "/inventarios" },
    { label: "Movimientos", icon: ArrowLeftRight, path: "/movimientos" },
    { label: "Clientes", icon: Users, path: "/clientes" },
    { label: "Órdenes de compra", icon: ShoppingCart, path: "/ordenes" },
    { label: "Proveedores", icon: Truck, path: "/proveedores" },
    { label: "Reportes", icon: BarChart3, path: "/reportes" },
    { label: "Alertas", icon: Bell, path: "/alertas" },
    { label: "Configuración", icon: Settings, path: "/configuracion" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen w-56 bg-cixoil-red text-white flex-shrink-0 relative overflow-hidden">
            <div className="flex items-center justify-center py-6 px-4 border-b border-white/10 z-10">
                <img
                    src={logocixoil}
                    alt="CIXOIL"
                    className="w-24 h-24 object-contain rounded-full"
                />
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 z-10 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
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

            <div className="px-3 py-4 border-t border-white/10 z-10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        JC
                    </div>
                    <div className="text-left flex-1">
                        <p className="text-white text-xs font-semibold">Jorge Cerna</p>
                        <p className="text-white/50 text-xs">Administrador</p>
                    </div>
                    <ChevronDown size={14} className="text-white/50" />
                </button>
            </div>
        </div>
    );
}