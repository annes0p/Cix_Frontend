import LoginForm from "./LoginForm";
import LoginLayout from "./LoginLayout";

export default function Login() {
    return (
        <div className="min-h-screen w-full flex bg-gray-50 font-sans">
            <LoginLayout />

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 lg:px-16 bg-white">
                <div className="w-full max-w-md">
                    <LoginForm />

                    <div className="flex flex-col items-center text-center gap-2 text-xs text-gray-400 mt-10 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <span className="w-2 h-2 rounded-full bg-cixoil-green animate-pulse" />
                            Acceso seguro y protegido
                        </div>
                        <p className="text-gray-400">
                            Tus datos estan protegidos con encriptacion de nivel
                            empresarial.
                        </p>
                        <p className="mt-1 text-[11px] text-gray-300">
                            2026 CIXOIL S.A.C. | Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
