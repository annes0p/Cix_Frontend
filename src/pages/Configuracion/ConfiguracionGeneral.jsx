import { Save } from "lucide-react";
import { useState } from "react";

export default function ConfiguracionGeneral() {
    const [configuracion, setConfiguracion] = useState({
        empresa: "CIXOIL S.A.C.",
        ruc: "20123456789",
        correo: "contacto@cixoil.com",
        telefono: "987654321",
        direccion: "Chiclayo, Perú",
        notificaciones: true,
        stockMinimo: true,
    });
    const [guardado, setGuardado] = useState(false);

    const handleChange = (campo, valor) => {
        setConfiguracion((prev) => ({ ...prev, [campo]: valor }));
    };

    const guardarConfiguracion = () => {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 3000);
    };

    const inputClass =
        "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red";

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Información de la Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Empresa
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={configuracion.empresa}
                            onChange={(e) =>
                                handleChange("empresa", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            RUC
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={configuracion.ruc}
                            onChange={(e) =>
                                handleChange("ruc", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Correo
                        </label>
                        <input
                            type="email"
                            className={inputClass}
                            value={configuracion.correo}
                            onChange={(e) =>
                                handleChange("correo", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={configuracion.telefono}
                            onChange={(e) =>
                                handleChange("telefono", e.target.value)
                            }
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">
                            Dirección
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            value={configuracion.direccion}
                            onChange={(e) =>
                                handleChange("direccion", e.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Notificaciones
                </h3>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            Recibir notificaciones por correo
                        </span>
                        <input
                            type="checkbox"
                            checked={configuracion.notificaciones}
                            onChange={(e) =>
                                handleChange("notificaciones", e.target.checked)
                            }
                            className="w-4 h-4 accent-cixoil-red"
                        />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                            Alertar cuando el stock sea bajo
                        </span>
                        <input
                            type="checkbox"
                            checked={configuracion.stockMinimo}
                            onChange={(e) =>
                                handleChange("stockMinimo", e.target.checked)
                            }
                            className="w-4 h-4 accent-cixoil-red"
                        />
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Seguridad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            className={inputClass}
                            placeholder="********"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            className={inputClass}
                            placeholder="********"
                        />
                    </div>
                </div>
            </div>

            {guardado && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                    ✓ Configuración guardada correctamente.
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={guardarConfiguracion}
                    className="flex items-center gap-2 bg-cixoil-green text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
                >
                    <Save size={18} />
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
}
