import {
    CheckCircle2,
    Loader2,
    MapPin,
    MessageCircle,
    Package,
    Send,
    Star,
    Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    calificarEntrega,
    enviarMensajePublico,
    getMensajesPublico,
    getSeguimientoPublico,
} from "../../services/trackingService";

const ESTILOS_ESTADO = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELED: "bg-gray-200 text-gray-500",
};

const ETIQUETAS_ESTADO = {
    PENDING: "Pendiente de despacho",
    IN_PROGRESS: "En camino",
    COMPLETED: "Entregado",
    CANCELED: "Cancelado",
};

const ICONOS_ESTADO = {
    PENDING: Package,
    IN_PROGRESS: Truck,
    COMPLETED: CheckCircle2,
    CANCELED: Package,
};

const construirBbox = (lat, lng, delta = 0.006) =>
    `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

// Duracion del recorrido simulado: no depende de GPS real de ningun
// celular, solo interpola una posicion entre origen y destino segun el
// tiempo transcurrido desde que el vendedor le dio "Iniciar" al viaje.
// Pensado para que sea confiable y vistoso en una demo/sustentacion.
const DURACION_SIMULACION_SEGUNDOS = 120;

const calcularPosicionSimulada = (data) => {
    if (
        !data?.startDateTime ||
        data.originLatitude == null ||
        data.originLongitude == null ||
        data.destinationLatitude == null ||
        data.destinationLongitude == null
    ) {
        return null;
    }

    const segundosTranscurridos =
        (Date.now() - new Date(data.startDateTime).getTime()) / 1000;
    const fraccion = Math.min(
        1,
        Math.max(0, segundosTranscurridos / DURACION_SIMULACION_SEGUNDOS),
    );

    return {
        latitude:
            data.originLatitude +
            fraccion * (data.destinationLatitude - data.originLatitude),
        longitude:
            data.originLongitude +
            fraccion * (data.destinationLongitude - data.originLongitude),
        progreso: Math.round(fraccion * 100),
    };
};

const formatearHaceCuanto = (iso) => {
    if (!iso) return null;
    const segundos = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (segundos < 10) return "justo ahora";
    if (segundos < 60) return `hace ${segundos} seg`;
    const minutos = Math.floor(segundos / 60);
    return `hace ${minutos} min`;
};

export default function Seguimiento() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const dataRef = useRef(null);

    const [hoverEstrella, setHoverEstrella] = useState(0);
    const [calificando, setCalificando] = useState(false);
    const [errorCalificacion, setErrorCalificacion] = useState(null);
    const [, forzarTick] = useState(0);

    // Chat (no chatbot) con el personal de CIXOIL sobre este pedido.
    const [mensajes, setMensajes] = useState([]);
    const [textoMensaje, setTextoMensaje] = useState("");
    const [enviandoMensaje, setEnviandoMensaje] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState(null);
    const mensajesFinRef = useRef(null);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        let activo = true;

        const cargar = async () => {
            try {
                const res = await getSeguimientoPublico(token);
                if (activo) setData(res);
            } catch (err) {
                console.error("Error al cargar seguimiento:", err);
                if (activo) {
                    setError(
                        "No se pudo encontrar este pedido. Verifica que el link sea correcto.",
                    );
                }
            } finally {
                if (activo) setCargando(false);
            }
        };

        cargar();

        // Auto-refresco cada 8s mientras el pedido no ha terminado, para
        // que el estado y la ubicacion se vean "en vivo" sin recargar.
        // Usa una ref (no el estado) para no reiniciar el timer en cada
        // actualizacion.
        const intervalo = setInterval(() => {
            const estado = dataRef.current?.progressStatus;
            if (!estado || estado === "IN_PROGRESS" || estado === "PENDING") {
                cargar();
            }
        }, 8000);

        return () => {
            activo = false;
            clearInterval(intervalo);
        };
    }, [token]);

    // Repinta cada segundo mientras el viaje esta en camino, para que la
    // posicion simulada avance suave en el mapa sin depender del
    // auto-refresco de 8s (que solo trae datos nuevos del servidor).
    useEffect(() => {
        if (data?.progressStatus !== "IN_PROGRESS") return;
        const id = setInterval(() => forzarTick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, [data?.progressStatus]);

    // Chat: se consulta aparte del resto de datos del pedido (cada 5s, mas
    // seguido que el auto-refresco general) para que se sienta como un
    // chat real y no como un formulario que hay que recargar.
    useEffect(() => {
        if (!data) return;
        let activo = true;

        const cargarMensajes = async () => {
            try {
                const res = await getMensajesPublico(token);
                if (activo) setMensajes(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Error al cargar mensajes:", err);
            }
        };

        cargarMensajes();
        const intervalo = setInterval(cargarMensajes, 5000);
        return () => {
            activo = false;
            clearInterval(intervalo);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, !!data]);

    useEffect(() => {
        mensajesFinRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes.length]);

    const handleEnviarMensaje = async (e) => {
        e.preventDefault();
        const texto = textoMensaje.trim();
        if (!texto || enviandoMensaje) return;

        try {
            setEnviandoMensaje(true);
            setErrorMensaje(null);
            const nuevo = await enviarMensajePublico(token, texto);
            setMensajes((prev) => [...prev, nuevo]);
            setTextoMensaje("");
        } catch (err) {
            console.error("Error al enviar mensaje:", err);
            setErrorMensaje("No se pudo enviar tu mensaje. Intenta de nuevo.");
        } finally {
            setEnviandoMensaje(false);
        }
    };

    const Icono = data ? ICONOS_ESTADO[data.progressStatus] || Package : Package;

    const posicionSimulada = calcularPosicionSimulada(data);
    const posicionMapa =
        data?.latitude && data?.longitude
            ? { latitude: data.latitude, longitude: data.longitude, progreso: null }
            : posicionSimulada;

    const handleCalificar = async (valor) => {
        try {
            setCalificando(true);
            setErrorCalificacion(null);
            const actualizado = await calificarEntrega(token, valor);
            setData(actualizado);
        } catch (err) {
            console.error("Error al calificar entrega:", err);
            setErrorCalificacion(
                "No se pudo enviar tu calificación. Intenta de nuevo.",
            );
        } finally {
            setCalificando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-cixoil-red">
                        CIXOIL S.A.C.
                    </h1>
                    <p className="text-sm text-gray-500">
                        Seguimiento de tu pedido
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    {cargando && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm">Buscando tu pedido...</span>
                        </div>
                    )}

                    {!cargando && error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {!cargando && data && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-gray-100">
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center ${ESTILOS_ESTADO[data.progressStatus] || "bg-gray-100 text-gray-500"}`}
                                >
                                    <Icono size={26} />
                                </div>
                                <p className="font-bold text-lg text-gray-800">
                                    {ETIQUETAS_ESTADO[data.progressStatus] ||
                                        data.progressStatus}
                                </p>
                                {data.routeDate && (
                                    <p className="text-xs text-gray-400">
                                        Fecha de reparto: {data.routeDate}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                <MapPin
                                    size={18}
                                    className="text-cixoil-red shrink-0"
                                />
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">
                                        {data.origin}
                                    </span>{" "}
                                    →{" "}
                                    <span className="font-semibold">
                                        {data.destination}
                                    </span>
                                </p>
                            </div>

                            {data.progressStatus === "IN_PROGRESS" &&
                                posicionMapa && (
                                    <div className="rounded-xl overflow-hidden border border-gray-200">
                                        <iframe
                                            title="Ubicacion en vivo del pedido"
                                            width="100%"
                                            height="220"
                                            style={{ border: 0 }}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${construirBbox(
                                                posicionMapa.latitude,
                                                posicionMapa.longitude,
                                            )}&layer=mapnik&marker=${posicionMapa.latitude},${posicionMapa.longitude}`}
                                        />
                                        {posicionMapa.progreso != null ? (
                                            <div className="bg-gray-50 px-3 py-2">
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cixoil-red transition-all duration-1000"
                                                        style={{
                                                            width: `${posicionMapa.progreso}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-gray-400 text-center pt-1">
                                                    🚚 {posicionMapa.progreso}%
                                                    del camino
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-gray-400 text-center py-1.5 bg-gray-50">
                                                📍 Ubicación en vivo del reparto
                                                {formatearHaceCuanto(
                                                    data.ubicacionActualizada,
                                                ) &&
                                                    ` · actualizado ${formatearHaceCuanto(data.ubicacionActualizada)}`}
                                            </p>
                                        )}
                                    </div>
                                )}

                            {data.clienteNombre && (
                                <div className="text-center text-sm text-gray-500">
                                    Pedido a nombre de{" "}
                                    <span className="font-semibold text-gray-700">
                                        {data.clienteNombre}
                                    </span>
                                </div>
                            )}

                            {(data.startTime || data.endTime) && (
                                <div className="flex justify-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                                    {data.startTime && (
                                        <span>Salida: {data.startTime}</span>
                                    )}
                                    {data.endTime && (
                                        <span>Entrega: {data.endTime}</span>
                                    )}
                                </div>
                            )}

                            {data.progressStatus === "COMPLETED" && (
                                <div className="pt-3 border-t border-gray-100 text-center">
                                    {data.deliveryRating ? (
                                        <div className="flex flex-col items-center gap-2 py-1">
                                            <p className="text-sm font-semibold text-gray-700">
                                                ¡Gracias por tu calificación!
                                            </p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        size={20}
                                                        className={
                                                            n <=
                                                            data.deliveryRating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-gray-600 mb-3">
                                                ¿Cómo llegó tu pedido?
                                                Califica tu entrega
                                            </p>
                                            <div className="flex justify-center gap-2">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        disabled={calificando}
                                                        onMouseEnter={() =>
                                                            setHoverEstrella(n)
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoverEstrella(0)
                                                        }
                                                        onClick={() =>
                                                            handleCalificar(n)
                                                        }
                                                        className="disabled:opacity-50"
                                                    >
                                                        <Star
                                                            size={28}
                                                            className={
                                                                n <=
                                                                hoverEstrella
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            }
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            {calificando && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Enviando...
                                                </p>
                                            )}
                                            {errorCalificacion && (
                                                <p className="text-xs text-red-500 mt-2">
                                                    {errorCalificacion}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!cargando && data && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-4 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                            <MessageCircle size={16} className="text-cixoil-red" />
                            <p className="text-sm font-bold text-gray-800">
                                Chat con CIXOIL
                            </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2">
                            {mensajes.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">
                                    Escríbenos si tienes alguna consulta sobre
                                    tu pedido.
                                </p>
                            )}
                            {mensajes.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.sender === "CLIENT" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                                            m.sender === "CLIENT"
                                                ? "bg-cixoil-red text-white"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {m.sender !== "CLIENT" && (
                                            <p className="text-[10px] font-semibold text-gray-400 mb-0.5">
                                                {m.senderName || "CIXOIL"}
                                            </p>
                                        )}
                                        <p className="whitespace-pre-wrap break-words">
                                            {m.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={mensajesFinRef} />
                        </div>

                        {errorMensaje && (
                            <p className="text-xs text-red-500 px-4 pb-1">
                                {errorMensaje}
                            </p>
                        )}

                        <form
                            onSubmit={handleEnviarMensaje}
                            className="flex items-center gap-2 border-t border-gray-100 p-2"
                        >
                            <input
                                type="text"
                                value={textoMensaje}
                                onChange={(e) =>
                                    setTextoMensaje(e.target.value)
                                }
                                maxLength={500}
                                placeholder="Escribe un mensaje..."
                                disabled={enviandoMensaje}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red/30"
                            />
                            <button
                                type="submit"
                                disabled={enviandoMensaje || !textoMensaje.trim()}
                                className="shrink-0 w-9 h-9 rounded-lg bg-cixoil-red text-white flex items-center justify-center disabled:opacity-50"
                            >
                                {enviandoMensaje ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </form>
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-4">
                    CIXOIL S.A.C. - Lubricantes y derivados
                </p>
            </div>
        </div>
    );
}
