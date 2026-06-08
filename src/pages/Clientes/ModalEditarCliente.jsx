import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { actualizarCliente } from "../../services/clienteService";

export default function ModalEditarCliente({ cliente, onClose, onClienteActualizado }) {
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
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cliente) {
            setForm({
                name: cliente.name || "",
                fatherLastName: cliente.fatherLastName || "",
                motherLastName: cliente.motherLastName || "",
                documentType: cliente.documentType || "DNI",
                docNumber: cliente.docNumber || "",
                phoneNumber: cliente.phoneNumber || "",
                email: cliente.email || "",
                address: cliente.address || "",
                idLocation: cliente.location?.id || null,
                trusted: cliente.trusted || false,
            });
        }
    }, [cliente]);

    const cambiar = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const handleGuardar = async () => {
        if (!form.name) { setError("El nombre es requerido"); return; }
        if (!form.docNumber) { setError("El numero de documento es requerido"); return; }
        setError(null);
        setLoading(true);
        try {
            const actualizado = await actualizarCliente(cliente.id, form);
            onClienteActualizado(actualizado);
        } catch (err) {
            setError(err?.response?.data?.message || "Error al actualizar el cliente");
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
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Editar cliente</h2>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {cliente?.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
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
                            <label className={labelClass}>Tipo de documento</label>
                            <select value={form.documentType} onChange={(e) => cambiar("documentType", e.target.value)} className={inputClass}>
                                <option value="DNI">DNI</option>
                                <option value="RUC">RUC</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Numero de documento *</label>
                            <input value={form.docNumber} onChange={(e) => cambiar("docNumber", e.target.value)} placeholder="12345678" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefono</label>
                            <input value={form.phoneNumber} onChange={(e) => cambiar("phoneNumber", e.target.value)} placeholder="987654321" className={inputClass} />
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
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}
