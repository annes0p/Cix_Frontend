import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductos } from "../../services/inventarioService";
import InventarioFiltros from "./InventarioFiltros";
import InventarioKPIs from "./InventarioKPIs";
import InventarioTabla from "./InventarioTabla";
import ModalNuevoProducto from "./ModalNuevoProducto";
import ModalVerProducto from "./ModalVerProducto";

const PRODUCTOS_POR_PAGINA = 10;

const productosDemo = [
    {
        id: 1,
        codigo: "ACE-15W40",
        nombre: "Aceite 15W40",
        presentacion: "Galón",
        categoria: "Lubricantes",
        almacen: "Bodega Principal",
        stockActual: 56,
        stockMinimo: 20,
        precio: 45,
        ultimaActualizacion: "16/05/2025 10:23 a.m.",
    },
    {
        id: 2,
        codigo: "FILT-001",
        nombre: "Filtro de Aceite",
        presentacion: "Premium",
        categoria: "Filtros",
        almacen: "Bodega Principal",
        stockActual: 12,
        stockMinimo: 15,
        precio: 18,
        ultimaActualizacion: "16/05/2025 10:18 a.m.",
    },
    {
        id: 3,
        codigo: "GRA-002",
        nombre: "Grasa Multiusos",
        presentacion: "400g",
        categoria: "Grasas",
        almacen: "Bodega Secundaria",
        stockActual: 35,
        stockMinimo: 10,
        precio: 22,
        ultimaActualizacion: "16/05/2025 09:45 a.m.",
    },
    {
        id: 4,
        codigo: "DIS-002",
        nombre: "Disolvente Industrial",
        presentacion: "Galón",
        categoria: "Químicos",
        almacen: "Bodega Principal",
        stockActual: 0,
        stockMinimo: 8,
        precio: 35,
        ultimaActualizacion: "16/05/2025 09:30 a.m.",
    },
    {
        id: 5,
        codigo: "TRF-001",
        nombre: "Transmisión 80W90",
        presentacion: "Galón",
        categoria: "Lubricantes",
        almacen: "Bodega Secundaria",
        stockActual: 8,
        stockMinimo: 12,
        precio: 52,
        ultimaActualizacion: "16/05/2025 09:15 a.m.",
    },
];

export default function Inventarios() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [filtros, setFiltros] = useState({
        busqueda: "",
        categoria: "",
        almacen: "",
        estado: "",
    });

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getProductos();
                setProductos(data);
            } catch {
                setProductos(productosDemo);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const handleFiltroChange = (campo, valor) => {
        setFiltros((prev) => ({ ...prev, [campo]: valor }));
        setPagina(1);
    };

    const productosFiltrados = productos.filter((p) => {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincideBusqueda =
            !busqueda ||
            p.nombre?.toLowerCase().includes(busqueda) ||
            p.name?.toLowerCase().includes(busqueda) ||
            p.codigo?.toLowerCase().includes(busqueda);
        const coincideCategoria =
            !filtros.categoria ||
            p.categoria === filtros.categoria ||
            p.category?.name === filtros.categoria;
        const coincideAlmacen =
            !filtros.almacen || p.almacen === filtros.almacen;
        const coincideEstado =
            !filtros.estado ||
            (filtros.estado === "optimo"
                ? p.stockActual >= p.stockMinimo && p.stockActual > 0
                : filtros.estado === "bajo"
                  ? p.stockActual > 0 && p.stockActual < p.stockMinimo
                  : p.stockActual === 0);
        return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideAlmacen &&
            coincideEstado
        );
    });

    const totalPaginas = Math.ceil(
        productosFiltrados.length / PRODUCTOS_POR_PAGINA,
    );
    const productosPaginados = productosFiltrados.slice(
        (pagina - 1) * PRODUCTOS_POR_PAGINA,
        pagina * PRODUCTOS_POR_PAGINA,
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-gray-700 lg:hidden">
                        ☰
                    </button>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Inventarios
                    </h1>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">
                        Registro y control de inventarios
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 font-medium">
                        CIXOIL S.A.C.
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* Banner */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <SlidersHorizontal
                                size={22}
                                className="text-cixoil-green"
                            />
                        </div>
                        <div>
                            <h2 className="font-bold text-cixoil-red text-lg">
                                Inventario general
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Actualización automática de stock en tiempo
                                    real
                                </span>
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                    En línea
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Download size={16} />
                            Exportar
                        </button>
                        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={16} />
                            Ajustar inventario
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-cixoil-green text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} />
                            Nuevo producto
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                {!loading && <InventarioKPIs productos={productos} />}

                {/* Filtros */}
                <InventarioFiltros
                    filtros={filtros}
                    onFiltroChange={handleFiltroChange}
                />

                {/* Tabla */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-400 text-sm">
                            Cargando inventario...
                        </p>
                    </div>
                ) : (
                    <InventarioTabla
                        productos={productosPaginados}
                        pagina={pagina}
                        totalPaginas={totalPaginas || 1}
                        onPaginaChange={setPagina}
                        onVerProducto={setProductoSeleccionado}
                    />
                )}

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    Sincronización automática activada
                    <span className="mx-1">|</span>
                    Última actualización: {new Date().toLocaleString("es-PE")}
                </div>
            </div>

            {/* Modales */}
            {showModal && (
                <ModalNuevoProducto
                    onClose={() => setShowModal(false)}
                    onProductoCreado={(nuevo) => {
                        setProductos((prev) => [...prev, nuevo]);
                        setShowModal(false);
                    }}
                />
            )}

            {productoSeleccionado && (
                <ModalVerProducto
                    producto={productoSeleccionado}
                    onClose={() => setProductoSeleccionado(null)}
                />
            )}
        </div>
    );
}
