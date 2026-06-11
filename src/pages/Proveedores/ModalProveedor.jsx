import { Loader, Search, X } from "lucide-react";
import { useState } from "react";
import { crearProveedor } from "../../services/proveedoresService";

const SUNAT_TOKEN = import.meta.env.VITE_SUNAT_TOKEN;

export default function ModalProveedor({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        legalName: "",
        documentType: "RUC",
        docNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState(null);

    const cambiar = (campo, valor) =>
        setForm((prev) => ({ ...prev, [campo]: valor }));

    const buscarSunat = async () => {
        const doc = form.docNumber.trim();
        if (form.documentType === "RUC" && doc.length !== 11) {
            setError("El RUC debe tener 11 digitos");
            return;
        }
        if (form.documentType === "DNI" && doc.length !== 8) {
            setError("El DNI debe tener 8 digitos");
            return;
        }
        setBuscando(true);
        setError(null);
        try {
            const endpoint =
                form.documentType === "RUC"
                    ? `https://apiperu.dev/api/ruc/${doc}`
                    : `https://apiperu.dev/api/dni/${doc}`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${SUNAT_TOKEN}` },
            });
            const data = await res.json();
            if (!data.success) {
                setError("No se encontro el documento en SUNAT");
                return;
            }
            if (form.documentType === "RUC") {
                setForm((prev) => ({
                    ...prev,
                    legalName: data.data.nombre_o_razon_social || "",
                    address: data.data.direccion_completa || prev.address,
                }));
            } else {
                setForm((prev) => ({
                    ...prev,
                    legalName:
                        `${data.data.nombres || ""} ${data.data.apellido_paterno || ""} ${data.data.apellido_materno || ""}`.trim(),
                }));
            }
        } catch {
            setError("Error al consultar SUNAT. Verifica tu conexion.");
        } finally {
            setBuscando(false);
        }
    };

    const validar = () => {
        if (!form.legalName.trim()) return "La razon social es obligatoria.";
        if (!form.docNumber.trim())
            return "El numero de documento es obligatorio.";
        if (form.documentType === "RUC" && !/^\d{11}$/.test(form.docNumber))
            return "El RUC debe tener exactamente 11 digitos.";
        if (form.documentType === "DNI" && !/^\d{8}$/.test(form.docNumber))
            return "El DNI debe tener exactamente 8 digitos.";
        if (!form.phoneNumber.trim()) return "El telefono es obligatorio.";
        if (!/^\d{9}$/.test(form.phoneNumber))
            return "El telefono debe tener 9 digitos.";
        if (!form.email.trim()) return "El correo es obligatorio.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return "El correo no tiene formato valido.";
        if (!form.address.trim()) return "La direccion es obligatoria.";
        return null;
    };

    const guardar = async () => {
        const err = validar();
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await crearProveedor(form);
            onGuardar();
            onClose();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Error al guardar el proveedor.",
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-cixoil-red transition-colors placeholder:text-gray-300";
    const labelClass = "block text-xs font-medium text-gray-600 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        Nuevo proveedor
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                Tipo de documento
                            </label>
                            <select
                                value={form.documentType}
                                onChange={(e) =>
                                    cambiar("documentType", e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="RUC">RUC</option>
                                <option value="DNI">DNI</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Numero de documento *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    value={form.docNumber}
                                    onChange={(e) =>
                                        cambiar(
                                            "docNumber",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    placeholder={
                                        form.documentType === "RUC"
                                            ? "20123456789"
                                            : "12345678"
                                    }
                                    maxLength={
                                        form.documentType === "RUC" ? 11 : 8
                                    }
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={buscarSunat}
                                    disabled={buscando}
                                    className="px-3 py-2 bg-cixoil-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
                                    title="Buscar en SUNAT"
                                >
                                    {buscando ? (
                                        <Loader
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Search size={15} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Razon Social *</label>
                            <input
                                value={form.legalName}
                                onChange={(e) =>
                                    cambiar("legalName", e.target.value)
                                }
                                placeholder="Se autocompleta con SUNAT"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Telefono *</label>
                            <input
                                value={form.phoneNumber}
                                onChange={(e) =>
                                    cambiar(
                                        "phoneNumber",
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                placeholder="987654321"
                                maxLength={9}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Correo *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    cambiar("email", e.target.value)
                                }
                                placeholder="correo@empresa.com"
                                className={inputClass}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Direccion *</label>
                            <input
                                value={form.address}
                                onChange={(e) =>
                                    cambiar("address", e.target.value)
                                }
                                placeholder="Se autocompleta con SUNAT para RUC"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={loading}
                        className="px-5 py-2.5 bg-cixoil-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Guardando..." : "Guardar Proveedor"}
                    </button>
                </div>
            </div>
        </div>
    );
}
