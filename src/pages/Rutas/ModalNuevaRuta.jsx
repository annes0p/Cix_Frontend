import { Plus, Trash2, Warehouse, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getVentas } from "../../services/crmService";
import {
    crearRuta,
    crearViaje,
    getLugares,
    getVendedores,
} from "../../services/rutasService";

const hoyISO = () => new Date().toLocaleDateString("sv-SE");

export default function ModalNuevaRuta({ onClose, onGuardar }) {
    const [vendedores, setVendedores] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [idAlmacen, setIdAlmacen] = useState("");
    const [cargandoDatos, setCargandoDatos] = useState(true);

    const [idUser, setIdUser] = useState("");
    const [routeDate, setRouteDate] = useState(hoyISO());
    const [paradas, setParadas] = useState([{ idDestino: "", idSale: "" }]);

    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargandoDatos(true);
                const [vend, lug, vts] = await Promise.all([
                    getVendedores(),
                    getLugares(),
                    getVentas(),
                ]);
                setVendedores(vend);
                setLugares(lug);
                setVentas(vts);

                const almacen = lug.find((l) =>
                    l.label.toLowerCase().includes("almacen"),
                );
                setIdAlmacen(almacen ? almacen.value : "");
            } catch (err) {
                console.error("Error al cargar datos de la ruta:", err);
                setErrorApi(
                    "No se pudieron cargar vendedores, lugares o ventas.",
                );
            } finally {
                setCargandoDatos(false);
            }
        };
        cargar();
    }, []);

    // Todas las paradas parten del almacen, solo se elige a donde va cada una
    const lugaresDestino = lugares.filter((l) => l.value !== idAlmacen);

    const etiquetaVenta = (v) =>
        `VEN-${v.id.toString().padStart(4, "0")} - ${v.client?.name || "Cliente"} - S/. ${v.total || "0.00"}`;

    const agregarParada = () => {
        setParadas((prev) => [...prev, { idDestino: "", idSale: "" }]);
    };

    const quitarParada = (index) => {
        setParadas((prev) => prev.filter((_, i) => i !== index));
    };

    const actualizarParada = (index, campo, valor) => {
        setParadas((prev) =>
            prev.map((p, i) => (i !== index ? p : { ...p, [campo]: valor })),
        );
        setErrores((prev) => ({ ...prev, paradas: null }));
    };

    const validar = () => {
        const nuevosErrores = {};
        if (!idUser) nuevosErrores.idUser = "Selecciona el vendedor.";
        if (!routeDate) nuevosErrores.routeDate = "La fecha es obligatoria.";
        else if (routeDate < hoyISO())
            nuevosErrores.routeDate = "La fecha no puede ser anterior a hoy.";

        if (!idAlmacen)
            nuevosErrores.paradas =
                "No se encontro el lugar de origen (Almacen CIXOIL).";
        else if (!paradas.some((p) => p.idDestino))
            nuevosErrores.paradas = "Agrega al menos una parada.";

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        try {
            setGuardando(true);
            setErrorApi(null);

            const ruta = await crearRuta({
                idUser: Number(idUser),
                routeDate,
            });

            const paradasValidas = paradas.filter((p) => p.idDestino);

            for (const parada of paradasValidas) {
                await crearViaje({
                    idRoute: ruta.id,
                    idOriginLocation: Number(idAlmacen),
                    idDestinationLocation: Number(parada.idDestino),
                    idSale: parada.idSale ? Number(parada.idSale) : null,
                });
            }

            onGuardar?.();
            onClose();
        } catch (err) {
            console.error("Error al crear ruta:", err);
            setErrorApi(
                err?.response?.data?.message ||
                    "No se pudo crear la ruta. Intenta de nuevo.",
            );
        } finally {
            setGuardando(false);
        }
    };

    const inputClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`;

    const nombreAlmacen =
        lugares.find((l) => l.value === idAlmacen)?.label || "Almacen CIXOIL";

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">
                        Nueva ruta
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorApi && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {errorApi}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Vendedor
                            </label>
                            <select
                                className={inputClass("idUser")}
                                value={idUser}
                                disabled={cargandoDatos}
                                onChange={(e) => {
                                    setIdUser(e.target.value);
                                    setErrores((prev) => ({
                                        ...prev,
                                        idUser: null,
                                    }));
                                }}
                            >
                                <option value="">
                                    {cargandoDatos
                                        ? "Cargando..."
                                        : "Selecciona..."}
                                </option>
                                {vendedores.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {vendedores.length === 1
                                            ? "Vendedor"
                                            : v.username}
                                    </option>
                                ))}
                            </select>
                            {errores.idUser && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errores.idUser}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Fecha
                            </label>
                            <input
                                type="date"
                                className={inputClass("routeDate")}
                                value={routeDate}
                                onChange={(e) => {
                                    setRouteDate(e.target.value);
                                    setErrores((prev) => ({
                                        ...prev,
                                        routeDate: null,
                                    }));
                                }}
                            />
                            {errores.routeDate && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errores.routeDate}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                        <Warehouse
                            size={16}
                            className="text-cixoil-red shrink-0"
                        />
                        <p className="text-sm text-gray-600 truncate">
                            Todas las paradas parten de{" "}
                            <span className="font-semibold text-gray-800">
                                {nombreAlmacen}
                            </span>
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-600">
                                Paradas del dia (destinos)
                            </label>
                            <button
                                type="button"
                                onClick={agregarParada}
                                className="flex items-center gap-1 text-xs font-medium text-cixoil-red hover:opacity-75"
                            >
                                <Plus size={13} />
                                Agregar parada
                            </button>
                        </div>

                        <div className="space-y-2">
                            {paradas.map((parada, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 min-w-0"
                                >
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <select
                                            className="w-full min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                            value={parada.idDestino}
                                            disabled={cargandoDatos}
                                            onChange={(e) =>
                                                actualizarParada(
                                                    index,
                                                    "idDestino",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Selecciona destino...
                                            </option>
                                            {lugaresDestino.map((l) => (
                                                <option
                                                    key={l.value}
                                                    value={l.value}
                                                >
                                                    {l.label}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="w-full min-w-0 px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                            value={parada.idSale}
                                            disabled={cargandoDatos}
                                            onChange={(e) =>
                                                actualizarParada(
                                                    index,
                                                    "idSale",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Sin venta asociada (opcional)
                                            </option>
                                            {ventas.map((v) => (
                                                <option
                                                    key={v.id}
                                                    value={v.id}
                                                >
                                                    {etiquetaVenta(v)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {paradas.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quitarParada(index)
                                            }
                                            className="text-gray-400 hover:text-red-500 shrink-0 mt-2"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errores.paradas && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.paradas}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando || cargandoDatos}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-cixoil-red text-white hover:bg-red-900 disabled:opacity-50"
                        >
                            {guardando ? "Guardando..." : "Registrar ruta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
