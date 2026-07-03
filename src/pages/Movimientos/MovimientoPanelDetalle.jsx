import {
    Calendar,
    CreditCard,
    Eye,
    MapPin,
    Phone,
    Printer,
    User,
    X,
} from "lucide-react";
import { generarFacturaPDF } from "../../utils/generarFacturaPDF";

function formatFecha(fechaStr) {
    const d = new Date(fechaStr);
    return (
        d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
    );
}

function EstadoBadge({ estado }) {
    const estilos = {
        Completado: "bg-green-100 text-green-700",
        "En proceso": "bg-orange-100 text-orange-600",
        Pendiente: "bg-blue-100 text-blue-600",
        Cancelado: "bg-gray-100 text-gray-500",
    };
    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${estilos[estado] ?? "bg-gray-100 text-gray-600"}`}
        >
            {estado}
        </span>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex gap-2">
            <Icon size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-800 leading-tight">{value}</p>
            </div>
        </div>
    );
}

export default function MovimientoPanelDetalle({ mov, onCerrar }) {
    if (!mov) return null;

    const fmt = (val) => "S/. " + Number(val).toFixed(2);

    const handleVerFactura = () => {
        generarFacturaPDF(mov);
    };

    const handleImprimir = () => {
        generarFacturaPDF(mov);
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                            {mov.id}
                        </span>
                        <EstadoBadge estado={mov.estado} />
                    </div>
                    {mov.factura && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            Factura: {mov.factura}
                        </p>
                    )}
                    <span
                        className={`inline-block mt-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${mov.tipo === "Venta" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                        {mov.tipo}
                    </span>
                </div>
                <button
                    onClick={onCerrar}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
                <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Informacion del cliente
                    </h3>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <User
                                size={15}
                                className="text-gray-400 flex-shrink-0 mt-0.5"
                            />
                            <div>
                                <p className="font-medium text-gray-900 leading-tight">
                                    {mov.cliente}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Doc: {mov.nit}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone
                                size={15}
                                className="text-gray-400 flex-shrink-0"
                            />
                            <span>{mov.telefono}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Informacion del pedido
                    </h3>
                    <div className="space-y-2">
                        <InfoRow
                            icon={Calendar}
                            label="Fecha"
                            value={formatFecha(mov.fecha)}
                        />
                        <InfoRow
                            icon={User}
                            label="Vendedor"
                            value={mov.vendedor}
                        />
                        <InfoRow
                            icon={CreditCard}
                            label="Condicion de pago"
                            value={mov.condicionPago}
                        />
                        <InfoRow
                            icon={MapPin}
                            label="Direccion de entrega"
                            value={mov.direccionEntrega}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Detalle de productos ({mov.productos.length})
                    </h3>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                            <span className="col-span-2">Producto</span>
                            <span className="text-right">Cant.</span>
                            <span className="text-right">Subtotal</span>
                        </div>
                        {mov.productos.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-400">
                                Sin detalle de productos
                            </div>
                        ) : (
                            mov.productos.map((p, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-4 gap-1 px-3 py-2 border-t border-gray-100 text-xs"
                                >
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-800 leading-tight">
                                            {p.nombre}
                                        </p>
                                    </div>
                                    <span className="text-right text-gray-600 self-center">
                                        {p.cantidad}
                                    </span>
                                    <span className="text-right font-medium text-gray-800 self-center">
                                        S/. {Number(p.subtotal).toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="border-t border-gray-100 pt-4 space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{fmt(mov.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>IGV (18%)</span>
                        <span>{fmt(mov.iva)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-cixoil-red pt-1 border-t border-gray-100">
                        <span>Total</span>
                        <span>{fmt(mov.total)}</span>
                    </div>
                </section>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <button
                    onClick={handleImprimir}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Printer size={15} />
                    Imprimir
                </button>
                <button
                    onClick={handleVerFactura}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cixoil-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Eye size={15} />
                    Ver factura
                </button>
            </div>
        </div>
    );
}
