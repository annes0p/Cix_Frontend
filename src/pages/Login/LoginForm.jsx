<<<<<<< Updated upstream
import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import logocixoil from '../../assets/logocixoil.jpeg';
import { authService } from '../../services/authService';
=======
import { Eye, EyeOff, Globe, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logocixoil from "../../assets/logocixoil.jpeg";
import { authService } from "../../services/authService";
>>>>>>> Stashed changes

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        remember: false,
    });
git 
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorText("");

        try {
            const data = await authService.login(
                formData.identifier,
                formData.password,
            );
            const token = data?.data?.auth?.accessToken;
            if (token) {
                localStorage.setItem("token", token);
                navigate("/dashboard");
            }
        } catch (err) {
            setErrorText(
                "Credenciales incorrectas. Verifica tu usuario y contraseña.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
            <div className="absolute -top-14 right-0">
                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Globe size={16} />
                    <span>Español</span>
                    <span className="text-xs">▼</span>
                </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm overflow-hidden">
                    <img
                        src={logocixoil}
                        alt="Cixoil Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
                <h2 className="text-xl font-normal text-gray-900">
                    Bienvenido a <br />
                    <span className="text-2xl font-black tracking-tight text-cixoil-red">
                        CIXOIL
                    </span>{" "}
                    <span className="text-2xl font-black tracking-tight text-cixoil-green">
                        S.A.C.
                    </span>
                </h2>
                <div className="flex items-center gap-3 w-full mt-3">
                    <div className="h-[1px] bg-gradient-to-r from-transparent to-gray-300 flex-1"></div>
                    <p className="text-xs text-cixoil-grayText tracking-wide uppercase">
                        Inicia sesión para continuar
                    </p>
                    <div className="h-[1px] bg-gradient-to-l from-transparent to-gray-300 flex-1"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {errorText && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                        {errorText}
                    </div>
                )}

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
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-400"
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
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Contraseña
                        </label>
                        <a
                            href="#"
                            className="text-xs font-semibold text-cixoil-green hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <div className="relative">
                        <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu contraseña"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cixoil-red focus:border-transparent transition-all placeholder:text-gray-400"
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

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 text-cixoil-green bg-gray-100 border-gray-300 rounded focus:ring-cixoil-green"
                        checked={formData.remember}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                remember: e.target.checked,
                            })
                        }
                    />
                    <label
                        htmlFor="remember"
                        className="ml-2 text-sm font-medium text-gray-700 select-none"
                    >
                        Recordarme
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-cixoil-red text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-900 transition-colors flex items-center justify-center gap-2 group shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verificando...
                        </span>
                    ) : (
                        <>
                            <span>Iniciar sesión</span>
                            <span className="group-hover:translate-x-1 transition-transform">
                                →
                            </span>
                        </>
                    )}
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400">
                        o continúa con
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button
                    type="button"
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.216 1.414 15.48 0 12.24 0 5.523 0 0 5.523 0 12.24s5.523 12.24 12.24 12.24c7.01 0 11.67-4.907 11.67-11.88 0-.8-.085-1.405-.188-1.795H12.24z"
                        />
                    </svg>
                    <span>Continuar con Google</span>
                </button>
            </form>

            <div className="text-center mt-6 text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
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
