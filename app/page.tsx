"use client";

import type React from "react";
import Image from "next/image";
import { useState } from "react";
import { LogIn, User, Lock, Eye, EyeOff, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`RUT: ${rut} - Contraseña: ${password}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen">
      {/* Imagen lado izquierdo con texto encima */}
      <div className="relative w-2/3 h-screen hidden lg:block overflow-hidden animate-slide-in-left">
        <Image
          src="/hospital-real.jpg" // Usando la nueva imagen
          alt="Hospital moderno"
          className="w-full h-full object-cover animate-move-background" // Aplica la animación de movimiento de fondo
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-700/0 to-transparent flex items-start justify-start mt-32">
          <div className="text-start text-white px-8 animate-fade-in-slide animation-delay-[0.4s] drop-shadow-xl ml-10">
            <h1 className="text-5xl font-bold mb-4">
              PORTAL FRACTURA DE CADERA
            </h1>
            <p className="text-2xl opacity-90">
              Acceso a módulos clínicos y de gestión para el monitoreo de
              fracturas de caderas{" "}
            </p>
          </div>
        </div>
      </div>
      {/* Panel de login */}
      <div className="w-full lg:w-1/3 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex flex-col justify-center px-8 lg:px-16 py-12 relative overflow-hidden rounded-lg shadow-2xl animate-fade-in-slide animation-delay-[0.2s] animate-gradient-shift bg-[length:200%_200%]">
        {/* Formas geométricas animadas de fondo */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 animate-float-pulse animation-delay-[0.5s] z-0"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-tl from-blue-200 to-blue-400 rounded-full opacity-20 animate-float-pulse animation-delay-[1s] z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-tr from-blue-100 to-blue-300 rounded-full opacity-20 animate-float-pulse animation-delay-[1.5s] z-0"></div>

        <div className="max-w-md mx-auto w-full z-10">
          <div className="text-center mb-8 animate-fade-in-slide animation-delay-[0.6s]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-blue-700">
              Ingresa tus credenciales para continuar
            </p>
          </div>
          {/* Help text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-md animate-fade-in-slide animation-delay-[0.8s]">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  ¿Tienes problemas para ingresar?
                </p>
                <p className="text-sm text-blue-900 font-semibold">
                  Revisa tu RUT y contraseña o contáctanos
                </p>
              </div>
            </div>
          </div>
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* RUT Input */}
            <div className="animate-fade-in-slide animation-delay-[1s]">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                RUT
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="text-blue-600 w-full pl-10 pr-4 py-3 rounded-lg border border-blue-300 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500" // Aplica el estilo de enfoque con Tailwind
                  placeholder="12.345.678-9"
                  required
                />
              </div>
            </div>
            {/* Password Input */}
            <div className="animate-fade-in-slide animation-delay-[1.2s]">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500" // Aplica el estilo de enfoque con Tailwind
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Forgot Password Link */}
            <div className="text-right animate-fade-in-slide animation-delay-[1.4s]">
              <button
                type="button"
                className="text-sm text-blue-700 hover:text-blue-900 font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md" // Aplica el efecto hover/active con Tailwind
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md animate-fade-in-slide animation-delay-[1.6s]" // Aplica el efecto hover/active con Tailwind
            >
              <LogIn className="w-5 h-5" />
              Ingresar
            </button>
          </form>
          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-slide animation-delay-[1.8s]">
            <p className="text-sm text-blue-600">
              Sistema seguro protegido con encriptación SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
