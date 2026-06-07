import { Users, Plus, Search, Phone, Mail, MapPin, ToggleLeft, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getClientes, eliminarCliente, toggleCliente } from "../../services/clienteService";
import ModalNuevoCliente from "./ModalNuevoCliente";
import ModalEditarCliente from "./ModalEditarCliente";

function EstadoBadge({ status }) {
    const activo = status === 1;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activo ? "bg-green-500" : "bg-gray-400"}`} />
            {activo ? "Activo" : "Inactivo"}
        </span>
    );
}

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [modalNuevo, setModalNuevo] = useState(false);
    const [clienteEditar, setClienteEditar] = useState(null);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const data = await getClientes();
            setClientes(Array.isArray(data) ? data : []);
        } catch {
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const actualizado = await toggleCliente(id);
            setClientes((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: actualizado.status } : c))
            );
        } catch {
            console.error("Error al cambiar estado");
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("Esta accion eliminara al cliente. Continuar?")) return;
        try {
            await eliminarCliente(id);
            setClientes((prev) => prev.filter((c) => c.id !== id));
        } catch {
            console.error("Error al eliminar");
        }
    };

    const clientesFiltrados = clientes.filter((c) => {
        const busq = busqueda.toLowerCase();
        return (
            !busq ||
            `${c.name} ${c.fatherLastName || ""} ${c.motherLastName || ""}`.toLowerCase().includes(busq) ||
            c.docNumber?.toLowerCase().includes(busq) ||
            c.email?.toLowerCase().includes(busq) ||
            c.phoneNumber?.toLowerCase().includes(busq)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-cixoil-red">Clientes</h1>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">Registro y gestion de clientes</span>
                </div>
                <button
                    onClick={() => setModalNuevo(true)}
                    className="flex items-center gap-2 bg-cixoil-red text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} />
                    Nuevo cliente
                </button>
            </div>

            <div className="p-6 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre, documento, email..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-400"
                            />
                        </div>
                        <span className="text-xs text-gray-400">{clientesFiltrados.length} clientes</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-400">Cargando clientes...</div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className="p-12 text-center text-sm text-gray-400">
                            <Users size={32} className="mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron clientes</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {["Cliente", "Documento", "Contacto", "Direccion", "Estado", "Acciones"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.map((c) => (
                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-gray-800">
                                                {`${c.name} ${c.fatherLastName || ""} ${c.motherLastName || ""}`.trim()}
                                            </p>
                                            {c.trusted && (
                                                <span className="text-xs text-cixoil-green font-medium">Cliente de confianza</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-gray-700 font-medium">{c.docNumber || "-"}</p>
                                            <p className="text-xs text-gray-400">{c.documentType || "-"}</p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="space-y-0.5">
                                                {c.phoneNumber && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Phone size={11} className="text-gray-400" />
                                                        {c.phoneNumber}
                                                    </div>
                                                )}
                                                {c.email && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                        <Mail size={11} className="text-gray-400" />
                                                        {c.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <MapPin size={11} className="text-gray-400" />
                                                <span className="truncate max-w-32">{c.address || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <EstadoBadge status={c.status} />
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setClienteEditar(c)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-cixoil-red hover:bg-red-50 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(c.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title={c.status === 1 ? "Desactivar" : "Activar"}
                                                >
                                                    <ToggleLeft size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(c.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {modalNuevo && (
                <ModalNuevoCliente
                    onClose={() => setModalNuevo(false)}
                    onClienteCreado={(nuevo) => {
                        setClientes((prev) => [nuevo, ...prev]);
                        setModalNuevo(false);
                    }}
                />
            )}

            {clienteEditar && (
                <ModalEditarCliente
                    cliente={clienteEditar}
                    onClose={() => setClienteEditar(null)}
                    onClienteActualizado={(actualizado) => {
                        setClientes((prev) =>
                            prev.map((c) => (c.id === actualizado.id ? actualizado : c))
                        );
                        setClienteEditar(null);
                    }}
                />
            )}
        </div>
    );
}
