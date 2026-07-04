import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Plus,
    Search,
    Star,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    getIncidenciasPorDocumento,
    reportarIncidenciaPublica,
} from "../../services/clientPortalService";

const ESTADOS = {
    OPEN: { label: "Abierta", clase: "bg-yellow-100 text-yellow-700" },
    IN_PROCESS: { label: "En proceso", clase: "bg-blue-100 text-blue-700" },
    RESOLVED: { label: "Resuelta", clase: "bg-green-100 text-green-700" },
    CLOSED: { label: "Cerrada", clase: "bg-gray-200 text-gray-600" },
    CANCELED: { label: "Cancelada", clase: "bg-gray-200 text-gray-500" },
};

const TIPOS_INCIDENCIA = [
    { idBackend: 1, label: "Producto dañado" },
    { idBackend: 2, label: "Error en pedido" },
    { idBackend: 3, label: "Devolución" },
    { idBackend: 4, label: "Queja" },
];

const FORM_VACIO = {
    name: "",
    fatherLastName: "",
    motherLastName: "",
    documentType: "DNI",
    docNumber: "",
    phoneNumber: "",
    email: "",
    address: "",
    idIncidentType: 1,
    title: "",
    description: "",
};

export default function PortalClienteIncidencias() {
    const [docNumber, setDocNumber] = useState("");
    const [incidencias, setIncidencias] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [form, setForm] = useState(FORM_VACIO);
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [reportada, setReportada] = useState(false);

    const buscar = async (doc) => {
        const documento = doc ?? docNumber;
        if (!documento.trim()) return;

        try {
            setCargando(true);
            setError(null);
            const data = await getIncidenciasPorDocumento(documento.trim());
            setIncidencias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al buscar incidencias:", err);
            setError("No se pudo buscar tus incidencias. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    const actualizarForm = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const enviarReporte = async (e) => {
        e.preventDefault();
        try {
            setEnviando(true);
            setErrorEnvio(null);
            await reportarIncidenciaPublica({
                ...form,
                motherLastName: form.motherLastName || null,
                email: form.email || null,
                idIncidentType: Number(form.idIncidentType),
            });
            setReportada(true);
            setDocNumber(form.docNumber);
            buscar(form.docNumber);
        } catch (err) {
            console.error("Error al reportar incidencia:", err);
            setErrorEnvio(
                err.response?.data?.message ||
                    "No se pudo registrar tu incidencia. Intenta de nuevo.",
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    to="/portal-cliente"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver
                </Link>

                <div className="text-center mb-6">
                    <h1 className="text-xl font-black text-cixoil-red">
                        Mis incidencias
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ingresa tu DNI o RUC para ver tus incidencias
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        buscar();
                    }}
                    className="flex gap-2 mb-3"
                >
                    <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="N° de DNI o RUC"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red/30"
                    />
                    <button
                        type="submit"
                        disabled={cargando}
                        className="px-4 py-2.5 rounded-xl bg-cixoil-red text-white font-semibold text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                        {cargando ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Search size={16} />
                        )}
                        Buscar
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => {
                        setReportada(false);
                        setForm((prev) => ({ ...prev, docNumber: docNumber || prev.docNumber }));
                        setMostrarFormulario(true);
                    }}
                    className="w-full mb-6 flex items-center justify-center gap-1 text-sm font-semibold text-cixoil-red border border-cixoil-red/30 rounded-xl py-2.5 hover:bg-red-50"
                >
                    <Plus size={16} />
                    Reportar una incidencia nueva
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-4 rounded-xl text-center mb-4">
                        {error}
                    </div>
                )}

                {incidencias && incidencias.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                        No encontramos incidencias con ese documento.
                    </p>
                )}

                <div className="space-y-3">
                    {incidencias?.map((inc) => (
                        <div
                            key={inc.id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-gray-900 text-sm">
                                    {inc.title}
                                </p>
                                <span
                                    className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${ESTADOS[inc.incidentStatus]?.clase || "bg-gray-100 text-gray-500"}`}
                                >
                                    {ESTADOS[inc.incidentStatus]?.label || inc.incidentStatus}
                                </span>
                            </div>
                            {inc.description && (
                                <p className="text-xs text-gray-500">
                                    {inc.description}
                                </p>
                            )}
                            {inc.resolutionNote && (
                                <p className="text-xs text-gray-700 bg-green-50 border border-green-100 rounded-lg p-2">
                                    <span className="font-semibold">Solución: </span>
                                    {inc.resolutionNote}
                                </p>
                            )}
                            {inc.rating && (
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            size={16}
                                            className={
                                                n <= inc.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                            {inc.ratingToken && (
                                <Link
                                    to={`/calificar-incidencia/${inc.ratingToken}`}
                                    className="inline-block text-xs font-semibold bg-cixoil-red text-white px-3 py-1.5 rounded-lg hover:opacity-90"
                                >
                                    Calificar solución
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">
                                Reportar una incidencia
                            </h2>
                            <button
                                type="button"
                                onClick={() => setMostrarFormulario(false)}
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {reportada ? (
                            <div className="p-8 text-center space-y-3">
                                <CheckCircle2
                                    size={36}
                                    className="text-cixoil-green mx-auto"
                                />
                                <p className="font-semibold text-gray-800">
                                    ¡Listo! Tu incidencia fue registrada.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Nos pondremos en contacto contigo para resolverla.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setForm(FORM_VACIO);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-cixoil-red text-white font-semibold hover:opacity-90"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={enviarReporte} className="p-4 space-y-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Tus datos
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nombres *"
                                        value={form.name}
                                        onChange={(e) => actualizarForm("name", e.target.value)}
                                        className="col-span-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Apellido paterno *"
                                        value={form.fatherLastName}
                                        onChange={(e) =>
                                            actualizarForm("fatherLastName", e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellido materno"
                                        value={form.motherLastName}
                                        onChange={(e) =>
                                            actualizarForm("motherLastName", e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <select
                                        value={form.documentType}
                                        onChange={(e) =>
                                            actualizarForm("documentType", e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                    <input
                                        required
                                        type="text"
                                        placeholder="N° de documento *"
                                        value={form.docNumber}
                                        onChange={(e) =>
                                            actualizarForm("docNumber", e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Teléfono *"
                                        value={form.phoneNumber}
                                        onChange={(e) =>
                                            actualizarForm("phoneNumber", e.target.value)
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo (opcional)"
                                        value={form.email}
                                        onChange={(e) => actualizarForm("email", e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dirección"
                                        value={form.address}
                                        onChange={(e) => actualizarForm("address", e.target.value)}
                                        className="col-span-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    />
                                </div>

                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">
                                    Sobre el problema
                                </p>
                                <select
                                    value={form.idIncidentType}
                                    onChange={(e) =>
                                        actualizarForm("idIncidentType", e.target.value)
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                >
                                    {TIPOS_INCIDENCIA.map((t) => (
                                        <option key={t.idBackend} value={t.idBackend}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    required
                                    type="text"
                                    placeholder="Título breve *"
                                    value={form.title}
                                    onChange={(e) => actualizarForm("title", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                />
                                <textarea
                                    required
                                    placeholder="Cuéntanos qué pasó *"
                                    value={form.description}
                                    onChange={(e) =>
                                        actualizarForm("description", e.target.value)
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
                                />

                                {errorEnvio && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        {errorEnvio}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full py-3 rounded-xl bg-cixoil-red text-white font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {enviando && (
                                        <Loader2 size={16} className="animate-spin" />
                                    )}
                                    Enviar reporte
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
