import { X } from "lucide-react";
import { useState } from "react";
import { crearProveedor } from "../../services/proveedoresService";

export default function ModalProveedor({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        legalName: "",
        documentType: "RUC",
        docNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
    });
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
        setErrores((prev) => ({ ...prev, [campo]: null }));
    };

    const validar = () => {
        const nuevosErrores = {};

        if (!form.legalName.trim())
            nuevosErrores.legalName = "La razon social es obligatoria.";

        if (!form.docNumber.trim()) {
            nuevosErrores.docNumber = "El numero de documento es obligatorio.";
        } else if (
            form.documentType === "RUC" &&
            !/^\d{11}$/.test(form.docNumber)
        ) {
            nuevosErrores.docNumber =
                "El RUC debe tener exactamente 11 digitos.";
        } else if (
            form.documentType === "DNI" &&
            !/^\d{8}$/.test(form.docNumber)
        ) {
            nuevosErrores.docNumber =
                "El DNI debe tener exactamente 8 digitos.";
        }

        if (!form.phoneNumber.trim()) {
            nuevosErrores.phoneNumber = "El telefono es obligatorio.";
        } else if (!/^\d{9}$/.test(form.phoneNumber)) {
            nuevosErrores.phoneNumber = "El telefono debe tener 9 digitos.";
        }

        if (!form.email.trim()) {
            nuevosErrores.email = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nuevosErrores.email = "El correo no tiene un formato valido.";
        }

        if (!form.address.trim())
            nuevosErrores.address = "La direccion es obligatoria.";

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const guardar = async (e) => {
        e.preventDefault();
        if (!validar()) return;
        try {
            setLoading(true);
            setErrorApi(null);
            await crearProveedor(form);
            onGuardar();
            onClose();
        } catch (err) {
            setErrorApi("Error al guardar el proveedor. Intenta de nuevo.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (campo) =>
        `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red ${
            errores[campo] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <div>
                        <h2 className="font-bold text-lg">Nuevo proveedor</h2>
                        <p className="text-sm text-gray-500">
                            Registrar proveedor
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X />
                    </button>
                </div>

                <form onSubmit={guardar} className="p-6 space-y-4">
                    {errorApi && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                            {errorApi}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Tipo de documento
                        </label>
                        <select
                            className={inputClass("documentType")}
                            value={form.documentType}
                            onChange={(e) =>
                                handleChange("documentType", e.target.value)
                            }
                        >
                            <option value="RUC">RUC</option>
                            <option value="DNI">DNI</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Numero de documento
                        </label>
                        <input
                            type="text"
                            className={inputClass("docNumber")}
                            value={form.docNumber}
                            onChange={(e) =>
                                handleChange("docNumber", e.target.value)
                            }
                            maxLength={form.documentType === "RUC" ? 11 : 8}
                            placeholder={
                                form.documentType === "RUC"
                                    ? "11 digitos"
                                    : "8 digitos"
                            }
                        />
                        {errores.docNumber && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.docNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Razon Social
                        </label>
                        <input
                            type="text"
                            className={inputClass("legalName")}
                            value={form.legalName}
                            onChange={(e) =>
                                handleChange("legalName", e.target.value)
                            }
                            placeholder="Nombre o razon social"
                        />
                        {errores.legalName && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.legalName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Telefono
                        </label>
                        <input
                            type="text"
                            className={inputClass("phoneNumber")}
                            value={form.phoneNumber}
                            onChange={(e) =>
                                handleChange("phoneNumber", e.target.value)
                            }
                            maxLength={9}
                            placeholder="9 digitos"
                        />
                        {errores.phoneNumber && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.phoneNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Correo
                        </label>
                        <input
                            type="text"
                            className={inputClass("email")}
                            value={form.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                            placeholder="ejemplo@correo.com"
                        />
                        {errores.email && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Direccion
                        </label>
                        <input
                            type="text"
                            className={inputClass("address")}
                            value={form.address}
                            onChange={(e) =>
                                handleChange("address", e.target.value)
                            }
                            placeholder="Direccion completa"
                        />
                        {errores.address && (
                            <p className="text-xs text-red-500 mt-1">
                                {errores.address}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-cixoil-red text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Proveedor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
