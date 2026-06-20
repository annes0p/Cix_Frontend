import { ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatFecha(fechaStr) {
    const d = new Date(fechaStr);
    return {
        fecha: d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }),
        hora: d.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
}

function TipoBadge({ tipo }) {
    const esVenta = tipo === "Venta";
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${esVenta ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
            {tipo}
        </span>
    );
}

function EstadoBadge({ estado }) {
    const estilos = {
        Completado: "bg-green-100 text-green-700",
        "En proceso": "bg-orange-100 text-orange-600",
        Pendiente: "bg-blue-100 text-blue-600",
        Cancelado: "bg-gray-100 text-gray-500",
    };
    const dots = {
        Completado: "bg-green-500",
        "En proceso": "bg-orange-500",
        Pendiente: "bg-blue-500",
        Cancelado: "bg-gray-400",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estilos[estado] ?? "bg-gray-100 text-gray-600"}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${dots[estado] ?? "bg-gray-400"}`}
            />
            {estado}
        </span>
    );
}

function MenuContextual({
    mov,
    onCerrar,
    onEditar,
    onDuplicar,
    onCancelar,
    btnRef,
}) {
    const ref = useRef(null);
    const [posicion, setPosicion] = useState({ top: true });

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onCerrar();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onCerrar]);

    useEffect(() => {
        if (btnRef?.current && ref.current) {
            const btnRect = btnRef.current.getBoundingClientRect();
            const menuHeight = 130;
            const spaceBelow = window.innerHeight - btnRect.bottom;
            setPosicion({ top: spaceBelow >= menuHeight });
        }
    }, [btnRef]);

    return (
        <div
            ref={ref}
            className={`absolute right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 ${posicion.top ? "top-8" : "bottom-8"}`}
        >
            <button
                onClick={() => {
                    onEditar(mov);
                    onCerrar();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Editar
            </button>
            <button
                onClick={() => {
                    onDuplicar(mov);
                    onCerrar();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Duplicar
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
                onClick={() => {
                    onCancelar(mov);
                    onCerrar();
                }}
                disabled={mov.estado === "Cancelado"}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Cancelar pedido
            </button>
        </div>
    );
}

function Paginacion({ pagina, totalPaginas, total, onPaginaChange }) {
    const paginasVisibles = () => {
        const pages = [];
        if (totalPaginas <= 5) {
            for (let i = 1; i <= totalPaginas; i++) pages.push(i);
        } else {
            pages.push(1);
            if (pagina > 3) pages.push("...");
            for (
                let i = Math.max(2, pagina - 1);
                i <= Math.min(totalPaginas - 1, pagina + 1);
                i++
            )
                pages.push(i);
            if (pagina < totalPaginas - 2) pages.push("...");
            pages.push(totalPaginas);
        }
        return pages;
    };

    return (
        <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400 text-center sm:text-left">
                Mostrando {Math.min((pagina - 1) * 7 + 1, total)} a{" "}
                {Math.min(pagina * 7, total)} de {total} registros
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPaginaChange(pagina - 1)}
                    disabled={pagina === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                {paginasVisibles().map((p, i) =>
                    p === "..." ? (
                        <span
                            key={`dots-${i}`}
                            className="px-2 py-1 text-xs text-gray-400"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPaginaChange(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${pagina === p ? "bg-cixoil-red text-white" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button
                    onClick={() => onPaginaChange(pagina + 1)}
                    disabled={pagina === totalPaginas}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default function MovimientosTabla({
    movimientos,
    total,
    pagina,
    totalPaginas,
    onPaginaChange,
    seleccionado,
    onSeleccionar,
    onEditar,
    onDuplicar,
    onCancelar,
}) {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const btnRefs = useRef({});

    if (movimientos.length === 0) {
        return (
            <div className="p-12 text-center text-sm text-gray-400">
                No se encontraron registros
            </div>
        );
    }

    return (
        <>
            {/* Vista movil - cards */}
            <div className="block sm:hidden divide-y divide-gray-100">
                {movimientos.map((mov) => {
                    const { fecha, hora } = formatFecha(mov.fecha);
                    const activo = seleccionado?.id === mov.id;
                    return (
                        <div
                            key={mov.id}
                            onClick={() => onSeleccionar(mov)}
                            className={`p-4 cursor-pointer transition-colors ${activo ? "bg-red-50" : "active:bg-gray-50"}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {mov.id}
                                    </p>
                                    {mov.factura && (
                                        <p className="text-xs text-gray-400">
                                            {mov.factura}
                                        </p>
                                    )}
                                    <p className="font-medium text-gray-800 mt-1">
                                        {mov.cliente}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Nit: {mov.nit}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 relative shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSeleccionar(mov);
                                        }}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-cixoil-red hover:bg-red-50 transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        ref={(el) =>
                                            (btnRefs.current[`m-${mov.id}`] =
                                                el)
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuAbierto(
                                                menuAbierto === `m-${mov.id}`
                                                    ? null
                                                    : `m-${mov.id}`,
                                            );
                                        }}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {menuAbierto === `m-${mov.id}` && (
                                        <MenuContextual
                                            mov={mov}
                                            onCerrar={() =>
                                                setMenuAbierto(null)
                                            }
                                            onEditar={onEditar}
                                            onDuplicar={onDuplicar}
                                            onCancelar={onCancelar}
                                            btnRef={{
                                                current:
                                                    btnRefs.current[
                                                        `m-${mov.id}`
                                                    ],
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <TipoBadge tipo={mov.tipo} />
                                    <EstadoBadge estado={mov.estado} />
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">
                                        S/. {mov.total.toLocaleString("es-PE")}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {fecha} {hora}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Vista desktop - tabla */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {[
                                "Nº Pedido / Venta",
                                "Cliente",
                                "Tipo",
                                "Fecha",
                                "Estado",
                                "Total",
                                "Acciones",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((mov) => {
                            const { fecha, hora } = formatFecha(mov.fecha);
                            const activo = seleccionado?.id === mov.id;
                            return (
                                <tr
                                    key={mov.id}
                                    onClick={() => onSeleccionar(mov)}
                                    className={`border-b border-gray-50 cursor-pointer transition-colors ${activo ? "bg-red-50" : "hover:bg-gray-50"}`}
                                >
                                    <td className="px-5 py-3.5">
                                        <p className="font-semibold text-gray-800">
                                            {mov.id}
                                        </p>
                                        {mov.factura && (
                                            <p className="text-xs text-gray-400">
                                                {mov.factura}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="font-medium text-gray-800">
                                            {mov.cliente}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Nit: {mov.nit}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <TipoBadge tipo={mov.tipo} />
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-gray-700">{fecha}</p>
                                        <p className="text-xs text-gray-400">
                                            {hora}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <EstadoBadge estado={mov.estado} />
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                                        S/. {mov.total.toLocaleString("es-PE")}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1 relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSeleccionar(mov);
                                                }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-cixoil-red hover:bg-red-50 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                ref={(el) =>
                                                    (btnRefs.current[mov.id] =
                                                        el)
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuAbierto(
                                                        menuAbierto === mov.id
                                                            ? null
                                                            : mov.id,
                                                    );
                                                }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {menuAbierto === mov.id && (
                                                <MenuContextual
                                                    mov={mov}
                                                    onCerrar={() =>
                                                        setMenuAbierto(null)
                                                    }
                                                    onEditar={onEditar}
                                                    onDuplicar={onDuplicar}
                                                    onCancelar={onCancelar}
                                                    btnRef={{
                                                        current:
                                                            btnRefs.current[
                                                                mov.id
                                                            ],
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                total={total}
                onPaginaChange={onPaginaChange}
            />
        </>
    );
}
