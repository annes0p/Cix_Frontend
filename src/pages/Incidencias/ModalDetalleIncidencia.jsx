import { CheckCircle, Circle, MessageCircle, Sparkles, Star, X } from "lucide-react";
import { useState } from "react";
import {
    actualizarEstadoIncidencia,
    documentarResolucion,
    getLinkCalificacion,
} from "../../services/incidenciasService";

const TIPO_LABELS = {
    PRODUCTO_DANADO: "Producto dañado",
    ERROR_PEDIDO: "Error en pedido",
    DEVOLUCION: "Devolución",
    QUEJA_CLIENTE: "Queja de cliente",
    PROBLEMA_PROVEEDOR: "Problema con proveedor",
};

const PRIORIDAD_ESTILOS = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAJA: "bg-gray-100 text-gray-600",
};

const PRIORIDAD_LABELS = {
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja",
};

const formatFecha = (iso) =>
    iso
        ? new Date(iso).toLocaleString("es-PE", {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "-";

const PASOS = [
    {
        value: "ABIERTA",
        label: "Abierta",
        descripcion: "Incidencia registrada",
    },
    {
        value: "EN_PROCESO",
        label: "En proceso",
        descripcion: "Siendo atendida",
    },
    { value: "RESUELTA", label: "Resuelta", descripcion: "Solución aplicada" },
    { value: "CERRADA", label: "Cerrada", descripcion: "Confirmado y cerrado" },
];

const ORDEN_ESTADOS = ["ABIERTA", "EN_PROCESO", "RESUELTA", "CERRADA"];
const ESTADOS_RESOLUCION = ["RESUELTA", "CERRADA"];

async function generarResumenIA(incidencia, documentacionRaw) {
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
                temperature: 0.3,
                messages: [
                    {
                        role: "system",
                        content: `Eres un asistente de gestión de incidencias para CIXOIL S.A.C., empresa distribuidora de lubricantes en Perú.
Tu tarea es tomar la descripción informal de cómo se resolvió una incidencia y convertirla en una documentación profesional, clara y estructurada.
Responde ÚNICAMENTE con el texto del resumen, sin markdown, sin títulos, sin asteriscos. Máximo 3 oraciones en español formal.`,
                    },
                    {
                        role: "user",
                        content: `Incidencia: "${incidencia.titulo}"
Tipo: ${TIPO_LABELS[incidencia.tipo] || incidencia.tipo}
Descripción del problema: "${incidencia.descripcion}"
Resolución informal del usuario: "${documentacionRaw}"

Genera un resumen profesional de la resolución.`,
                    },
                ],
            }),
        },
    );
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

function TrackerEstado({ estadoActual, onAvanzar, guardando }) {
    const indiceActual = ORDEN_ESTADOS.indexOf(estadoActual);
    const puedeAvanzar = indiceActual < ORDEN_ESTADOS.length - 1;
    const siguienteEstado = puedeAvanzar
        ? ORDEN_ESTADOS[indiceActual + 1]
        : null;

    return (
        <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-4">
                Seguimiento de incidencia
            </p>

            {/* Barra de progreso */}
            <div className="relative flex items-center justify-between mb-6">
                {/* Línea de fondo */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
                {/* Línea de progreso */}
                <div
                    className="absolute left-0 top-4 h-0.5 bg-cixoil-green z-0 transition-all duration-500"
                    style={{
                        width: `${(indiceActual / (PASOS.length - 1)) * 100}%`,
                    }}
                />

                {PASOS.map((paso, index) => {
                    const completado = index < indiceActual;
                    const actual = index === indiceActual;

                    return (
                        <div
                            key={paso.value}
                            className="relative z-10 flex flex-col items-center gap-1"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    completado
                                        ? "bg-cixoil-green border-cixoil-green"
                                        : actual
                                          ? "bg-white border-cixoil-red"
                                          : "bg-white border-gray-300"
                                }`}
                            >
                                {completado ? (
                                    <CheckCircle
                                        size={16}
                                        className="text-white"
                                    />
                                ) : actual ? (
                                    <div className="w-3 h-3 rounded-full bg-cixoil-red" />
                                ) : (
                                    <Circle
                                        size={16}
                                        className="text-gray-300"
                                    />
                                )}
                            </div>
                            <p
                                className={`text-xs font-semibold text-center ${
                                    completado
                                        ? "text-cixoil-green"
                                        : actual
                                          ? "text-cixoil-red"
                                          : "text-gray-400"
                                }`}
                            >
                                {paso.label}
                            </p>
                            <p className="text-xs text-gray-400 text-center hidden sm:block">
                                {paso.descripcion}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Botón para avanzar al siguiente estado */}
            {puedeAvanzar &&
                siguienteEstado !== "RESUELTA" &&
                siguienteEstado !== "CERRADA" && (
                    <button
                        onClick={() => onAvanzar(siguienteEstado)}
                        disabled={guardando}
                        className="w-full bg-cixoil-green text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {guardando
                            ? "Actualizando..."
                            : `Avanzar a "${PASOS[indiceActual + 1]?.label}"`}
                    </button>
                )}
        </div>
    );
}

export default function ModalDetalleIncidencia({
    incidencia,
    onClose,
    onActualizar,
}) {
    const [estado, setEstado] = useState(incidencia.estado);
    const [documentacion, setDocumentacion] = useState(
        incidencia.documentacionResolucion || "",
    );
    const [guardando, setGuardando] = useState(false);
    const [errorDoc, setErrorDoc] = useState(null);
    const [generandoIA, setGenerandoIA] = useState(false);

    const [linkCalificacion, setLinkCalificacion] = useState(null);
    const [cargandoLinkCalificacion, setCargandoLinkCalificacion] =
        useState(false);
    const [errorLinkCalificacion, setErrorLinkCalificacion] = useState(null);
    const [telefonoCalificacion, setTelefonoCalificacion] = useState("");

    const requiereDocumentacion = ESTADOS_RESOLUCION.includes(estado);
    const yaEstabaResuelto = ESTADOS_RESOLUCION.includes(incidencia.estado);

    const handleAvanzarEstado = async (nuevoEstado) => {
        try {
            setGuardando(true);
            await actualizarEstadoIncidencia(incidencia.id, nuevoEstado);
            setEstado(nuevoEstado);
            onActualizar();
        } catch (error) {
            console.error("Error al avanzar estado:", error);
        } finally {
            setGuardando(false);
        }
    };

    const handleGenerarResumenIA = async () => {
        if (!documentacion.trim()) {
            setErrorDoc(
                "Escribe algo primero para que la IA pueda generar el resumen.",
            );
            return;
        }
        try {
            setGenerandoIA(true);
            const resumen = await generarResumenIA(incidencia, documentacion);
            setDocumentacion(resumen);
            setErrorDoc(null);
        } catch (err) {
            console.error("Error al generar resumen con IA:", err);
            setErrorDoc("No se pudo generar el resumen. Intenta de nuevo.");
        } finally {
            setGenerandoIA(false);
        }
    };

    const handleResolverOCerrar = async () => {
        if (!documentacion.trim()) {
            setErrorDoc(
                "Documenta cómo se resolvió la incidencia antes de continuar.",
            );
            return;
        }
        try {
            setGuardando(true);
            await documentarResolucion(incidencia.id, documentacion.trim());
            setEstado("RESUELTA");
            onActualizar();
        } catch (error) {
            console.error("Error al resolver incidencia:", error);
        } finally {
            setGuardando(false);
        }
    };

    const handleGenerarLinkCalificacion = async () => {
        try {
            setCargandoLinkCalificacion(true);
            setErrorLinkCalificacion(null);
            const token = await getLinkCalificacion(incidencia.id);
            setLinkCalificacion(
                `${window.location.origin}/calificar-incidencia/${token}`,
            );
        } catch (error) {
            console.error("Error al generar link de calificación:", error);
            setErrorLinkCalificacion(
                "No se pudo generar el link de calificación.",
            );
        } finally {
            setCargandoLinkCalificacion(false);
        }
    };

    const numeroCalificacionValido = /^\d{9}$/.test(
        telefonoCalificacion.replace(/\D/g, ""),
    );

    const linkWhatsAppCalificacion = numeroCalificacionValido
        ? `https://wa.me/51${telefonoCalificacion.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Hola! Gracias por tu paciencia. Nos ayudarias mucho si calificas como resolvimos tu caso: ${linkCalificacion}`,
          )}`
        : null;

    const handleCerrar = async () => {
        try {
            setGuardando(true);
            await actualizarEstadoIncidencia(incidencia.id, "CERRADA");
            setEstado("CERRADA");
            onActualizar();
        } catch (error) {
            console.error("Error al cerrar incidencia:", error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">
                        Detalle de incidencia
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Titulo
                        </p>
                        <p className="font-bold text-gray-900">
                            {incidencia.titulo}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Tipo
                            </p>
                            <p className="text-sm text-gray-700">
                                {TIPO_LABELS[incidencia.tipo] ||
                                    incidencia.tipo}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Prioridad
                            </p>
                            <span
                                className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                                    PRIORIDAD_ESTILOS[incidencia.prioridad] ||
                                    "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {PRIORIDAD_LABELS[incidencia.prioridad] ||
                                    incidencia.prioridad}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Descripcion
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                            {incidencia.descripcion}
                        </p>
                    </div>

                    {incidencia.relacionado?.tipo && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Relacionado
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.relacionado.tipo}
                                {incidencia.relacionado.nombre
                                    ? ` — ${incidencia.relacionado.nombre}`
                                    : ""}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Reportado por
                            </p>
                            <p className="text-sm text-gray-700">
                                {incidencia.reportadoPor}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de registro
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.createdAt)}
                            </p>
                        </div>
                    </div>

                    {incidencia.resolvedAt && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Fecha de resolución
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatFecha(incidencia.resolvedAt)}
                            </p>
                        </div>
                    )}

                    {incidencia.documentacionResolucion && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Cómo se resolvió
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3 border border-green-100">
                                {incidencia.documentacionResolucion}
                            </p>
                        </div>
                    )}

                    {ESTADOS_RESOLUCION.includes(estado) && (
                        <div className="pt-2 border-t border-gray-100">
                            {incidencia.calificacion ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Calificación del cliente
                                    </p>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star
                                                key={n}
                                                size={14}
                                                className={
                                                    n <= incidencia.calificacion
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Pedir calificación al cliente
                                    </p>
                                    {!linkCalificacion &&
                                        !cargandoLinkCalificacion && (
                                            <button
                                                type="button"
                                                onClick={
                                                    handleGenerarLinkCalificacion
                                                }
                                                className="text-xs font-medium text-cixoil-red hover:opacity-75"
                                            >
                                                Generar link de calificación
                                            </button>
                                        )}
                                    {cargandoLinkCalificacion && (
                                        <p className="text-xs text-gray-400">
                                            Generando link...
                                        </p>
                                    )}
                                    {errorLinkCalificacion && (
                                        <p className="text-xs text-red-500">
                                            {errorLinkCalificacion}
                                        </p>
                                    )}
                                    {linkCalificacion && (
                                        <div className="flex gap-1.5">
                                            <input
                                                type="tel"
                                                placeholder="Celular (9 digitos)"
                                                value={telefonoCalificacion}
                                                onChange={(e) =>
                                                    setTelefonoCalificacion(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cixoil-red"
                                            />
                                            <a
                                                href={
                                                    linkWhatsAppCalificacion ||
                                                    undefined
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => {
                                                    if (
                                                        !numeroCalificacionValido
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className={`flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition ${
                                                    numeroCalificacionValido
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                <MessageCircle size={13} />
                                                Enviar
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Tracker visual de estados */}
                    <TrackerEstado
                        estadoActual={estado}
                        onAvanzar={handleAvanzarEstado}
                        guardando={guardando}
                    />

                    {/* Documentación al resolver */}
                    {(estado === "EN_PROCESO" || estado === "RESUELTA") &&
                        !yaEstabaResuelto && (
                            <div className="pt-2 border-t border-gray-100 space-y-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium text-gray-600">
                                        ¿Cómo se resolvió?{" "}
                                        <span className="text-cixoil-red">
                                            *
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerarResumenIA}
                                        disabled={generandoIA}
                                        className="flex items-center gap-1.5 text-xs font-medium text-cixoil-red hover:opacity-75 disabled:opacity-50 transition-opacity"
                                    >
                                        <Sparkles size={13} />
                                        {generandoIA
                                            ? "Generando..."
                                            : "Mejorar con IA"}
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red resize-none ${
                                        errorDoc
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Describe cómo se documentó y resolvió la incidencia internamente..."
                                    value={documentacion}
                                    onChange={(e) => {
                                        setDocumentacion(e.target.value);
                                        setErrorDoc(null);
                                    }}
                                />
                                {errorDoc && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errorDoc}
                                    </p>
                                )}
                                <button
                                    onClick={handleResolverOCerrar}
                                    disabled={guardando}
                                    className="w-full bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-medium hover:bg-red-900 transition-colors disabled:opacity-50"
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : "Marcar como resuelta"}
                                </button>
                            </div>
                        )}

                    {/* Botón cerrar cuando está resuelta */}
                    {estado === "RESUELTA" && (
                        <button
                            onClick={handleCerrar}
                            disabled={guardando}
                            className="w-full border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {guardando
                                ? "Cerrando..."
                                : "Confirmar y cerrar incidencia"}
                        </button>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
