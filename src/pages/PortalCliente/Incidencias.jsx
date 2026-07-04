import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Plus,
    Search,
    Star,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    buscarClienteExistente,
    getIncidenciasPorDocumento,
    reportarIncidenciaPublica,
} from "../../services/clientPortalService";
import { buscarDocumentoPublico } from "../../services/publicSaleService";

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
    const [erroresForm, setErroresForm] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [reportada, setReportada] = useState(false);

    const [verificandoDoc, setVerificandoDoc] = useState(false);
    const [estadoDoc, setEstadoDoc] = useState(null);

    // Mismo criterio que en la tienda: primero busca si ya es
    // cliente nuestro (autocompleta todo), si no, consulta SUNAT
    // solo para el nombre. Nunca bloquea el formulario.
    useEffect(() => {
        const maxLargo = form.documentType === "RUC" ? 11 : 8;
        if (form.docNumber.length !== maxLargo) {
            setEstadoDoc(null);
            return;
        }

        let cancelado = false;

        const verificar = async () => {
            try {
                setVerificandoDoc(true);
                const cliente = await buscarClienteExistente(form.docNumber);
                if (cancelado) return;

                if (cliente.found) {
                    setForm((prev) => ({
                        ...prev,
                        name: cliente.name || prev.name,
                        fatherLastName: cliente.fatherLastName || prev.fatherLastName,
                        motherLastName: cliente.motherLastName || prev.motherLastName,
                        phoneNumber: cliente.phoneNumber || prev.phoneNumber,
                        email: cliente.email || prev.email,
                        address: cliente.address || prev.address,
                    }));
                    setEstadoDoc("cliente");
                    return;
                }

                const doc = await buscarDocumentoPublico(
                    form.documentType,
                    form.docNumber,
                );
                if (cancelado) return;

                if (doc.found) {
                    setForm((prev) => ({
                        ...prev,
                        name: doc.name || prev.name,
                        fatherLastName: doc.fatherLastName || prev.fatherLastName,
                        motherLastName: doc.motherLastName || prev.motherLastName,
                    }));
                    setEstadoDoc("verificado");
                } else {
                    setEstadoDoc("no-verificado");
                }
            } catch (err) {
                console.error("Error al verificar documento:", err);
                if (!cancelado) setEstadoDoc(null);
            } finally {
                if (!cancelado) setVerificandoDoc(false);
            }
        };

        verificar();

        return () => {
            cancelado = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.docNumber, form.documentType]);

    const buscar = async (doc) => {
        const documento = (doc ?? docNumber).trim();

        if (!documento) {
            setError("Ingresa tu número de DNI o RUC.");
            setIncidencias(null);
            return;
        }
        if (!/^\d{8}$|^\d{11}$/.test(documento)) {
            setError("El documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC).");
            setIncidencias(null);
            return;
        }

        try {
            setCargando(true);
            setError(null);
            const data = await getIncidenciasPorDocumento(documento);
            setIncidencias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al buscar incidencias:", err);
            setError(
                err.response?.data?.message ||
                    "No se pudo buscar tus incidencias. Intenta de nuevo.",
            );
        } finally {
            setCargando(false);
        }
    };

    const actualizarForm = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErroresForm((prev) => ({ ...prev, [campo]: null }));
    };

    // Documento y telefono solo aceptan digitos, recortados al largo real.
    const actualizarDocNumber = (valor) => {
        const soloDigitos = valor.replace(/\D/g, "");
        const maxLargo = form.documentType === "RUC" ? 11 : 8;
        actualizarForm("docNumber", soloDigitos.slice(0, maxLargo));
    };

    const actualizarTelefono = (valor) => {
        const soloDigitos = valor.replace(/\D/g, "");
        actualizarForm("phoneNumber", soloDigitos.slice(0, 9));
    };

    const validarFormulario = () => {
        const nuevos = {};
        if (!form.name.trim()) nuevos.name = "El nombre es obligatorio.";
        if (!form.fatherLastName.trim())
            nuevos.fatherLastName = "El apellido paterno es obligatorio.";
        if (!/^\d{8}$|^\d{11}$/.test(form.docNumber))
            nuevos.docNumber =
                form.documentType === "RUC"
                    ? "El RUC debe tener 11 dígitos."
                    : "El DNI debe tener 8 dígitos.";
        if (!/^\d{6,9}$/.test(form.phoneNumber))
            nuevos.phoneNumber = "Ingresa un teléfono válido (6 a 9 dígitos).";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            nuevos.email = "El correo no tiene un formato válido.";
        if (!form.title.trim()) nuevos.title = "El título es obligatorio.";
        if (!form.description.trim())
            nuevos.description = "Cuéntanos qué pasó.";
        setErroresForm(nuevos);
        return Object.keys(nuevos).length === 0;
    };

    const enviarReporte = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

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
                        inputMode="numeric"
                        maxLength={11}
                        value={docNumber}
                        onChange={(e) =>
                            setDocNumber(e.target.value.replace(/\D/g, ""))
                        }
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
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Nombres *"
                                            value={form.name}
                                            onChange={(e) => actualizarForm("name", e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.name ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {erroresForm.name && (
                                            <p className="text-xs text-red-500 mt-0.5">{erroresForm.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Apellido paterno *"
                                            value={form.fatherLastName}
                                            onChange={(e) =>
                                                actualizarForm("fatherLastName", e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.fatherLastName ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {erroresForm.fatherLastName && (
                                            <p className="text-xs text-red-500 mt-0.5">{erroresForm.fatherLastName}</p>
                                        )}
                                    </div>
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
                                        onChange={(e) => {
                                            const nuevoTipo = e.target.value;
                                            const maxLargo = nuevoTipo === "RUC" ? 11 : 8;
                                            setForm((prev) => ({
                                                ...prev,
                                                documentType: nuevoTipo,
                                                docNumber: prev.docNumber.slice(0, maxLargo),
                                            }));
                                        }}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={form.documentType === "RUC" ? 11 : 8}
                                            placeholder="N° de documento *"
                                            value={form.docNumber}
                                            onChange={(e) =>
                                                actualizarDocNumber(e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.docNumber ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {erroresForm.docNumber && (
                                            <p className="text-xs text-red-500 mt-0.5">{erroresForm.docNumber}</p>
                                        )}
                                        {!erroresForm.docNumber && verificandoDoc && (
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Loader2 size={11} className="animate-spin" />
                                                Verificando...
                                            </p>
                                        )}
                                        {!erroresForm.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "cliente" && (
                                                <p className="text-xs text-cixoil-green mt-0.5">
                                                    ✓ Te reconocimos, completamos tus datos
                                                </p>
                                            )}
                                        {!erroresForm.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "verificado" && (
                                                <p className="text-xs text-cixoil-green mt-0.5">
                                                    ✓ Documento verificado
                                                </p>
                                            )}
                                        {!erroresForm.docNumber &&
                                            !verificandoDoc &&
                                            estadoDoc === "no-verificado" && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    No pudimos verificarlo automáticamente
                                                </p>
                                            )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={9}
                                            placeholder="Teléfono *"
                                            value={form.phoneNumber}
                                            onChange={(e) =>
                                                actualizarTelefono(e.target.value)
                                            }
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.phoneNumber ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {erroresForm.phoneNumber && (
                                            <p className="text-xs text-red-500 mt-0.5">{erroresForm.phoneNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Correo (opcional)"
                                            value={form.email}
                                            onChange={(e) => actualizarForm("email", e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.email ? "border-red-400" : "border-gray-200"}`}
                                        />
                                        {erroresForm.email && (
                                            <p className="text-xs text-red-500 mt-0.5">{erroresForm.email}</p>
                                        )}
                                    </div>
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
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Título breve *"
                                        value={form.title}
                                        onChange={(e) => actualizarForm("title", e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${erroresForm.title ? "border-red-400" : "border-gray-200"}`}
                                    />
                                    {erroresForm.title && (
                                        <p className="text-xs text-red-500 mt-0.5">{erroresForm.title}</p>
                                    )}
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Cuéntanos qué pasó *"
                                        value={form.description}
                                        onChange={(e) =>
                                            actualizarForm("description", e.target.value)
                                        }
                                        rows={3}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${erroresForm.description ? "border-red-400" : "border-gray-200"}`}
                                    />
                                    {erroresForm.description && (
                                        <p className="text-xs text-red-500 mt-0.5">{erroresForm.description}</p>
                                    )}
                                </div>

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
