import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import {
    eliminarProducto,
    getInventario,
    getProductos,
} from "../../services/inventarioService";
import { getMovimientos } from "../../services/alertasService";
import { getOrdenes } from "../../services/ordenesService";
import InventarioFiltros from "./InventarioFiltros";
import InventarioKPIs from "./InventarioKPIs";
import InventarioTabla from "./InventarioTabla";
import ModalEditarProducto from "./ModalEditarProducto";
import ModalEliminarProducto from "./ModalEliminarProducto";
import ModalNuevoProducto from "./ModalNuevoProducto";
import ModalVerProducto from "./ModalVerProducto";

const PRODUCTOS_POR_PAGINA = 10;

// Toma el precio unitario de la ultima compra RECIBIDA de cada producto,
// para poder mostrar el valor del inventario a costo real (no a precio
// de venta). Si un producto nunca tuvo una compra recibida, se queda
// sin costo conocido y no entra en el calculo.
const construirCostoPorProducto = (ordenes) => {
    const costoPorProducto = {};
    const fechaPorProducto = {};

    (ordenes || []).forEach((orden) => {
        const fecha = orden.deliveredAt || orden.purchasedAt;
        if (!fecha) return;

        (orden.details || []).forEach((detalle) => {
            const recibido = detalle.receivedQuantity || 0;
            const idProducto = detalle.product?.id;
            if (recibido <= 0 || !idProducto) return;

            const fechaGuardada = fechaPorProducto[idProducto];
            if (!fechaGuardada || fecha >= fechaGuardada) {
                fechaPorProducto[idProducto] = fecha;
                costoPorProducto[idProducto] = Number(detalle.unitPrice) || 0;
            }
        });
    });

    return costoPorProducto;
};

const productosDemo = [
    {
        id: 1,
        codigo: "ACE-15W40",
        nombre: "Aceite 15W40",
        categoria: "Lubricantes",
        almacen: "Bodega Principal",
        stockActual: 56,
        stockMinimo: 20,
        precio: 45,
        ultimaActualizacion: "16/05/2025",
    },
];

export default function Inventarios() {
    const [productos, setProductos] = useState([]);
    const [movimientosHoy, setMovimientosHoy] = useState(0);
    const [costoPorProducto, setCostoPorProducto] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [productoEditar, setProductoEditar] = useState(null);
    const [productoEliminar, setProductoEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [filtros, setFiltros] = useState({
        busqueda: "",
        categoria: "",
        almacen: "",
        estado: "",
    });

    useEffect(() => {
        const cargar = async () => {
            try {
                const [
                    productosData,
                    inventarioData,
                    movimientosData,
                    ordenesData,
                ] = await Promise.all([
                    getProductos(),
                    getInventario(),
                    getMovimientos(),
                    getOrdenes(),
                ]);

                const hoyISO = new Date().toLocaleDateString("sv-SE");
                const contadorHoy = (movimientosData || []).filter((m) =>
                    m.movementDate?.startsWith(hoyISO),
                ).length;
                setMovimientosHoy(contadorHoy);
                setCostoPorProducto(construirCostoPorProducto(ordenesData));

                const productosMapeados = inventarioData.map((inv) => {
                    const producto = productosData.find(
                        (p) => p.id === inv.product?.id,
                    );
                    return {
                        id: inv.id,
                        idProducto: inv.product?.id,
                        codigo: `PRD-${String(inv.product?.id).padStart(4, "0")}`,
                        nombre: inv.product?.name || "-",
                        name: inv.product?.name || "-",
                        categoria: producto?.category?.name || "-",
                        almacen: "Bodega Principal",
                        stockActual: inv.stock,
                        stock: inv.stock,
                        stockMinimo: inv.minStock,
                        minStock: inv.minStock,
                        precio: producto?.price || 0,
                        price: producto?.price || 0,
                        marca: producto?.brand?.name || "-",
                        descripcion: producto?.description || "-",
                        imageUrl:
                            inv.product?.imageUrl || producto?.imageUrl || null,
                        ultimaActualizacion: new Date().toLocaleDateString(
                            "es-PE",
                        ),
                        _raw: inv,
                    };
                });

                setProductos(productosMapeados);
            } catch (error) {
                console.error("Error cargando inventario:", error);
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

    const exportarExcel = () => {
        const encabezados = [
            "Código",
            "Producto",
            "Categoría",
            "Marca",
            "Almacén",
            "Stock Actual",
            "Stock Mínimo",
            "Estado",
            "Precio (S/.)",
            "Última Actualización",
        ];

        const filas = productosFiltrados.map((p) => [
            p.codigo,
            p.name || p.nombre,
            p.categoria,
            p.marca,
            p.almacen,
            p.stockActual,
            p.stockMinimo,
            p.stockActual === 0
                ? "Sin stock"
                : p.stockActual < p.stockMinimo
                  ? "Stock bajo"
                  : "Óptimo",
            p.precio || p.price,
            p.ultimaActualizacion,
        ]);

        const csv = [encabezados, ...filas]
            .map((fila) => fila.map((v) => `"${v}"`).join(","))
            .join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `CIXOIL_Inventario_${new Date().toLocaleDateString("sv-SE")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleConfirmarEliminar = async (id) => {
        try {
            setEliminando(true);
            await eliminarProducto(id);
            setProductos((prev) => prev.filter((p) => p.idProducto !== id));
            setProductoEliminar(null);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        } finally {
            setEliminando(false);
        }
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
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Inventarios
                    </h1>
                    <span className="text-gray-400 hidden sm:block">|</span>
                    <span className="text-sm text-gray-500 hidden sm:block">
                        Registro y control de inventarios
                    </span>
                </div>
                <span className="text-sm text-gray-600 font-medium hidden sm:block">
                    CIXOIL S.A.C.
                </span>
            </div>

            <div className="p-4 sm:p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
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
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    Actualizacion automatica de stock en tiempo
                                    real
                                </span>
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                    En linea
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={exportarExcel}
                            className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Download size={16} />
                            <span className="hidden sm:block">Exportar</span>
                        </button>
                        <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={16} />
                            <span className="hidden sm:block">
                                Ajustar inventario
                            </span>
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-cixoil-green text-white rounded-lg px-3 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:block">
                                Nuevo producto
                            </span>
                        </button>
                    </div>
                </div>

                {!loading && (
                    <InventarioKPIs
                        productos={productos}
                        movimientosHoy={movimientosHoy}
                        costoPorProducto={costoPorProducto}
                    />
                )}

                <InventarioFiltros
                    filtros={filtros}
                    onFiltroChange={handleFiltroChange}
                />

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
                        onEditarProducto={setProductoEditar}
                        onEliminarProducto={setProductoEliminar}
                    />
                )}

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    Sincronizacion automatica activada
                    <span className="mx-1">|</span>
                    Ultima actualizacion: {new Date().toLocaleString("es-PE")}
                </div>
            </div>

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

            {productoEditar && (
                <ModalEditarProducto
                    producto={productoEditar}
                    onClose={() => setProductoEditar(null)}
                    onProductoActualizado={(actualizado) => {
                        setProductos((prev) =>
                            prev.map((p) =>
                                p.id === actualizado.id ? actualizado : p,
                            ),
                        );
                        setProductoEditar(null);
                    }}
                />
            )}

            {productoEliminar && (
                <ModalEliminarProducto
                    producto={productoEliminar}
                    onConfirmar={handleConfirmarEliminar}
                    onCancelar={() => setProductoEliminar(null)}
                    loading={eliminando}
                />
            )}
        </div>
    );
}
