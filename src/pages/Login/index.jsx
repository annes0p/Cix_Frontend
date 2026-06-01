import React from 'react';
import LoginLayout from './LoginLayout';
import LoginForm from './LoginForm';

export default function Login() {
    return (
        <div className="min-h-screen w-full flex bg-gray-50 font-sans">
            {/* Mitad Izquierda - Banner Promocional */}
            <LoginLayout />

            {/* Mitad Derecha: Formulario y Derechos */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between items-center p-8 lg:p-12 bg-[#F9FAFB]">
                {/* Div espaciador superior para empujar el form al centro real */}
                <div className="hidden lg:block"></div>

                {/* Formulario de Login */}
                <LoginForm />

                {/* Footer corporativo de seguridad */}
                <div className="flex flex-col items-center text-center gap-3 text-xs text-gray-500 mt-8">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="text-cixoil-green text-sm">🛡️</span>
                        <span>Acceso seguro y protegido</span>
                    </div>
                    <p className="text-gray-400">
                        Tus datos están protegidos con encriptación de nivel empresarial.
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                        © 2025 CIXOIL S.A.C. <span className="mx-1">|</span> Todos los derechos reservados
                    </p>
                </div>
            </div>
        </div>
    );
}