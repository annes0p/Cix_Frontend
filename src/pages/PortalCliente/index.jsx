import {
    AlertTriangle,
    Compass,
    ShoppingCart,
    Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OPCIONES = [
    {
        titulo: "Encuentra tu aceite ideal",
        descripcion: "Cuéntanos de tu vehículo y te recomendamos el mejor producto.",
        icono: Compass,
        ruta: "/recomendador-publico",
    },
    {
        titulo: "Comprar",
        descripcion: "Mira nuestro catálogo y arma tu pedido.",
        icono: ShoppingCart,
        ruta: "/tienda",
    },
    {
        titulo: "Mis pedidos",
        descripcion: "Sigue en vivo el estado y la ubicación de tu entrega.",
        icono: Truck,
        ruta: "/portal-cliente/pedidos",
    },
    {
        titulo: "Mis incidencias",
        descripcion: "Revisa, califica o reporta un problema con tu pedido.",
        icono: AlertTriangle,
        ruta: "/portal-cliente/incidencias",
    },
];

export default function PortalCliente() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-cixoil-red">
                        CIXOIL S.A.C.
                    </h1>
                    <p className="text-sm text-gray-500">
                        ¿Qué necesitas hacer hoy?
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {OPCIONES.map((op) => {
                        const Icono = op.icono;
                        return (
                            <button
                                key={op.ruta}
                                type="button"
                                onClick={() => navigate(op.ruta)}
                                className="text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-2 hover:border-cixoil-red/40 hover:shadow-md transition"
                            >
                                <div className="w-11 h-11 rounded-xl bg-red-50 text-cixoil-red flex items-center justify-center">
                                    <Icono size={22} />
                                </div>
                                <p className="font-bold text-gray-900">
                                    {op.titulo}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {op.descripcion}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    CIXOIL S.A.C. - Lubricantes y derivados
                </p>
            </div>
        </div>
    );
}
