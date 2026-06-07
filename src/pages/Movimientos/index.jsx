import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getSales } from "../../services/movimientosService";
import ModalEditarMovimiento from "./ModalEditarMovimiento";
import ModalNuevoMovimiento from "./ModalNuevoMovimiento";
import MovimientoPanelDetalle from "./MovimientoPanelDetalle";
import MovimientosFiltros from "./MovimientosFiltros";
import MovimientosKPIs from "./MovimientosKPIs";
import MovimientosTabla from "./MovimientosTabla";

const ITEMS_POR_PAGINA = 7;

const mapSaleToMov = (sale, index) => {
    const clienteNombre = sale.client
        ? `${sale.client.name || ""} ${sale.client.fatherLastName || ""} ${sale.client.motherLastName || ""}`.trim()
        : "Cliente desconocido";

    const estadoMap = {
        PENDING: "Pendiente",
        COMPLETED: "Completado",
        CANCELED: "Cancelado",
    };

    const pagoMap = {
        YAPE: "Yape",
        CASH: "Efectivo",
        CARD: "Tarjeta",
        TRANSFER: "Transferencia",
    };

    const comprobanteMap = {
        SALE_NOTE: "Nota de venta",
        INVOICE: "Factura",
        RECEIPT: "Boleta",
    };

    return {
        id: sale.series
            ? `${sale.series}-${sale.number || String(index + 1).padStart(6, "0")}`
            : `VTA-${String(index + 1).padStart(6, "0")}`,
        factura: sale.voucherType
            ? `${comprobanteMap[sale.voucherType] || sale.voucherType}`
            : null,
        tipo: "Venta",
        cliente: clienteNombre,
        nit: sale.client?.docNumber || "-",
        telefono: "-",
        fecha: sale.saleDate || new Date().toISOString(),
        estado:
            estadoMap[sale.transactionStatus] ||
            sale.transactionStatus ||
            "Pendiente",
        total: Number(sale.total) || 0,
        vendedor: sale.user
            ? `${sale.user.name || ""} ${sale.user.lastName || ""}`.trim()
            : "-",
        condicionPago: pagoMap[sale.paymentMethod] || sale.paymentMethod || "-",
        direccionEntrega: "-",
        productos: (sale.details || []).map((d) => ({
            nombre: d.product?.name || "Producto",
            descripcion: "",
            cantidad: d.quantity || 0,
            precio: Number(d.unitPrice) || 0,
            subtotal: Number(d.subtotal) || 0,
        })),
        subtotal: Number(sale.subtotal) || 0,
        iva: Number(sale.taxAmount) || 0,
        _raw: sale,
    };
};

const kpisDemo = {
    ventasMes: 0,
    ventasMesDelta: 0,
    pedidosMes: 0,
    pedidosMesDelta: 0,
    ticketPromedio: 0,
    ticketPromedioDelta: 0,
    clientesAtendidos: 0,
    clientesAtendidosDelta: 0,
};

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState([]);
    const [kpis, setKpis] = useState(kpisDemo);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [seleccionado, setSeleccionado] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [movEditar, setMovEditar] = useState(null);
    const [filtros, setFiltros] = useState({
        busqueda: "",
        tipo: "Todos",
        estado: "Todos",
        fechaDesde: "",
        fechaHasta: "",
    });

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getSales();
                const mapped = Array.isArray(data)
                    ? data.map((s, i) => mapSaleToMov(s, i))
                    : [];
                setMovimientos(mapped);

                const completadas = mapped.filter(
                    (m) => m.estado === "Completado",
                );
                const totalVentas = mapped.reduce((s, m) => s + m.total, 0);
                const ticketProm =
                    mapped.length > 0
                        ? Math.round(totalVentas / mapped.length)
                        : 0;
                const clientesUnicos = new Set(mapped.map((m) => m.cliente))
                    .size;

                setKpis({
                    ventasMes: totalVentas,
                    ventasMesDelta: 0,
                    pedidosMes: mapped.length,
                    pedidosMesDelta: 0,
                    ticketPromedio: ticketProm,
                    ticketPromedioDelta: 0,
                    clientesAtendidos: clientesUnicos,
                    clientesAtendidosDelta: 0,
                });
            } catch (err) {
                console.error("Error cargando ventas:", err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const handleFiltroChange = (campo, valor) => {
        setFiltros((prev) => ({ ...prev, [campo]: valor }));
        setPagina(1);
        setSeleccionado(null);
    };

    const movimientosFiltrados = movimientos.filter((m) => {
        const busq = filtros.busqueda.toLowerCase();
        const coincideBusqueda =
            !busq ||
            m.id.toLowerCase().includes(busq) ||
            m.cliente.toLowerCase().includes(busq) ||
            m.nit.toLowerCase().includes(busq) ||
            (m.factura && m.factura.toLowerCase().includes(busq));
        const coincideTipo =
            filtros.tipo === "Todos" || m.tipo === filtros.tipo;
        const coincideEstado =
            filtros.estado === "Todos" || m.estado === filtros.estado;
        const fecha = new Date(m.fecha);
        const coincideFecha =
            (!filtros.fechaDesde || fecha >= new Date(filtros.fechaDesde)) &&
            (!filtros.fechaHasta ||
                fecha <= new Date(filtros.fechaHasta + "T23:59:59"));
        return (
            coincideBusqueda && coincideTipo && coincideEstado && coincideFecha
        );
    });

    const totalPaginas = Math.ceil(
        movimientosFiltrados.length / ITEMS_POR_PAGINA,
    );
    const movimientosPaginados = movimientosFiltrados.slice(
        (pagina - 1) * ITEMS_POR_PAGINA,
        pagina * ITEMS_POR_PAGINA,
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Ventas y pedidos
                    </h1>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-500">
                        Registro digital de ventas y pedidos de clientes
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        Exportar
                    </button>
                    <button
                        onClick={() => setModalNuevo(true)}
                        className="flex items-center gap-2 bg-cixoil-red text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} />
                        Nuevo pedido / venta
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
                {!loading && kpis && <MovimientosKPIs kpis={kpis} />}

                <div className="flex gap-4 items-start">
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <MovimientosFiltros
                            filtros={filtros}
                            onFiltroChange={handleFiltroChange}
                        />
                        {loading ? (
                            <div className="p-12 text-center text-sm text-gray-400">
                                Cargando movimientos...
                            </div>
                        ) : (
                            <MovimientosTabla
                                movimientos={movimientosPaginados}
                                total={movimientosFiltrados.length}
                                pagina={pagina}
                                totalPaginas={totalPaginas || 1}
                                onPaginaChange={setPagina}
                                seleccionado={seleccionado}
                                onSeleccionar={(mov) =>
                                    setSeleccionado(
                                        seleccionado?.id === mov.id
                                            ? null
                                            : mov,
                                    )
                                }
                                onEditar={(mov) => setMovEditar(mov)}
                                onDuplicar={(mov) => {
                                    const copia = {
                                        ...mov,
                                        id: `VTA-${String(Date.now()).slice(-6)}`,
                                        factura: null,
                                        fecha: new Date().toISOString(),
                                        estado: "Pendiente",
                                    };
                                    setMovimientos((prev) => [copia, ...prev]);
                                }}
                                onCancelar={(mov) => {
                                    setMovimientos((prev) =>
                                        prev.map((m) =>
                                            m.id === mov.id
                                                ? { ...m, estado: "Cancelado" }
                                                : m,
                                        ),
                                    );
                                    if (seleccionado?.id === mov.id)
                                        setSeleccionado((prev) => ({
                                            ...prev,
                                            estado: "Cancelado",
                                        }));
                                }}
                            />
                        )}
                    </div>

                    {seleccionado && (
                        <MovimientoPanelDetalle
                            mov={seleccionado}
                            onCerrar={() => setSeleccionado(null)}
                        />
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    Sincronización automática activada
                    <span className="mx-1">|</span>
                    Última actualización: {new Date().toLocaleString("es-CO")}
                </div>
            </div>

            {modalNuevo && (
                <ModalNuevoMovimiento
                    onClose={() => setModalNuevo(false)}
                    onMovimientoCreado={(nuevo) => {
                        setMovimientos((prev) => [nuevo, ...prev]);
                        setModalNuevo(false);
                    }}
                />
            )}

            {movEditar && (
                <ModalEditarMovimiento
                    mov={movEditar}
                    onClose={() => setMovEditar(null)}
                    onMovimientoActualizado={(actualizado) => {
                        setMovimientos((prev) =>
                            prev.map((m) =>
                                m.id === actualizado.id ? actualizado : m,
                            ),
                        );
                        if (seleccionado?.id === actualizado.id)
                            setSeleccionado(actualizado);
                        setMovEditar(null);
                    }}
                />
            )}
        </div>
    );
}
