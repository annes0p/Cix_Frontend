import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getKpisMovimientos,
    getMovimientos,
} from "../../services/movimientosService";
import ModalNuevoMovimiento from "./ModalNuevoMovimiento";
import MovimientoPanelDetalle from "./MovimientoPanelDetalle";
import MovimientosFiltros from "./MovimientosFiltros";
import MovimientosKPIs from "./MovimientosKPIs";
import MovimientosTabla from "./MovimientosTabla";

const ITEMS_POR_PAGINA = 7;

const movimientosDemo = [
    {
        id: "VTA-000125",
        factura: "FAC-000145",
        tipo: "Venta",
        cliente: "Transportes del Norte S.A.S.",
        nit: "900.123.456-1",
        telefono: "310 123 4567",
        fecha: "2025-05-16T10:23:00",
        estado: "Completado",
        total: 6785000,
        vendedor: "Jorge Cerna",
        condicionPago: "Crédito 30 días",
        direccionEntrega: "Carrera 15 # 45-30 Bucaramanga, Santander",
        productos: [
            {
                nombre: "Aceite 15W40",
                descripcion: "Galón",
                cantidad: 20,
                precio: 28500,
                subtotal: 570000,
            },
            {
                nombre: "Grasa Multiusos",
                descripcion: "400g",
                cantidad: 15,
                precio: 18000,
                subtotal: 270000,
            },
            {
                nombre: "Filtro de Aceite",
                descripcion: "Premium",
                cantidad: 10,
                precio: 15000,
                subtotal: 150000,
            },
        ],
        subtotal: 990000,
        iva: 188100,
    },
    {
        id: "PED-000087",
        factura: null,
        tipo: "Pedido",
        cliente: "Constructora Andina S.A.S.",
        nit: "900.987.654-3",
        telefono: "315 234 5678",
        fecha: "2025-05-16T09:45:00",
        estado: "En proceso",
        total: 3250000,
        vendedor: "Jorge Cerna",
        condicionPago: "Contado",
        direccionEntrega: "Calle 80 # 20-15 Medellín, Antioquia",
        productos: [
            {
                nombre: "Aceite Hidráulico",
                descripcion: "20L",
                cantidad: 10,
                precio: 185000,
                subtotal: 1850000,
            },
            {
                nombre: "Grasa EP-2",
                descripcion: "1kg",
                cantidad: 20,
                precio: 22000,
                subtotal: 440000,
            },
        ],
        subtotal: 2290000,
        iva: 435100,
    },
    {
        id: "VTA-000124",
        factura: "FAC-000144",
        tipo: "Venta",
        cliente: "Mantenimiento Industrial S.A.S.",
        nit: "901.234.567-8",
        telefono: "317 345 6789",
        fecha: "2025-05-15T16:30:00",
        estado: "Completado",
        total: 2980000,
        vendedor: "Jorge Cerna",
        condicionPago: "Contado",
        direccionEntrega: "Av. 30 de Agosto # 55-20 Pereira, Risaralda",
        productos: [
            {
                nombre: "Aceite Motor 5W30",
                descripcion: "4L",
                cantidad: 30,
                precio: 68000,
                subtotal: 2040000,
            },
        ],
        subtotal: 2040000,
        iva: 387600,
    },
    {
        id: "PED-000086",
        factura: null,
        tipo: "Pedido",
        cliente: "Inversiones Petroleras S.A.S.",
        nit: "900.321.654-7",
        telefono: "313 456 7890",
        fecha: "2025-05-15T11:15:00",
        estado: "Pendiente",
        total: 8450000,
        vendedor: "Jorge Cerna",
        condicionPago: "Crédito 60 días",
        direccionEntrega: "Zona Industrial, Cartagena, Bolívar",
        productos: [
            {
                nombre: "Aceite Industrial",
                descripcion: "Tambor 55gal",
                cantidad: 5,
                precio: 1200000,
                subtotal: 6000000,
            },
            {
                nombre: "Lubricante Especial",
                descripcion: "20L",
                cantidad: 8,
                precio: 187500,
                subtotal: 1500000,
            },
        ],
        subtotal: 7500000,
        iva: 1425000,
    },
    {
        id: "VTA-000123",
        factura: "FAC-000143",
        tipo: "Venta",
        cliente: "Agroservicios del Valle S.A.S.",
        nit: "900.654.321-9",
        telefono: "318 567 8901",
        fecha: "2025-05-14T15:22:00",
        estado: "Completado",
        total: 1560000,
        vendedor: "Jorge Cerna",
        condicionPago: "Contado",
        direccionEntrega: "Vereda El Jardín, Palmira, Valle del Cauca",
        productos: [
            {
                nombre: "Aceite Agrícola",
                descripcion: "4L",
                cantidad: 15,
                precio: 72000,
                subtotal: 1080000,
            },
        ],
        subtotal: 1080000,
        iva: 205200,
    },
    {
        id: "PED-000085",
        factura: null,
        tipo: "Pedido",
        cliente: "Servicios Generales del Sur S.A.S.",
        nit: "901.111.222-0",
        telefono: "316 678 9012",
        fecha: "2025-05-14T09:08:00",
        estado: "Cancelado",
        total: 4120000,
        vendedor: "Jorge Cerna",
        condicionPago: "Crédito 30 días",
        direccionEntrega: "Calle 5 # 10-25 Pasto, Nariño",
        productos: [
            {
                nombre: "Aceite Transmisión",
                descripcion: "Cubeta 19L",
                cantidad: 8,
                precio: 380000,
                subtotal: 3040000,
            },
        ],
        subtotal: 3040000,
        iva: 577600,
    },
    {
        id: "VTA-000122",
        factura: "FAC-000142",
        tipo: "Venta",
        cliente: "Comercializadora Omega S.A.S.",
        nit: "900.789.456-2",
        telefono: "312 789 0123",
        fecha: "2025-05-13T14:14:00",
        estado: "Completado",
        total: 5230000,
        vendedor: "Jorge Cerna",
        condicionPago: "Crédito 30 días",
        direccionEntrega: "Cra 7 # 32-15 Bogotá, Cundinamarca",
        productos: [
            {
                nombre: "Aceite 15W40",
                descripcion: "Galón",
                cantidad: 50,
                precio: 71400,
                subtotal: 3570000,
            },
            {
                nombre: "Filtro de Aire",
                descripcion: "Universal",
                cantidad: 20,
                precio: 45000,
                subtotal: 900000,
            },
        ],
        subtotal: 4470000,
        iva: 849300,
    },
];

const kpisDemo = {
    ventasMes: 245680000,
    ventasMesDelta: 18.6,
    pedidosMes: 56,
    pedidosMesDelta: 12.5,
    ticketPromedio: 4387143,
    ticketPromedioDelta: 7.2,
    clientesAtendidos: 24,
    clientesAtendidosDelta: 14.3,
};

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagina, setPagina] = useState(1);
    const [seleccionado, setSeleccionado] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
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
                const [dataMovimientos, dataKpis] = await Promise.all([
                    getMovimientos(),
                    getKpisMovimientos(),
                ]);
                setMovimientos(dataMovimientos);
                setKpis(dataKpis);
            } catch {
                setMovimientos(movimientosDemo);
                setKpis(kpisDemo);
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
            {/* Header */}
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
                {/* KPIs */}
                {!loading && kpis && <MovimientosKPIs kpis={kpis} />}

                {/* Filtros + Tabla + Panel */}
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

                {/* Footer */}
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
        </div>
    );
}
