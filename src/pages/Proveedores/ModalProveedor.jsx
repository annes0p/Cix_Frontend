import { X } from "lucide-react";
import { useState } from "react";
import { crearProveedor } from "../../services/proveedoresService";

export default function ModalProveedor({ onClose, onGuardar }) {
    const [form, setForm] = useState({
        ruc: "",
        razonSocial: "",
        telefono: "",
        correo: "",
        direccion: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (campo, valor) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };

    const guardar = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await crearProveedor(form);
            onGuardar();
            onClose();
        } catch (err) {
            setError("Error al guardar el proveedor. Intenta de nuevo.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
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
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            RUC
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={form.ruc}
                            onChange={(e) =>
                                handleChange("ruc", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Razón Social
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={form.razonSocial}
                            onChange={(e) =>
                                handleChange("razonSocial", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={form.telefono}
                            onChange={(e) =>
                                handleChange("telefono", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Correo
                        </label>
                        <input
                            type="email"
                            className={inputClass}
                            value={form.correo}
                            onChange={(e) =>
                                handleChange("correo", e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Dirección
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={form.direccion}
                            onChange={(e) =>
                                handleChange("direccion", e.target.value)
                            }
                            required
                        />
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
