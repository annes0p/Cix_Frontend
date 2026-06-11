import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logocixoil from "../../assets/logocixoil.jpeg";
import { authService } from "../../services/authService";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        recordar: false,
    });
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorText("");
        try {
            const data = await authService.login(
                formData.identifier,
                formData.password,
            );
            const token =
                data?.data?.auth?.accessToken ||
                data?.accessToken ||
                data?.token;
            if (token) {
                localStorage.setItem("token", token);
            }
            localStorage.setItem(
                "user",
                JSON.stringify(
                    data?.data?.user ||
                        data?.user || { username: formData.identifier },
                ),
            );
            navigate("/dashboard");
        } catch (err) {
            setErrorText("Usuario o contrasena incorrectos. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 shadow-lg border border-gray-100">
                    <img
                        src={logocixoil}
                        alt="CIXOIL Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Bienvenido a <span className="text-cixoil-red">CIXOIL</span>{" "}
                    <span className="text-cixoil-green">S.A.C.</span>
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    Ingresa tus credenciales para continuar
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Usuario
                    </label>
                    <div className="relative">
                        <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-300 bg-gray-50 focus:bg-white"
                            value={formData.identifier}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    identifier: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Contrasena
                    </label>
                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu contrasena"
                            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-300 bg-gray-50 focus:bg-white"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            id="remember"
                            type="checkbox"
                            className="w-4 h-4 accent-cixoil-red bg-gray-100 border-gray-300 rounded"
                            checked={formData.recordar}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    recordar: e.target.checked,
                                })
                            }
                        />
                        <span className="text-sm font-medium text-gray-600 select-none">
                            Recordarme
                        </span>
                    </label>
                </div>

                {errorText && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        {errorText}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cixoil-red text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-red-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cixoil-red/20 disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Iniciando sesion...
                        </>
                    ) : (
                        "Iniciar sesion"
                    )}
                </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-500">
                Acceso restringido al personal autorizado.{" "}
                <a
                    href="#"
                    className="font-semibold text-cixoil-green hover:underline"
                >
                    Contacta al administrador
                </a>
            </div>
        </div>
    );
}
