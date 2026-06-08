import { Settings } from "lucide-react";
import ConfiguracionGeneral from "./ConfiguracionGeneral";

export default function Configuracion() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-cixoil-red">
                        Configuración
                    </h1>
                    <p className="text-sm text-gray-500">
                        Parámetros generales del sistema
                    </p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                    CIXOIL S.A.C.
                </span>
            </div>

            <div className="p-6">
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Settings size={22} className="text-cixoil-red" />
                    </div>
                    <div>
                        <h2 className="font-bold text-cixoil-red text-lg">
                            Configuración General
                        </h2>
                        <p className="text-sm text-gray-500">
                            Administra los parámetros de la empresa y del
                            sistema
                        </p>
                    </div>
                </div>

                <ConfiguracionGeneral />
            </div>
        </div>
    );
}
