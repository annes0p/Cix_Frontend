import {
    Calendar,
    Loader2,
    MapPin,
    MessageCircle,
    Sparkles,
    User,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    cancelarViaje,
    completarViaje,
    getRutaById,
    iniciarViaje,
} from "../../services/rutasService";
import { generarResumenRutaPDF } from "../../utils/generarReportePDF";
import { getLinkSeguimiento } from "../../services/trackingService";

const ESTILOS_ESTADO = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELED: "bg-gray-200 text-gray-500",
};

const ETIQUETAS_ESTADO = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En curso",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
};

const formatFechaHora = (routeDate, hora) => {
    if (!routeDate || !hora) return null;
    const fecha = new Date(`${routeDate}T${hora}`);
    if (isNaN(fecha.getTime())) return hora;
    return fecha.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

function EstadoBadge({ estado }) {
    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${ESTILOS_ESTADO[estado] || "bg-gray-100 text-gray-700"}`}
        >
            {ETIQUETAS_ESTADO[estado] || estado}
        </span>
    );
}

export default function ModalDetalleRuta({ rutaId, onClose, onActualizar }) {
    const [ruta, setRuta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null);
    const [error, setError] = useState(null);

    const [resumenIA, setResumenIA] = useState(null);
    const [generandoResumen, setGenerandoResumen] = useState(false);
    const [errorResumen, setErrorResumen] = useState(null);
    const [telefono, setTelefono] = useState("");
    const [errorTelefono, setErrorTelefono] = useState(null);

    const [trackingTripId, setTrackingTripId] = useState(null);
    const [trackingLink, setTrackingLink] = useState(null);
    const [trackingTelefono, setTrackingTelefono] = useState("");
    const [trackingCargando, setTrackingCargando] = useState(false);
    const [trackingError, setTrackingError] = useState(null);

    const cargarRuta = async () => {
        try {
            setCargando(true);
            const data = await getRutaById(rutaId);
            setRuta(data);
        } catch (err) {
            console.error("Error al cargar ruta:", err);
            setError("No se pudo cargar el detalle de la ruta.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarRuta();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rutaId]);

    const ejecutarAccion = async (accion, idTrip) => {
        try {
            setError(null);
            setProcesandoId(idTrip);
            if (accion === "iniciar") await iniciarViaje(idTrip);
            if (accion === "completar") await completarViaje(idTrip);
            if (accion === "cancelar") await cancelarViaje(idTrip);
            await cargarRuta();
            onActualizar?.();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "No se pudo actualizar el viaje.",
            );
        } finally {
            setProcesandoId(null);
        }
    };

    const generarResumenIA = async () => {
        if (!ruta) return;
        try {
            setGenerandoResumen(true);
            setErrorResumen(null);

            const listaParadas = (ruta.trips || [])
                .map((t) => {
                    const venta = t.sale
                        ? ` (venta VEN-${t.sale.id.toString().padStart(4, "0")} a ${t.sale.client?.name || "cliente"}, S/. ${t.sale.total})`
                        : "";
                    return `- ${t.destination?.name}: ${ETIQUETAS_ESTADO[t.progressStatus] || t.progressStatus}${venta}`;
                })
                .join("\n");

            const prompt = `Eres un asistente de logistica de CIXOIL S.A.C., distribuidora de lubricantes en Chiclayo, Peru.
Redacta un resumen breve en español (maximo 6 lineas, sin markdown) de la siguiente ruta de reparto, en tono profesional y directo, para enviarlo por WhatsApp al encargado.

Fecha de la ruta: ${ruta.routeDate}
Estado general: ${ETIQUETAS_ESTADO[ruta.progressStatus] || ruta.progressStatus}
Paradas:
${listaParadas || "Sin paradas registradas"}

Responde solo con el texto del resumen, nada mas.`;

            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.3,
                        max_tokens: 300,
                    }),
                },
            );

            const data = await response.json();
            const texto = data.choices?.[0]?.message?.content?.trim();
            if (!texto) throw new Error("Sin respuesta");
            setResumenIA(texto);
        } catch (err) {
            console.error("Error al generar resumen:", err);
            setErrorResumen("No se pudo generar el resumen con IA.");
        } finally {
            setGenerandoResumen(false);
        }
    };

    // En vez de usar window.prompt + window.open (Brave y otros navegadores
    // bloquean la pestaña porque se abre despues de esperar al backend),
    // se genera el link primero y se muestra un boton <a> real para que
    // el usuario mismo haga clic y abra WhatsApp. Un clic directo del
    // usuario en un link nunca se bloquea.
    const abrirSeguimiento = async (trip) => {
        setTrackingTripId(trip.id);
        setTrackingLink(null);
        setTrackingTelefono("");
        setTrackingError(null);
        setTrackingCargando(true);
        try {
            const token = await getLinkSeguimiento(trip.id);
            setTrackingLink(`${window.location.origin}/seguimiento/${token}`);
        } catch (err) {
            console.error("Error al generar el link de seguimiento:", err);
            setTrackingError("No se pudo generar el link de seguimiento.");
        } finally {
            setTrackingCargando(false);
        }
    };

    const numeroTrackingValido = /^\d{9}$/.test(
        trackingTelefono.replace(/\D/g, ""),
    );

    const linkWhatsAppSeguimiento = numeroTrackingValido
        ? `https://wa.me/51${trackingTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Hola! Puedes seguir el estado de tu pedido de CIXOIL S.A.C. aqui: ${trackingLink}`,
          )}`
        : null;

    const enviarResumenWhatsApp = () => {
        const numero = telefono.replace(/\D/g, "");
        if (numero.length !== 9) {
            setErrorTelefono(
                "Ingresa un numero de celular valido (9 digitos).",
            );
            return;
        }
        setErrorTelefono(null);

        generarResumenRutaPDF(ruta, resumenIA);

        const texto = encodeURIComponent(
            "Hola! Te comparto el resumen de la ruta de reparto de hoy. Adjunto el PDF con el detalle. - CIXOIL S.A.C.",
        );
        window.open(`https://wa.me/51${numero}?text=${texto}`, "_blank");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="font-bold text-lg">
                            Ruta #{rutaId?.toString().padStart(4, "0")}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Detalle de reparto del dia
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X />
                    </button>
                </div>

                {cargando && (
                    <p className="text-sm text-gray-400 text-center py-10">
                        Cargando...
                    </p>
                )}

                {!cargando && ruta && (
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <User
                                    size={18}
                                    className="text-cixoil-red shrink-0"
                                />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Vendedor
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {ruta.user ? "Vendedor" : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                <Calendar
                                    size={18}
                                    className="text-gray-400 shrink-0"
                                />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Fecha
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {ruta.routeDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-800">
                                Estado general
                            </p>
                            <EstadoBadge estado={ruta.progressStatus} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin size={16} className="text-cixoil-red" />
                                <p className="text-sm font-bold text-gray-800">
                                    Paradas
                                </p>
                            </div>

                            {!ruta.trips || ruta.trips.length === 0 ? (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-400">
                                        Esta ruta no tiene paradas registradas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {ruta.trips.map((trip) => (
                                        <div
                                            key={trip.id}
                                            className="bg-gray-50 rounded-xl px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {trip.origin?.name} →{" "}
                                                    {trip.destination?.name}
                                                </p>
                                                <EstadoBadge
                                                    estado={
                                                        trip.progressStatus
                                                    }
                                                />
                                            </div>
                                            {trip.sale && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-cixoil-red font-medium">
                                                        Entrega venta VEN-
                                                        {trip.sale.id
                                                            .toString()
                                                            .padStart(4, "0")}{" "}
                                                        ·{" "}
                                                        {trip.sale.client?.name}{" "}
                                                        · S/. {trip.sale.total}
                                                    </p>

                                                    {trackingTripId !==
                                                        trip.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                abrirSeguimiento(
                                                                    trip,
                                                                )
                                                            }
                                                            className="text-xs font-medium text-green-600 hover:opacity-75 mt-0.5"
                                                        >
                                                            Enviar seguimiento
                                                        </button>
                                                    )}

                                                    {trackingTripId ===
                                                        trip.id && (
                                                        <div className="mt-1.5 bg-white border border-gray-200 rounded-lg p-2 space-y-1.5">
                                                            {trackingCargando && (
                                                                <p className="text-xs text-gray-400">
                                                                    Generando
                                                                    link...
                                                                </p>
                                                            )}
                                                            {trackingError && (
                                                                <p className="text-xs text-red-500">
                                                                    {
                                                                        trackingError
                                                                    }
                                                                </p>
                                                            )}
                                                            {trackingLink && (
                                                                <>
                                                                    <div className="flex gap-1.5">
                                                                        <input
                                                                            type="tel"
                                                                            placeholder="Celular (9 digitos)"
                                                                            value={
                                                                                trackingTelefono
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setTrackingTelefono(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                                                        />
                                                                        <a
                                                                            href={
                                                                                linkWhatsAppSeguimiento ||
                                                                                undefined
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    !numeroTrackingValido
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                }
                                                                            }}
                                                                            className={`flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition ${
                                                                                numeroTrackingValido
                                                                                    ? "bg-green-600 text-white hover:bg-green-700"
                                                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                            }`}
                                                                        >
                                                                            Abrir
                                                                            WhatsApp
                                                                        </a>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-400">
                                                                        Escribe
                                                                        el
                                                                        celular
                                                                        y haz
                                                                        clic
                                                                        en
                                                                        "Abrir
                                                                        WhatsApp".
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-400">
                                                    {trip.startTime
                                                        ? `Inicio: ${formatFechaHora(ruta.routeDate, trip.startTime)}`
                                                        : "Sin iniciar"}
                                                    {trip.endTime
                                                        ? ` · Fin: ${formatFechaHora(ruta.routeDate, trip.endTime)}`
                                                        : ""}
                                                </p>
                                                <div className="flex gap-2">
                                                    {trip.progressStatus ===
                                                        "PENDING" && (
                                                        <button
                                                            onClick={() =>
                                                                ejecutarAccion(
                                                                    "iniciar",
                                                                    trip.id,
                                                                )
                                                            }
                                                            disabled={
                                                                procesandoId ===
                                                                trip.id
                                                            }
                                                            className="text-xs font-medium text-blue-600 hover:opacity-75 disabled:opacity-50"
                                                        >
                                                            Iniciar
                                                        </button>
                                                    )}
                                                    {trip.progressStatus ===
                                                        "IN_PROGRESS" && (
                                                        <button
                                                            onClick={() =>
                                                                ejecutarAccion(
                                                                    "completar",
                                                                    trip.id,
                                                                )
                                                            }
                                                            disabled={
                                                                procesandoId ===
                                                                trip.id
                                                            }
                                                            className="text-xs font-medium text-green-600 hover:opacity-75 disabled:opacity-50"
                                                        >
                                                            Completar
                                                        </button>
                                                    )}
                                                    {(trip.progressStatus ===
                                                        "PENDING" ||
                                                        trip.progressStatus ===
                                                            "IN_PROGRESS") && (
                                                        <button
                                                            onClick={() =>
                                                                ejecutarAccion(
                                                                    "cancelar",
                                                                    trip.id,
                                                                )
                                                            }
                                                            disabled={
                                                                procesandoId ===
                                                                trip.id
                                                            }
                                                            className="text-xs font-medium text-red-500 hover:opacity-75 disabled:opacity-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {ruta.trips && ruta.trips.length > 0 && (
                            <div className="border-t border-gray-100 pt-4">
                                {!resumenIA && !generandoResumen && (
                                    <button
                                        onClick={generarResumenIA}
                                        className="w-full flex items-center justify-center gap-2 border border-cixoil-red/30 text-cixoil-red text-sm font-semibold py-2.5 rounded-xl hover:bg-cixoil-red/5 transition"
                                    >
                                        <Sparkles size={15} />
                                        Generar resumen de ruta con IA
                                    </button>
                                )}

                                {generandoResumen && (
                                    <div className="flex items-center justify-center gap-2 py-3 text-gray-400">
                                        <Loader2
                                            size={18}
                                            className="animate-spin text-cixoil-red"
                                        />
                                        <span className="text-sm">
                                            Generando resumen...
                                        </span>
                                    </div>
                                )}

                                {errorResumen && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errorResumen}
                                    </p>
                                )}

                                {resumenIA && (
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                Resumen generado
                                            </p>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                                {resumenIA}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="tel"
                                                className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
                                                    errorTelefono
                                                        ? "border-red-400 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                                placeholder="Celular (ej: 987654321)"
                                                value={telefono}
                                                onChange={(e) => {
                                                    setTelefono(
                                                        e.target.value,
                                                    );
                                                    setErrorTelefono(null);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={enviarResumenWhatsApp}
                                                className="flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition shrink-0"
                                            >
                                                <MessageCircle size={16} />
                                                Enviar por WhatsApp
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Se descarga un PDF con el
                                            resumen y se abre WhatsApp:
                                            adjunta el PDF descargado en el
                                            chat.
                                        </p>
                                        {errorTelefono && (
                                            <p className="text-xs text-red-500">
                                                {errorTelefono}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
