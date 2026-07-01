import { AlertTriangle, X } from "lucide-react";

export default function ModalEliminarProducto({
    producto,
    onConfirmar,
    onCancelar,
    loading,
}) {
    if (!producto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={18} className="text-red-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">
                            Eliminar producto
                        </h2>
                    </div>
                    <button
                        onClick={onCancelar}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        ¿Estás seguro de que deseas eliminar{" "}
                        <span className="font-semibold text-gray-900">
                            "{producto.name || producto.nombre}"
                        </span>
                        ?
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                        Esta acción no se puede deshacer.
                    </p>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-5">
                    <button
                        onClick={onCancelar}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() =>
                            onConfirmar(producto.idProducto || producto.id)
                        }
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Sí, eliminar"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
