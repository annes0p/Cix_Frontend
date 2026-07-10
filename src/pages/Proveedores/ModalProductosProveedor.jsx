import { Loader, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProductos } from "../../services/ordenesService";
import {
    actualizarProductosDeProveedor,
    getProductosDeProveedor,
} from "../../services/proveedoresService";

export default function ModalProductosProveedor({ proveedor, onClose, onGuardado }) {
    const [productos, setProductos] = useState([]);
    const [seleccionados, setSeleccionados] = useState(new Set());
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                setError(null);
                const [todos, delProveedor] = await Promise.all([
                    getProductos(),
                    getProductosDeProveedor(proveedor.id),
                ]);
                setProductos(Array.isArray(todos) ? todos : []);
                setSeleccionados(
                    new Set((delProveedor || []).map((p) => p.id)),
                );
            } catch (err) {
                console.error("Error al cargar productos:", err);
                setError("No se pudieron cargar los productos.");
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [proveedor.id]);

    const productosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return productos;
        return productos.filter((p) =>
            p.name?.toLowerCase().includes(texto),
        );
    }, [productos, busqueda]);

    const alternar = (idProducto) => {
        setSeleccionados((prev) => {
            const copia = new Set(prev);
            if (copia.has(idProducto)) copia.delete(idProducto);
            else copia.add(idProducto);
            return copia;
        });
    };

    const guardar = async () => {
        try {
            setGuardando(true);
            setError(null);
            await actualizarProductosDeProveedor(
                proveedor.id,
                Array.from(seleccionados),
            );
            onGuardado?.();
            onClose();
        } catch (err) {
            console.error("Error al guardar productos del proveedor:", err);
            setError(
                err?.response?.data?.message ||
                    "No se pudieron guardar los productos.",
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Productos de {proveedor.legalName}
                        </h2>
                        <p className="text-xs text-gray-500">
                            Marca los productos que este proveedor abastece
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-3">
                            {error}
                        </div>
                    )}
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                        />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cixoil-red transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {cargando ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            Cargando productos...
                        </p>
                    ) : productosFiltrados.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            No se encontraron productos.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {productosFiltrados.map((p) => (
                                <label
                                    key={p.id}
                                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.has(p.id)}
                                        onChange={() => alternar(p.id)}
                                        className="w-4 h-4 accent-cixoil-red"
                                    />
                                    <span className="text-sm text-gray-800">
                                        {p.name}
                                    </span>
                                    {p.brand?.name && (
                                        <span className="text-xs text-gray-400">
                                            {p.brand.name}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                        {seleccionados.size} producto(s) seleccionado(s)
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={guardar}
                            disabled={guardando || cargando}
                            className="px-5 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {guardando && (
                                <Loader size={14} className="animate-spin" />
                            )}
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
