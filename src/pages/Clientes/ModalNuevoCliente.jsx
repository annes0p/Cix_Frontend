import { X, Search, Loader } from "lucide-react";
import { useState } from "react";
import { crearCliente } from "../../services/clienteService";

const SUNAT_TOKEN = "64d370ab0213b3379b939e7f0890c1bde68e4cab4bb8ce62bcf9e13b1e170a0b";

export default function ModalNuevoCliente({ onClose, onClienteCreado }) {
    const [form, setForm] = useState({
        name: "",
        fatherLastName: "",
        motherLastName: "",
        documentType: "DNI",
        docNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        idLocation: null,
        trusted: false,
    });
    const [loading, setLoading] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState(null);

    const cambiar = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const buscarSunat = async () => {
        const doc = form.docNumber.trim();
        if (form.documentType === "DNI" && doc.length !== 8) {
            setError("El DNI debe tener 8 digitos");
            return;
        }
        if (form.documentType === "RUC" && doc.length !== 11) {
            setError("El RUC debe tener 11 digitos");
            return;
        }
        setBuscando(true);
        setError(null);
        try {
            const endpoint = form.documentType === "DNI"
                ? `https://apiperu.dev/api/dni/${doc}`
                : `https://apiperu.dev/api/ruc/${doc}`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${SUNAT_TOKEN}` },
            });
            const data = await res.json();
            if (!data.success) {
                setError("No se encontro el documento en SUNAT");
                return;
            }
            if (form.documentType === "DNI") {
                setForm((prev) => ({
                    ...prev,
                    name: data.data.nombres || "",
                    fatherLastName: data.data.apellido_paterno || "",
                    motherLastName: data.data.apellido_materno || "",
                }));
            } else {
                setForm((prev) => ({
                    ...prev,
                    name: data.data.nombre_o_razon_social || "",
                    fatherLastName: "",
                    motherLastName: "",
                    address: data.data.direccion_completa || prev.address,
                }));
            }
        } catch {
            setError("Error al consultar SUNAT. Verifica tu conexion.");
        } finally {
            setBuscando(false);
        }
    };

    const validar = () => {
        if (!form.name) return "El nombre es requerido";
        if (!form.docNumber) return "El numero de documento es requerido";
        if (form.documentType === "DNI" && form.docNumber.length !== 8)
            return "El DNI debe tener 8 digitos";
        if (form.documentType === "RUC" && form.docNumber.length !== 11)
            return "El RUC debe tener 11 digitos";
        if (form.phoneNumber && !/^\d+$/.test(form.phoneNumber))
            return "El telefono solo debe contener numeros";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return "El email no tiene un formato valido";
        return null;
    };

    const handleGuardar = async () => {
        const err = validar();
        if (err) { setError(err); return; }
        setError(null);
        setLoading(true);
        try {
            const nuevo = await crearCliente(form);
            onClienteCreado(nuevo);
        } catch (err) {
            setError(err?.response?.data?.message || "Error al crear el cliente");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-300";
    const labelClass = "block text-xs font-medium text-gray-600 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Nuevo cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tipo de documento</label>
                            <select value={form.documentType} onChange={(e) => cambiar("documentType", e.target.value)} className={inputClass}>
                                <option value="DNI">DNI</option>
                                <option value="RUC">RUC</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Numero de documento *</label>
                            <div className="flex gap-2">
                                <input
                                    value={form.docNumber}
                                    onChange={(e) => cambiar("docNumber", e.target.value.replace(/\D/g, ""))}
                                    placeholder={form.documentType === "DNI" ? "12345678" : "20123456789"}
                                    maxLength={form.documentType === "DNI" ? 8 : 11}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={buscarSunat}
                                    disabled={buscando}
                                    className="px-3 py-2 bg-cixoil-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
                                    title="Buscar en SUNAT"
                                >
                                    {buscando ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Nombre *</label>
                            <input value={form.name} onChange={(e) => cambiar("name", e.target.value)} placeholder="Nombre" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Apellido paterno</label>
                            <input value={form.fatherLastName} onChange={(e) => cambiar("fatherLastName", e.target.value)} placeholder="Apellido paterno" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Apellido materno</label>
                            <input value={form.motherLastName} onChange={(e) => cambiar("motherLastName", e.target.value)} placeholder="Apellido materno" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefono</label>
                            <input
                                value={form.phoneNumber}
                                onChange={(e) => cambiar("phoneNumber", e.target.value.replace(/\D/g, ""))}
                                placeholder="987654321"
                                maxLength={9}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" value={form.email} onChange={(e) => cambiar("email", e.target.value)} placeholder="correo@ejemplo.com" className={inputClass} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Direccion</label>
                            <input value={form.address} onChange={(e) => cambiar("address", e.target.value)} placeholder="Av. Principal 123" className={inputClass} />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="trusted"
                                checked={form.trusted}
                                onChange={(e) => cambiar("trusted", e.target.checked)}
                                className="w-4 h-4 text-cixoil-red border-gray-300 rounded focus:ring-cixoil-red"
                            />
                            <label htmlFor="trusted" className="text-sm text-gray-700 select-none">Cliente de confianza</label>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleGuardar} disabled={loading} className="px-5 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                        {loading ? "Guardando..." : "Guardar cliente"}
                    </button>
                </div>
            </div>
        </div>
    );
}
