import { Pencil, Trash2 } from "lucide-react";

export default function ProveedoresTabla({ proveedores, loading, onRecargar }) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">Cargando proveedores...</p>
            </div>
        );
    }

    if (!proveedores.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">
                    No existen proveedores registrados.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Doc
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Numero
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Razon Social
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Telefono
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Correo
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Direccion
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map((proveedor) => (
                        <tr
                            key={proveedor.id}
                            className="border-b hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 text-xs font-mono">
                                {proveedor.documentType}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                                {proveedor.docNumber}
                            </td>
                            <td className="px-4 py-3 font-medium">
                                {proveedor.legalName}
                            </td>
                            <td className="px-4 py-3">
                                {proveedor.phoneNumber}
                            </td>
                            <td className="px-4 py-3">{proveedor.email}</td>
                            <td className="px-4 py-3">{proveedor.address}</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center gap-3">
                                    <button className="text-yellow-500 hover:text-yellow-700">
                                        <Pencil size={16} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    Total proveedores: {proveedores.length}
                </p>
            </div>
        </div>
    );
}
